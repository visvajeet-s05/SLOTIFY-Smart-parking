"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Clock, 
  User, 
  MapPin, 
  DollarSign, 
  AlertCircle, 
  CheckCircle,
  Bell,
  ChevronRight
} from "lucide-react"

interface Activity {
  id: string
  type: 'booking' | 'user' | 'payment' | 'system' | 'alert'
  title: string
  description: string
  timestamp: Date
  isRead: boolean
  metadata: {
    bookingId?: string
    userId?: string
    amount?: number
    parkingLotId?: string
    status?: string
  }
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'booking',
    title: 'New Booking Confirmed',
    description: 'User booked slot A12 at Downtown Parking',
    timestamp: new Date(Date.now() - 5 * 60000),
    isRead: false,
    metadata: {
      bookingId: 'BK-2024-001',
      userId: 'U-1001',
      parkingLotId: 'PL-DT-001'
    }
  },
  {
    id: '2',
    type: 'payment',
    title: 'Payment Successful',
    description: 'Payment received for booking BK-2024-001',
    timestamp: new Date(Date.now() - 15 * 60000),
    isRead: false,
    metadata: {
      bookingId: 'BK-2024-001',
      amount: 200
    }
  },
  {
    id: '3',
    type: 'user',
    title: 'New User Registered',
    description: 'New customer account created',
    timestamp: new Date(Date.now() - 30 * 60000),
    isRead: true,
    metadata: {
      userId: 'U-1002'
    }
  },
  {
    id: '4',
    type: 'alert',
    title: 'Parking Lot Full',
    description: 'All slots occupied at Airport Parking',
    timestamp: new Date(Date.now() - 60 * 60000),
    isRead: false,
    metadata: {
      parkingLotId: 'PL-AP-001',
      status: 'FULL'
    }
  },
  {
    id: '5',
    type: 'system',
    title: 'System Update',
    description: 'Pricing algorithm re-calibrated',
    timestamp: new Date(Date.now() - 120 * 60000),
    isRead: true,
    metadata: {}
  },
  {
    id: '6',
    type: 'booking',
    title: 'Booking Cancelled',
    description: 'User cancelled booking BK-2024-002',
    timestamp: new Date(Date.now() - 180 * 60000),
    isRead: true,
    metadata: {
      bookingId: 'BK-2024-002',
      userId: 'U-1003'
    }
  }
]

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'booking':
      return <MapPin className="h-4 w-4 text-blue-500" />
    case 'user':
      return <User className="h-4 w-4 text-green-500" />
    case 'payment':
      return <DollarSign className="h-4 w-4 text-emerald-500" />
    case 'alert':
      return <AlertCircle className="h-4 w-4 text-red-500" />
    case 'system':
      return <Bell className="h-4 w-4 text-purple-500" />
    default:
      return <CheckCircle className="h-4 w-4 text-gray-500" />
  }
}

const formatTime = (date: Date) => {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString()
  }
}

export function ActivityTimeline() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    setActivities(mockActivities)
  }, [])

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === filter)

  const unreadCount = activities.filter(a => !a.isRead).length

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-400" />
            Live Activity Timeline
          </h2>
          {unreadCount > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 ml-2">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {['all', 'booking', 'payment', 'alert'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 text-xs rounded-full transition-all ${
                filter === type
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        <AnimatePresence>
          {filteredActivities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className={`p-4 rounded-lg border transition-all ${
                activity.isRead
                  ? 'bg-gray-800/50 border-gray-700'
                  : 'bg-blue-900/10 border-blue-500/20'
              } hover:border-gray-600`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-white">{activity.title}</h3>
                    <span className="text-xs text-gray-400">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {formatTime(activity.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-2">{activity.description}</p>
                  
                  <div className="flex flex-wrap gap-2 text-xs">
                    {activity.metadata.bookingId && (
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                        Booking: {activity.metadata.bookingId}
                      </span>
                    )}
                    {activity.metadata.userId && (
                      <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded">
                        User: {activity.metadata.userId}
                      </span>
                    )}
                    {activity.metadata.amount && (
                      <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">
                        ₹{activity.metadata.amount}
                      </span>
                    )}
                    {activity.metadata.parkingLotId && (
                      <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                        {activity.metadata.parkingLotId}
                      </span>
                    )}
                    {activity.metadata.status && (
                      <span className={`px-2 py-1 rounded ${
                        activity.metadata.status === 'FULL'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {activity.metadata.status}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>No activities matching filter</p>
        </div>
      )}
    </div>
  )
}