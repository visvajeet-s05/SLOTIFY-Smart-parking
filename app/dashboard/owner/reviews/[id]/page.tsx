import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, Star, MessageSquare, ShieldCheck } from "lucide-react"
import Link from "next/link"

const mockMessages = [
  { id: 1, role: "CUSTOMER", name: "Rahul Sharma", text: "The parking spot was great, but the lighting near Slot 12 could be improved. It felt a bit dark at 8 PM.", rating: 4, time: "2 days ago" },
  { id: 2, role: "OWNER", name: "Velachery Parking Admin", text: "Thank you for the feedback, Rahul! We are actually scheduled to upgrade the LED floodlights this Sunday. Hope to see you again soon.", time: "1 day ago" },
  { id: 3, role: "CUSTOMER", name: "Rahul Sharma", text: "That's great to hear! Looking forward to it.", time: "5 hours ago" },
]

export default function OwnerReviewDetailPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="mb-8">
        <Link 
          href="/dashboard/owner/reviews"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back to Reviews
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-white tracking-tight">Review Discussion</h1>
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">RESOLVED</Badge>
        </div>
      </div>

      {/* Main Review Summary */}
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-slate-700">
              <AvatarFallback className="bg-slate-800 text-slate-400">RS</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-white text-base">Rahul Sharma</CardTitle>
              <p className="text-xs text-slate-500">Booking #BK-9021 • March 15, 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
            <Star className="h-4 w-4 text-slate-700" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 leading-relaxed italic">
            "The parking spot was great, but the lighting near Slot 12 could be improved. It felt a bit dark at 8 PM."
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
          <MessageSquare className="h-4 w-4" /> Discussion Thread
        </h3>
        
        <div className="space-y-6">
          {mockMessages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'OWNER' ? 'flex-row-reverse' : ''}`}>
               <Avatar className="h-8 w-8 mt-1 border border-slate-700 shrink-0">
                <AvatarFallback className={msg.role === 'OWNER' ? 'bg-cyan-900 text-cyan-400' : 'bg-slate-800 text-slate-400'}>
                  {msg.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className={`flex flex-col max-w-[80%] ${msg.role === 'OWNER' ? 'items-end' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-400">{msg.name}</span>
                  {msg.role === 'OWNER' && <ShieldCheck className="h-3 w-3 text-cyan-400" />}
                  <span className="text-[10px] text-slate-600 font-medium">{msg.time}</span>
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'OWNER' 
                    ? 'bg-cyan-600 text-white rounded-tr-none' 
                    : 'bg-slate-800 text-slate-300 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reply Input */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl flex items-center gap-2">
          <input 
            type="text" 
            placeholder="Write a message..." 
            className="flex-1 bg-transparent border-none focus:ring-0 text-white px-4 text-sm"
          />
          <Button size="icon" className="h-10 w-10 bg-cyan-600 hover:bg-cyan-500 rounded-xl">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}