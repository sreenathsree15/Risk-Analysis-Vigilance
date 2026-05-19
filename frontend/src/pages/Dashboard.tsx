import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { ShieldAlert, Clock, CheckCircle2, TrendingUp } from "lucide-react"

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, high_severity: 0 })
  const [deptData, setDeptData] = useState<any[]>([])
  const [sevData, setSevData] = useState<any[]>([])

  useEffect(() => {
    fetch("http://localhost:8000/api/cases")
      .then(res => res.json())
      .then(data => {
        const cases = data.cases
        
        // Basic stats
        const pending = cases.filter((c: any) => c.status === "Pending").length
        const resolved = cases.filter((c: any) => c.status === "Resolved").length
        const high = cases.filter((c: any) => c.severity === "High").length
        
        setStats({ total: cases.length, pending, resolved, high_severity: high })

        // Department stats
        const deptCounts = cases.reduce((acc: any, c: any) => {
          acc[c.department] = (acc[c.department] || 0) + 1
          return acc
        }, {})
        const dData = Object.keys(deptCounts).map(k => ({ name: k, value: deptCounts[k] }))
        setDeptData(dData)

        // Severity stats
        const sevCounts = cases.reduce((acc: any, c: any) => {
          acc[c.severity] = (acc[c.severity] || 0) + 1
          return acc
        }, {})
        const sData = Object.keys(sevCounts).map(k => ({ name: k, value: sevCounts[k] }))
        setSevData(sData)
      })
  }, [])

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']
  const SEV_COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' }

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Cases" value={stats.total} icon={<ShieldAlert className="text-blue-500" />} />
        <StatCard title="Pending" value={stats.pending} icon={<Clock className="text-amber-500" />} />
        <StatCard title="Resolved" value={stats.resolved} icon={<CheckCircle2 className="text-emerald-500" />} />
        <StatCard title="High Severity" value={stats.high_severity} icon={<ShieldAlert className="text-red-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases by Department */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Cases by Department</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={deptData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="middle" align="right" layout="vertical" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cases by Severity */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Cases by Severity</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sevData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {sevData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SEV_COLORS[entry.name as keyof typeof SEV_COLORS] || '#000'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Cases Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <OverviewCard title="This Month" value="186" trend="+12%" />
          <OverviewCard title="This Quarter" value="542" trend="+8%" />
          <OverviewCard title="This Year" value="1,248" trend="+20%" />
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
      <div className="p-3 bg-slate-50 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  )
}

function OverviewCard({ title, value, trend }: { title: string, value: string, trend: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <div className="mt-2 flex items-baseline space-x-2">
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        <p className="text-sm font-medium text-emerald-600 flex items-center">
          <TrendingUp className="h-4 w-4 mr-1" />
          {trend}
        </p>
      </div>
    </div>
  )
}

