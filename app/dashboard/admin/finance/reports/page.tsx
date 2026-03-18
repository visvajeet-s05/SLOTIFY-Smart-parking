import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, PieChart, BarChart3, TrendingUp, Calendar } from "lucide-react"

const mockReports = [
  { id: 1, name: "Monthly Revenue Summary", date: "2026-03-01", type: "PDF", size: "1.2 MB" },
  { id: 2, name: "Quarterly Tax Report", date: "2026-01-15", type: "CSV", size: "850 KB" },
  { id: 3, name: "Annual Performance Audit", date: "2025-12-31", type: "PDF", size: "4.5 MB" },
  { id: 4, name: "Weekly Transaction Log", date: "2026-03-15", type: "CSV", size: "2.1 MB" },
]

export default function AdminFinanceReportsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Financial Reports</h1>
          <p className="text-slate-400 mt-1">Generate and export platform-wide financial insights.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-800/50">
            <Calendar className="mr-2 h-4 w-4" /> Filter Period
          </Button>
          <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold">
            <TrendingUp className="mr-2 h-4 w-4" /> Real-time Analytics
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <PieChart className="h-4 w-4 text-cyan-400" /> Platform Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">₹12,45,200</div>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              +14% from last month <TrendingUp className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-400" /> Avg. Transaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">₹142.50</div>
            <p className="text-xs text-slate-500 mt-1">Based on 8,740 bookings</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-400" /> Active Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">1,240</div>
            <p className="text-xs text-emerald-400 mt-1">+52 new this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card className="bg-slate-900/50 border-slate-800 overflow-hidden">
        <CardHeader className="border-b border-slate-800">
          <CardTitle className="text-white text-lg">Available Reports</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-950/50 text-slate-400 border-b border-slate-800">
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Report Name</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Generated Date</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Format</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {mockReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-slate-500" />
                        <span className="text-white font-medium">{report.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{report.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        report.type === "PDF" ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                      }`}>
                        {report.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 gap-2">
                        <Download className="h-4 w-4" /> Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

