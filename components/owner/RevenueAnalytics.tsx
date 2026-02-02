"use client"

import { useState, useEffect } from "react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"

const monthlyRevenue = [
  { name: 'Jan', revenue: 12000, bookings: 150 },
  { name: 'Feb', revenue: 15000, bookings: 180 },
  { name: 'Mar', revenue: 18000, bookings: 220 },
  { name: 'Apr', revenue: 22000, bookings: 260 },
  { name: 'May', revenue: 25000, bookings: 300 },
  { name: 'Jun', revenue: 28000, bookings: 330 }
]

const parkingLotRevenue = [
  { name: 'Downtown', value: 45000, color: '#3B82F6' },
  { name: 'Airport', value: 35000, color: '#8B5CF6' },
  { name: 'Shopping Mall', value: 28000, color: '#EC4899' },
  { name: 'Office Park', value: 22000, color: '#10B981' }
]

const dailyPattern = [
  { hour: '00:00', bookings: 5, revenue: 300 },
  { hour: '04:00', bookings: 10, revenue: 500 },
  { hour: '08:00', bookings: 60, revenue: 3500 },
  { hour: '12:00', bookings: 45, revenue: 2800 },
  { hour: '16:00', bookings: 80, revenue: 4800 },
  { hour: '20:00', bookings: 55, revenue: 3200 },
  { hour: '24:00', bookings: 20, revenue: 1200 }
]

export function RevenueAnalytics() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month')

  const totalRevenue = monthlyRevenue.reduce((sum, item) => sum + item.revenue, 0)
  const avgRevenuePerMonth = totalRevenue / monthlyRevenue.length
  const totalBookings = monthlyRevenue.reduce((sum, item) => sum + item.bookings, 0)

  const lastMonthRevenue = monthlyRevenue[monthlyRevenue.length - 2]?.revenue || 0
  const currentMonthRevenue = monthlyRevenue[monthlyRevenue.length - 1]?.revenue || 0
  const revenueGrowth = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100

  return (
    <div className="space-y-6 p-6 bg-gray-900 rounded-xl border border-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Revenue Analytics
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Track your parking business performance and revenue trends
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-sm bg-gray-800 text-white rounded-lg flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
          <div className="flex bg-gray-800 rounded-lg p-1">
            {['week', 'month', 'quarter', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as any)}
                className={`px-3 py-1 text-sm rounded-md transition-all ${
                  timeRange === range
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Total Revenue</span>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-white">₹{totalRevenue.toLocaleString()}</div>
          <div className="text-sm text-green-400 mt-1">
            <ArrowUpRight className="h-3 w-3 inline mr-1" />
            {revenueGrowth.toFixed(1)}% from last month
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Total Bookings</span>
            <Calendar className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-white">{totalBookings}</div>
          <div className="text-sm text-blue-400 mt-1">
            <ArrowUpRight className="h-3 w-3 inline mr-1" />
            12% increase this period
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Avg. Revenue/Month</span>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-white">₹{avgRevenuePerMonth.toLocaleString()}</div>
          <div className="text-sm text-purple-400 mt-1">
            <ArrowUpRight className="h-3 w-3 inline mr-1" />
            8.5% from last quarter
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-2 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
            <BarChart className="h-4 w-4 text-blue-500" />
            Monthly Revenue (₹)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Parking Lot Distribution */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
            <PieChart className="h-4 w-4 text-purple-500" />
            Revenue by Location
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={parkingLotRevenue}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#1F2937"
                >
                  {parkingLotRevenue.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Booking Pattern */}
        <div className="lg:col-span-3 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
            <LineChart className="h-4 w-4 text-green-500" />
            Daily Booking & Revenue Pattern
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyPattern}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Bookings"
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Revenue (₹)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Revenue Breakdown</h3>
          <div className="space-y-3">
            {parkingLotRevenue.map((lot) => (
              <div key={lot.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lot.color }}></div>
                  <span className="text-sm text-gray-300">{lot.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-white">₹{lot.value.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">
                    {(lot.value / totalRevenue * 100).toFixed(1)}% of total
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Performance Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Revenue per Booking</span>
              <span className="text-sm font-medium text-white">₹{(totalRevenue / totalBookings).toFixed(0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Monthly Average Growth</span>
              <span className="text-sm font-medium text-green-400">+15%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Peak Revenue Hour</span>
              <span className="text-sm font-medium text-blue-400">16:00 - 18:00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Most Popular Location</span>
              <span className="text-sm font-medium text-purple-400">Downtown Parking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}