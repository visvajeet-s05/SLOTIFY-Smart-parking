"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, QrCode, FileText, AlertTriangle } from 'lucide-react'

export default function StaffDashboard() {
  // In a real app, get staff info from context/auth
  const staffRole = 'MANAGER' // This would come from auth context
  const staffName = 'John Doe' // This would come from auth context

  const getDashboardCards = (role: string) => {
    const baseCards = [
      {
        title: 'Profile',
        description: 'View your staff profile',
        icon: <Users className="h-8 w-8 text-blue-500" />,
        href: '/dashboard/staff/profile'
      }
    ]

    if (role === 'MANAGER') {
      return [
        ...baseCards,
        {
          title: 'Bookings',
          description: 'Manage parking bookings',
          icon: <FileText className="h-8 w-8 text-green-500" />,
          href: '/dashboard/staff/bookings'
        },
        {
          title: 'Incidents',
          description: 'Handle parking incidents',
          icon: <AlertTriangle className="h-8 w-8 text-red-500" />,
          href: '/dashboard/staff/incidents'
        }
      ]
    }

    if (role === 'SCANNER') {
      return [
        ...baseCards,
        {
          title: 'QR Scanner',
          description: 'Scan QR codes for verification',
          icon: <QrCode className="h-8 w-8 text-purple-500" />,
          href: '/dashboard/staff/qr'
        }
      ]
    }

    return baseCards
  }

  const dashboardCards = getDashboardCards(staffRole)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, {staffName}</h1>
        <p className="text-gray-400 mt-1">
          {staffRole === 'MANAGER'
            ? 'Manage bookings, incidents, and maintenance for your parking operations.'
            : 'Scan QR codes to verify parking sessions.'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map((card, index) => (
          <Card key={index} className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              {card.icon}
              <CardTitle className="ml-3 text-lg">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Active parking sessions</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Pending resolution</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$156.00</div>
            <p className="text-xs text-muted-foreground">From active sessions</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
