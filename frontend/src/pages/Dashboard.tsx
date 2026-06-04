import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { ShieldAlert, Clock, CheckCircle2, TrendingUp, X, ChevronRight, ArrowLeft } from "lucide-react"

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, high_severity: 0 })
  const [deptData, setDeptData] = useState<any[]>([])
  const [sevData, setSevData] = useState<any[]>([])
  const [allCases, setAllCases] = useState<any[]>([])

  // Drawer states (3-Tier hierarchy)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [activeView, setActiveView] = useState<'districts' | 'district-detail' | 'panchayat-detail'>('districts')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [selectedPanchayat, setSelectedPanchayat] = useState('')
  const [panchayatSearch, setPanchayatSearch] = useState('')

  useEffect(() => {
    fetch("http://localhost:8000/api/cases")
      .then(res => res.json())
      .then(data => {
        const cases = data.cases
        setAllCases(cases)

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

  // ==========================================
  // TIER 1 & TIER 2 CALCULATIONS (District)
  // ==========================================
  const districtCounts = allCases.reduce((acc: Record<string, number>, c: any) => {
    acc[c.district] = (acc[c.district] || 0) + 1
    return acc
  }, {})

  const sortedDistricts = Object.entries(districtCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  const selectedDistrictCases = allCases.filter((c: any) => c.district === selectedDistrict)
  const selectedDistrictTotal = selectedDistrictCases.length
  const selectedDistrictPercentage = allCases.length > 0
    ? ((selectedDistrictTotal / allCases.length) * 100).toFixed(1)
    : "0"

  // Dept counts within district
  const selectedDeptCounts = selectedDistrictCases.reduce((acc: Record<string, number>, c: any) => {
    acc[c.department] = (acc[c.department] || 0) + 1
    return acc
  }, {})
  const sortedSelectedDepts = Object.entries(selectedDeptCounts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))

  const highestDept = sortedSelectedDepts.length > 0 ? sortedSelectedDepts[0] : null

  // Severity counts within district
  const selectedSevCounts = selectedDistrictCases.reduce((acc: Record<string, number>, c: any) => {
    acc[c.severity] = (acc[c.severity] || 0) + 1
    return acc
  }, { High: 0, Medium: 0, Low: 0 })

  // Status counts within district
  const selectedStatusCounts = selectedDistrictCases.reduce((acc: Record<string, number>, c: any) => {
    acc[c.status] = (acc[c.status] || 0) + 1
    return acc
  }, { Pending: 0, "In Progress": 0, Resolved: 0 })

  // Panchayat index list within district
  const districtPanchayatCounts = selectedDistrictCases.reduce((acc: Record<string, number>, c: any) => {
    acc[c.panchayat] = (acc[c.panchayat] || 0) + 1
    return acc
  }, {})

  const sortedDistrictPanchayats = Object.entries(districtPanchayatCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .filter(p => p.name.toLowerCase().includes(panchayatSearch.toLowerCase()))

  // ==========================================
  // TIER 3 CALCULATIONS (Panchayat Deep Dive)
  // ==========================================
  const selectedPanchayatCases = selectedDistrictCases.filter((c: any) => c.panchayat === selectedPanchayat)
  const selectedPanchayatTotal = selectedPanchayatCases.length
  const selectedPanchayatPercentageOfDistrict = selectedDistrictTotal > 0
    ? ((selectedPanchayatTotal / selectedDistrictTotal) * 100).toFixed(1)
    : "0"

  // Dept counts within Panchayat
  const selectedPanchayatDeptCounts = selectedPanchayatCases.reduce((acc: Record<string, number>, c: any) => {
    acc[c.department] = (acc[c.department] || 0) + 1
    return acc
  }, {})
  const sortedSelectedPanchayatDepts = Object.entries(selectedPanchayatDeptCounts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))

  const highestPanchayatDept = sortedSelectedPanchayatDepts.length > 0 ? sortedSelectedPanchayatDepts[0] : null

  // Severity counts within Panchayat
  const selectedPanchayatSevCounts = selectedPanchayatCases.reduce((acc: Record<string, number>, c: any) => {
    acc[c.severity] = (acc[c.severity] || 0) + 1
    return acc
  }, { High: 0, Medium: 0, Low: 0 })

  // Status counts within Panchayat
  const selectedPanchayatStatusCounts = selectedPanchayatCases.reduce((acc: Record<string, number>, c: any) => {
    acc[c.status] = (acc[c.status] || 0) + 1
    return acc
  }, { Pending: 0, "In Progress": 0, Resolved: 0 })

  return (
    <div className="space-y-6">
      {/* Dynamic inline styles for smooth side-panel animations */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-in {
          animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.25s ease-out forwards;
        }
      `}</style>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Cases"
          value={stats.total}
          icon={<ShieldAlert className="text-blue-500" />}
          onClick={() => {
            setActiveView('districts')
            setIsDrawerOpen(true)
          }}
        />
        <StatCard title="Pending" value={stats.pending} icon={<Clock className="text-amber-500" />} />
        <StatCard title="Resolved" value={stats.resolved} icon={<CheckCircle2 className="text-emerald-500" />} />
        <StatCard title="High Severity" value={stats.high_severity} icon={<ShieldAlert className="text-red-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases by Department */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Cases by Category</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={deptData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {deptData.map((_, index) => (
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

      {/* Slide-over Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Main Slide-over Panel */}
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in overflow-hidden border-l border-slate-200">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3">
                {activeView !== 'districts' && (
                  <button
                    onClick={() => {
                      if (activeView === 'panchayat-detail') {
                        setActiveView('district-detail')
                      } else {
                        setActiveView('districts')
                      }
                    }}
                    className="p-1.5 hover:bg-slate-200/80 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                )}
                <div>
                  <h3 className="text-base md:text-lg font-bold text-slate-950">
                    {activeView === 'districts' ? 'Statewide District Leaderboard' :
                      activeView === 'district-detail' ? `${selectedDistrict} Analytics` :
                        `${selectedPanchayat} Panchayat`}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {activeView === 'districts' ? 'Select a district for a full deep-dive' :
                      activeView === 'district-detail' ? `Detailed breakdown of ${selectedDistrictTotal} cases` :
                        `${selectedDistrict} District  •  ${selectedPanchayatTotal} cases`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 hover:bg-slate-200/80 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeView === 'districts' ? (
                /* VIEW 1: District Leaderboard */
                <div className="space-y-4">
                  {sortedDistricts.map((dist, idx) => {
                    const pct = allCases.length > 0 ? ((dist.count / allCases.length) * 100).toFixed(1) : "0";
                    return (
                      <div
                        key={dist.name}
                        onClick={() => {
                          setSelectedDistrict(dist.name)
                          setPanchayatSearch('')
                          setActiveView('district-detail')
                        }}
                        className="p-4 rounded-xl border border-slate-200 hover:border-blue-200 bg-white hover:bg-blue-50/5 cursor-pointer shadow-xs hover:shadow-sm transition-all flex items-center justify-between group animate-fade-in"
                      >
                        <div className="space-y-1.5 flex-1 pr-4">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                              {idx + 1}. {dist.name}
                            </span>
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 group-hover:bg-blue-50 group-hover:text-blue-700 px-2.5 py-0.5 rounded-full transition-colors">
                              {dist.count} cases
                            </span>
                          </div>

                          {/* Progress bar container */}
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${pct}%` }}
                              className="h-full bg-blue-500 rounded-full transition-all group-hover:bg-blue-600"
                            />
                          </div>
                          <p className="text-xs text-slate-400 font-medium">
                            {pct}% of statewide cases
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    )
                  })}
                </div>
              ) : activeView === 'district-detail' ? (
                /* VIEW 2: District Deep Dive */
                <div className="space-y-6 animate-fade-in">
                  {/* Share Info Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-6 rounded-xl border border-blue-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Statewide Share</p>
                      <h4 className="text-3xl font-extrabold text-blue-900 mt-1">{selectedDistrictPercentage}%</h4>
                      <p className="text-sm font-medium text-blue-700/80 mt-0.5">of all cases are in {selectedDistrict}</p>
                    </div>
                    <div className="bg-white/90 p-4 rounded-xl shadow-xs border border-blue-50 flex flex-col items-center">
                      <span className="text-xs font-bold text-slate-500">Cases</span>
                      <span className="text-3xl font-black text-slate-800">{selectedDistrictTotal}</span>
                    </div>
                  </div>

                  {/* Highest Department Highlight */}
                  {highestDept && (
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center space-x-3.5">
                      <div className="p-2.5 bg-white rounded-lg border border-emerald-100 shadow-xs">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Highest District Grievances</p>
                        <p className="text-sm text-slate-700 font-medium mt-0.5">
                          <span className="font-bold text-emerald-950">{highestDept[0]}</span> has the highest volume with <span className="font-bold text-emerald-950">{highestDept[1]}</span> cases in this district.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Department Breakdown */}
                  <div className="space-y-3.5 bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department Leaderboard</h4>
                    <div className="space-y-3">
                      {sortedSelectedDepts.map(([name, count]) => {
                        const pct = selectedDistrictTotal > 0 ? ((count / selectedDistrictTotal) * 100).toFixed(0) : "0"
                        return (
                          <div key={name} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold text-slate-700">
                              <span>{name}</span>
                              <span className="text-slate-500">{count} cases ({pct}%)</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${pct}%` }}
                                className="h-full bg-indigo-500 rounded-full"
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Severity Levels */}
                  <div className="space-y-4 bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Severity Allocation</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <SeverityMiniCard title="High" count={selectedSevCounts.High} colorClass="bg-red-50 text-red-700 border-red-100" indicatorBg="bg-red-500" />
                      <SeverityMiniCard title="Medium" count={selectedSevCounts.Medium} colorClass="bg-amber-50 text-amber-700 border-amber-100" indicatorBg="bg-amber-500" />
                      <SeverityMiniCard title="Low" count={selectedSevCounts.Low} colorClass="bg-emerald-50 text-emerald-700 border-emerald-100" indicatorBg="bg-emerald-500" />
                    </div>
                  </div>

                  {/* Status Breakdown */}
                  <div className="space-y-4 bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Case Progression</h4>
                    <div className="space-y-3">
                      <ProgressStatusRow title="Pending" count={selectedStatusCounts.Pending} total={selectedDistrictTotal} colorClass="bg-amber-500" textClass="text-amber-700" />
                      <ProgressStatusRow title="In Progress" count={selectedStatusCounts["In Progress"]} total={selectedDistrictTotal} colorClass="bg-blue-500" textClass="text-blue-700" />
                      <ProgressStatusRow title="Resolved" count={selectedStatusCounts.Resolved} total={selectedDistrictTotal} colorClass="bg-emerald-500" textClass="text-emerald-700" />
                    </div>
                  </div>

                  {/* Searchable Panchayat Directory */}
                  <div className="space-y-4 bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Panchayat Directory</h4>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {sortedDistrictPanchayats.length} Panchayats
                      </span>
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={`Search panchayats in ${selectedDistrict}...`}
                        value={panchayatSearch}
                        onChange={(e) => setPanchayatSearch(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>

                    {/* Scrollable list */}
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {sortedDistrictPanchayats.length > 0 ? (
                        sortedDistrictPanchayats.map((p) => (
                          <div
                            key={p.name}
                            onClick={() => {
                              setSelectedPanchayat(p.name)
                              setActiveView('panchayat-detail')
                            }}
                            className="p-3 bg-white hover:bg-blue-50/5 border border-slate-200 hover:border-blue-200 rounded-lg cursor-pointer flex items-center justify-between group transition-all"
                          >
                            <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                              {p.name}
                            </span>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 group-hover:bg-blue-50 group-hover:text-blue-700 px-2 py-0.5 rounded-full transition-colors">
                                {p.count} cases
                              </span>
                              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-all" />
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic text-center py-4">No panchayats match your search</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* VIEW 3: Panchayat Deep Dive */
                <div className="space-y-6 animate-fade-in">
                  {/* Share Info Card */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50/50 p-6 rounded-xl border border-indigo-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">District Contribution</p>
                      <h4 className="text-3xl font-extrabold text-indigo-900 mt-1">{selectedPanchayatPercentageOfDistrict}%</h4>
                      <p className="text-sm font-medium text-indigo-700/80 mt-0.5">of {selectedDistrict} cases are here</p>
                    </div>
                    <div className="bg-white/90 p-4 rounded-xl shadow-xs border border-indigo-50 flex flex-col items-center">
                      <span className="text-xs font-bold text-slate-500">Cases</span>
                      <span className="text-3xl font-black text-slate-800">{selectedPanchayatTotal}</span>
                    </div>
                  </div>

                  {/* Highest Department Highlight */}
                  {highestPanchayatDept && (
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center space-x-3.5">
                      <div className="p-2.5 bg-white rounded-lg border border-emerald-100 shadow-xs">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Top Sector Grievance</p>
                        <p className="text-sm text-slate-700 font-medium mt-0.5">
                          <span className="font-bold text-emerald-950">{highestPanchayatDept[0]}</span> has the most cases (<span className="font-bold text-emerald-950">{highestPanchayatDept[1]}</span>) inside {selectedPanchayat} Panchayat.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Department Breakdown */}
                  <div className="space-y-3.5 bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department Split</h4>
                    <div className="space-y-3">
                      {sortedSelectedPanchayatDepts.map(([name, count]) => {
                        const pct = selectedPanchayatTotal > 0 ? ((count / selectedPanchayatTotal) * 100).toFixed(0) : "0"
                        return (
                          <div key={name} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold text-slate-700">
                              <span>{name}</span>
                              <span className="text-slate-500">{count} cases ({pct}%)</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${pct}%` }}
                                className="h-full bg-purple-500 rounded-full"
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Severity Levels */}
                  <div className="space-y-4 bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Severity Allocation</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <SeverityMiniCard title="High" count={selectedPanchayatSevCounts.High} colorClass="bg-red-50 text-red-700 border-red-100" indicatorBg="bg-red-500" />
                      <SeverityMiniCard title="Medium" count={selectedPanchayatSevCounts.Medium} colorClass="bg-amber-50 text-amber-700 border-amber-100" indicatorBg="bg-amber-500" />
                      <SeverityMiniCard title="Low" count={selectedPanchayatSevCounts.Low} colorClass="bg-emerald-50 text-emerald-700 border-emerald-100" indicatorBg="bg-emerald-500" />
                    </div>
                  </div>

                  {/* Status Progression */}
                  <div className="space-y-4 bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Case Progression</h4>
                    <div className="space-y-3">
                      <ProgressStatusRow title="Pending" count={selectedPanchayatStatusCounts.Pending} total={selectedPanchayatTotal} colorClass="bg-amber-500" textClass="text-amber-700" />
                      <ProgressStatusRow title="In Progress" count={selectedPanchayatStatusCounts["In Progress"]} total={selectedPanchayatTotal} colorClass="bg-blue-500" textClass="text-blue-700" />
                      <ProgressStatusRow title="Resolved" count={selectedPanchayatStatusCounts.Resolved} total={selectedPanchayatTotal} colorClass="bg-emerald-500" textClass="text-emerald-700" />
                    </div>
                  </div>

                  {/* Grievance Timeline Log */}
                  <div className="space-y-4 bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Case Records</h4>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {selectedPanchayatTotal} Records
                      </span>
                    </div>

                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {selectedPanchayatCases.map((c) => (
                        <div key={c.caseId} className="p-3 bg-white border border-slate-200 rounded-lg space-y-2 shadow-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-800">{c.caseId}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${c.status === "Pending" ? "bg-amber-100 text-amber-800" :
                                c.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                                  "bg-emerald-100 text-emerald-800"
                              }`}>
                              {c.status}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-slate-500">
                            <div>
                              <span className="font-semibold text-slate-400">Dept: </span>
                              <span className="font-bold text-slate-700">{c.department}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-slate-400">Severity: </span>
                              <span className={`font-bold ${c.severity === "High" ? "text-red-600" :
                                  c.severity === "Medium" ? "text-amber-600" :
                                    "text-emerald-600"
                                }`}>{c.severity}</span>
                            </div>
                          </div>

                          <div className="text-[9px] text-slate-400 flex items-center justify-between border-t border-slate-100 pt-1.5">
                            <span>{c.date}</span>
                            <span>{c.district}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value, icon, onClick }: { title: string, value: string | number, icon: React.ReactNode, onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4 ${onClick ? 'cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group' : ''}`}
    >
      <div className={`p-3 bg-slate-50 rounded-lg transition-colors ${onClick ? 'group-hover:bg-blue-50' : ''}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className="flex items-center space-x-1.5">
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {onClick && (
            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              View Insights
            </span>
          )}
        </div>
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

function SeverityMiniCard({ title, count, colorClass, indicatorBg }: { title: string, count: number, colorClass: string, indicatorBg: string }) {
  return (
    <div className={`p-3 rounded-xl border flex flex-col items-center ${colorClass}`}>
      <span className="text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${indicatorBg}`} />
        <span>{title}</span>
      </span>
      <span className="text-lg font-extrabold mt-1">{count}</span>
    </div>
  )
}

function ProgressStatusRow({ title, count, total, colorClass, textClass }: { title: string, count: number, total: number, colorClass: string, textClass: string }) {
  const pct = total > 0 ? ((count / total) * 100).toFixed(0) : "0"
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-semibold">
        <span className={textClass}>{title}</span>
        <span className="text-slate-600">{count} cases ({pct}%)</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          style={{ width: `${pct}%` }}
          className={`h-full ${colorClass} rounded-full`}
        />
      </div>
    </div>
  )
}

