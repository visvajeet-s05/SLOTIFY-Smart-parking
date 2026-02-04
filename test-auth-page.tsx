'use client'

import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'
import { Calendar, Bell, Search, Menu, ArrowRight, MessageSquare, FileText, ChevronRight, Zap, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

const Dashboard = () => {
  // Sample data
  const monthlyData = [
    { month: 'Jan', revenue: 12000, bookings: 150 },
    { month: 'Feb', revenue: 14000, bookings: 175 },
    { month: 'Mar', revenue: 16000, bookings: 200 },
    { month: 'Apr', revenue: 18000, bookings: 225 },
    { month: 'May', revenue: 20000, bookings: 250 },
    { month: 'Jun', revenue: 22000, bookings: 275 },
  ]

  const parkingLotData = [
    { name: 'Central Park', spaces: 30, occupied: 25, available: 5, revenue: 12000, status: 'Active' },
    { name: 'City Plaza', spaces: 40, occupied: 35, available: 5, revenue: 18000, status: 'Active' },
    { name: 'Downtown Garage', spaces: 50, occupied: 40, available: 10, revenue: 24000, status: 'Active' },
    { name: 'East End Parking', spaces: 35, occupied: 25, available: 10, revenue: 14000, status: 'Maintenance' },
    { name: 'Westside Garage', spaces: 45, occupied: 30, available: 15, revenue: 16000, status: 'Active' },
  ]

  const activityData = [
    { id: 1, time: '2 mins ago', type: 'Booking', message: 'New booking at Central Park Parking', user: 'John Doe', status: 'Success' },
    { id: 2, time: '5 mins ago', type: 'Payment', message: 'Payment received for City Plaza Parking', user: 'Jane Smith', status: 'Paid' },
    { id: 3, time: '10 mins ago', type: 'Maintenance', message: 'Parking lot status updated to Maintenance', user: 'Admin', status: 'Alert' },
    { id: 4, time: '15 mins ago', type: 'Booking', message: 'New booking at Downtown Garage', user: 'Mike Johnson', status: 'Success' },
    { id: 5, time: '20 mins ago', type: 'Parking', message: 'Car entered Westside Garage', user: 'Sarah Wilson', status: 'Info' },
  ]

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-800">Slotify</h1>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2 w-full max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search for parking lots, bookings, etc..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
            <Avatar>
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:block h-screen sticky top-16">
          <nav className="p-4 space-y-2">
            <Button className="w-full justify-start bg-indigo-600 hover:bg-indigo-700 text-white">
              <Zap className="h-5 w-5 mr-2" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Calendar className="h-5 w-5 mr-2" />
              Bookings
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Shield className="h-5 w-5 mr-2" />
              Parking Areas
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <FileText className="h-5 w-5 mr-2" />
              Reports
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <MessageSquare className="h-5 w-5 mr-2" />
              Support
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <ChevronRight className="h-5 w-5 mr-2" />
              Settings
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, John!</h1>
              <p className="text-gray-500">Here's what's happening with your parking lots today.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">$8,400</p>
                      <p className="text-sm text-green-500 mt-1">+12% from last month</p>
                    </div>
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">₹</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">120</p>
                      <p className="text-sm text-green-500 mt-1">+8% from last week</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">B</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Active Parking Lots</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">25</p>
                      <p className="text-sm text-red-500 mt-1">-2% from last month</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">P</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Active Users</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">340</p>
                      <p className="text-sm text-green-500 mt-1">+15% from last week</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">U</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <Card className="lg:col-span-2">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Revenue and Bookings</h3>
                    <Tabs defaultValue="weekly" className="w-[200px]">
                      <TabsList>
                        <TabsTrigger value="weekly">Weekly</TabsTrigger>
                        <TabsTrigger value="monthly">Monthly</TabsTrigger>
                        <TabsTrigger value="yearly">Yearly</TabsTrigger>
                      </TabsList>
                      <TabsContent value="weekly" className="mt-2">
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} name="Revenue" />
                            <Line type="monotone" dataKey="bookings" stroke="#82ca9d" strokeWidth={2} name="Bookings" />
                          </LineChart>
                        </ResponsiveContainer>
                      </TabsContent>
                      <TabsContent value="monthly" className="mt-2">
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} name="Revenue" />
                            <Line type="monotone" dataKey="bookings" stroke="#82ca9d" strokeWidth={2} name="Bookings" />
                          </LineChart>
                        </ResponsiveContainer>
                      </TabsContent>
                      <TabsContent value="yearly" className="mt-2">
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} name="Revenue" />
                            <Line type="monotone" dataKey="bookings" stroke="#82ca9d" strokeWidth={2} name="Bookings" />
                          </LineChart>
                        </ResponsiveContainer>
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} name="Revenue" />
                        <Line type="monotone" dataKey="bookings" stroke="#82ca9d" strokeWidth={2} name="Bookings" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Parking Lot Distribution</h3>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={parkingLotData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          dataKey="spaces"
                        >
                          {parkingLotData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Parking Lots Table */}
            <Card className="mb-8">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Parking Lots</h3>
                  <Button>Add Parking Lot</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-4 text-sm font-medium text-gray-600">Name</th>
                        <th className="p-4 text-sm font-medium text-gray-600">Total Spaces</th>
                        <th className="p-4 text-sm font-medium text-gray-600">Occupied</th>
                        <th className="p-4 text-sm font-medium text-gray-600">Available</th>
                        <th className="p-4 text-sm font-medium text-gray-600">Revenue</th>
                        <th className="p-4 text-sm font-medium text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parkingLotData.map((lot, index) => (
                        <tr key={index} className="border-b border-gray-200">
                          <td className="p-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3"></div>
                              <div>
                                <p className="font-medium text-gray-900">{lot.name}</p>
                                <p className="text-sm text-gray-500">Lot #{index + 1}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-gray-700">{lot.spaces}</td>
                          <td className="p-4 text-sm text-gray-700">{lot.occupied}</td>
                          <td className="p-4 text-sm text-gray-700">{lot.available}</td>
                          <td className="p-4 text-sm font-medium text-gray-900">${lot.revenue.toLocaleString()}</td>
                          <td className="p-4">
                            <Badge variant={lot.status === 'Active' ? 'default' : 'secondary'}>
                              {lot.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  <Button variant="ghost" className="text-sm text-gray-600">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityData.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.status === 'Success' ? 'bg-green-100 text-green-600' :
                          activity.status === 'Paid' ? 'bg-blue-100 text-blue-600' :
                          activity.status === 'Alert' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {activity.type === 'Booking' && <Calendar className="h-4 w-4" />}
                          {activity.type === 'Payment' && <FileText className="h-4 w-4" />}
                          {activity.type === 'Maintenance' && <Shield className="h-4 w-4" />}
                          {activity.type === 'Parking' && <MessageSquare className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{activity.message}</p>
                          <p className="text-sm text-gray-500">{activity.user} • {activity.time}</p>
                        </div>
                      </div>
                      <Badge variant={
                        activity.status === 'Success' ? 'default' :
                        activity.status === 'Paid' ? 'secondary' :
                        activity.status === 'Alert' ? 'destructive' :
                        'outline'
                      }>
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard