'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, TrendingDown, AlertTriangle, Settings, Activity, DollarSign, Users, MapPin } from 'lucide-react'
import { format } from 'date-fns'

interface PricingStats {
  totalParkingLots: number
  activeEvents: number
  totalRevenue: number
  averageOccupancy: number
}

interface Event {
  id: string
  name: string
  description: string
  lat: number
  lng: number
  radiusKm: number
  startTime: string
  endTime: string
  surgeMultiplier: number
  active: boolean
  createdBy: string
}

interface PriceAudit {
  id: string
  parkingLotId: string
  oldPrice: number
  newPrice: number
  reason: string
  triggeredBy: string
  createdAt: string
}

export default function AdminPricingDashboard() {
  const [stats, setStats] = useState<PricingStats | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [auditLogs, setAuditLogs] = useState<PriceAudit[]>([])
  const [loading, setLoading] = useState(true)
  const [killSwitchEnabled, setKillSwitchEnabled] = useState(false)
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    lat: '',
    lng: '',
    radiusKm: '',
    startTime: '',
    endTime: '',
    surgeMultiplier: '1.3'
  })

  useEffect(() => {
    fetchPricingData()
    fetchKillSwitchStatus()
  }, [])

  const fetchPricingData = async () => {
    try {
      const [statsRes, eventsRes, auditRes] = await Promise.all([
        fetch('/api/admin/pricing/stats'),
        fetch('/api/admin/pricing/events'),
        fetch('/api/admin/pricing/audit')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json()
        setEvents(eventsData)
      }

      if (auditRes.ok) {
        const auditData = await auditRes.json()
        setAuditLogs(auditData)
      }
    } catch (error) {
      console.error('Failed to fetch pricing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchKillSwitchStatus = async () => {
    try {
      const response = await fetch('/api/admin/pricing/kill-switch')
      if (response.ok) {
        const data = await response.json()
        setKillSwitchEnabled(data.enabled)
      }
    } catch (error) {
      console.error('Failed to fetch kill switch status:', error)
    }
  }

  const toggleKillSwitch = async () => {
    try {
      const response = await fetch('/api/admin/pricing/kill-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !killSwitchEnabled })
      })

      if (response.ok) {
        setKillSwitchEnabled(!killSwitchEnabled)
      }
    } catch (error) {
      console.error('Failed to toggle kill switch:', error)
    }
  }

  const createEvent = async () => {
    try {
      const response = await fetch('/api/admin/pricing/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newEvent,
          lat: parseFloat(newEvent.lat),
          lng: parseFloat(newEvent.lng),
          radiusKm: parseFloat(newEvent.radiusKm),
          surgeMultiplier: parseFloat(newEvent.surgeMultiplier)
        })
      })

      if (response.ok) {
        fetchPricingData()
        setNewEvent({
          name: '',
          description: '',
          lat: '',
          lng: '',
          radiusKm: '',
          startTime: '',
          endTime: '',
          surgeMultiplier: '1.3'
        })
      }
    } catch (error) {
      console.error('Failed to create event:', error)
    }
  }

  const toggleEvent = async (eventId: string, active: boolean) => {
    try {
      const response = await fetch(`/api/admin/pricing/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active })
      })

      if (response.ok) {
        fetchPricingData()
      }
    } catch (error) {
      console.error('Failed to toggle event:', error)
    }
  }

  if (loading) {
    return <div className="p-6">Loading pricing dashboard...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Pricing Dashboard</h1>
          <p className="text-muted-foreground">Monitor and control dynamic pricing system</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="kill-switch">Kill Switch</Label>
            <Switch
              id="kill-switch"
              checked={killSwitchEnabled}
              onCheckedChange={toggleKillSwitch}
            />
          </div>
          <Badge variant={killSwitchEnabled ? "destructive" : "default"}>
            {killSwitchEnabled ? "EMERGENCY MODE" : "NORMAL"}
          </Badge>
        </div>
      </div>

      {/* Kill Switch Alert */}
      {killSwitchEnabled && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Emergency kill switch is enabled. Dynamic pricing is disabled for all parking lots.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Parking Lots</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalParkingLots || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeEvents || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalRevenue?.toFixed(2) || '0.00'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Occupancy</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageOccupancy?.toFixed(1) || '0'}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Surge Events</TabsTrigger>
          <TabsTrigger value="audit">Price Audit Log</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Surge Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Surge Pricing Events</h2>

            <Dialog>
              <DialogTrigger asChild>
                <Button>Create Event</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Surge Event</DialogTitle>
                  <DialogDescription>
                    Create a geographic surge pricing event that will increase prices in the specified area.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Event Name</Label>
                      <Input
                        id="name"
                        value={newEvent.name}
                        onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                        placeholder="Concert at Stadium"
                      />
                    </div>
                    <div>
                      <Label htmlFor="surgeMultiplier">Surge Multiplier</Label>
                      <Input
                        id="surgeMultiplier"
                        type="number"
                        step="0.1"
                        value={newEvent.surgeMultiplier}
                        onChange={(e) => setNewEvent({...newEvent, surgeMultiplier: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                      placeholder="Major event causing high demand"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="lat">Latitude</Label>
                      <Input
                        id="lat"
                        type="number"
                        step="0.000001"
                        value={newEvent.lat}
                        onChange={(e) => setNewEvent({...newEvent, lat: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lng">Longitude</Label>
                      <Input
                        id="lng"
                        type="number"
                        step="0.000001"
                        value={newEvent.lng}
                        onChange={(e) => setNewEvent({...newEvent, lng: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="radius">Radius (km)</Label>
                      <Input
                        id="radius"
                        type="number"
                        value={newEvent.radiusKm}
                        onChange={(e) => setNewEvent({...newEvent, radiusKm: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="datetime-local"
                        value={newEvent.startTime}
                        onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="datetime-local"
                        value={newEvent.endTime}
                        onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={createEvent} className="w-full">
                  Create Surge Event
                </Button>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Multiplier</TableHead>
                  <TableHead>Time Range</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{event.name}</div>
                        <div className="text-sm text-muted-foreground">{event.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {event.lat.toFixed(4)}, {event.lng.toFixed(4)}
                      <br />
                      <span className="text-sm text-muted-foreground">{event.radiusKm}km radius</span>
                    </TableCell>
                    <TableCell>{event.surgeMultiplier}x</TableCell>
                    <TableCell>
                      {format(new Date(event.startTime), 'MMM dd, HH:mm')} -
                      {format(new Date(event.endTime), 'HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={event.active ? "default" : "secondary"}>
                        {event.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleEvent(event.id, !event.active)}
                      >
                        {event.active ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="space-y-4">
          <h2 className="text-xl font-semibold">Price Change Audit Log</h2>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parking Lot</TableHead>
                  <TableHead>Price Change</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Triggered By</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((audit) => (
                  <TableRow key={audit.id}>
                    <TableCell className="font-mono text-sm">{audit.parkingLotId}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {audit.newPrice > audit.oldPrice ? (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-green-500" />
                        )}
                        ${audit.oldPrice.toFixed(2)} → ${audit.newPrice.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{audit.reason}</Badge>
                    </TableCell>
                    <TableCell>{audit.triggeredBy || 'SYSTEM'}</TableCell>
                    <TableCell>{format(new Date(audit.createdAt), 'MMM dd, HH:mm')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <h2 className="text-xl font-semibold">Pricing Settings</h2>

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Global Settings</CardTitle>
                <CardDescription>Configure system-wide pricing parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Emergency Kill Switch</Label>
                    <p className="text-sm text-muted-foreground">
                      Disable all dynamic pricing immediately
                    </p>
                  </div>
                  <Switch checked={killSwitchEnabled} onCheckedChange={toggleKillSwitch} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Price Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow system to automatically update prices
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Surge Event Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify owners when surge events affect their lots
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Multiplier Limits</CardTitle>
                <CardDescription>Set maximum and minimum price multipliers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minMultiplier">Minimum Multiplier</Label>
                    <Input id="minMultiplier" type="number" step="0.1" defaultValue="0.5" />
                  </div>
                  <div>
                    <Label htmlFor="maxMultiplier">Maximum Multiplier</Label>
                    <Input id="maxMultiplier" type="number" step="0.1" defaultValue="3.0" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
