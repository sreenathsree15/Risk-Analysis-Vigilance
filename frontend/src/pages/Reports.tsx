import { useState, useEffect } from "react"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Download, FileSpreadsheet } from "lucide-react"

export default function Reports() {
  const [allCases, setAllCases] = useState<any[]>([])
  const [reportData, setReportData] = useState<any>(null)
  
  const [reportType, setReportType] = useState("department")
  const [department, setDepartment] = useState("All")
  const [severity, setSeverity] = useState("All")
  const [status, setStatus] = useState("All")

  useEffect(() => {
    fetch("http://localhost:8000/api/cases")
      .then(res => res.json())
      .then(data => setAllCases(data.cases))
  }, [])

  const generateReport = () => {
    let data = allCases
    if (department !== "All") data = data.filter(c => c.department === department)
    if (severity !== "All") data = data.filter(c => c.severity === severity)
    if (status !== "All") data = data.filter(c => c.status === status)

    if (reportType === "department") {
      const counts = data.reduce((acc: any, c: any) => {
        acc[c.department] = (acc[c.department] || 0) + 1
        return acc
      }, {})
      setReportData(Object.keys(counts).map(k => ({ name: k, count: counts[k] })))
    } else if (reportType === "panchayat") {
      const counts = data.reduce((acc: any, c: any) => {
        acc[c.panchayat] = (acc[c.panchayat] || 0) + 1
        return acc
      }, {})
      const sorted = Object.keys(counts).map(k => ({ name: k, count: counts[k] })).sort((a, b) => b.count - a.count).slice(0, 5)
      setReportData(sorted)
    } else if (reportType === "monthly") {
      const counts = data.reduce((acc: any, c: any) => {
        const d = new Date(c.date)
        const monthYear = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`
        acc[monthYear] = (acc[monthYear] || 0) + 1
        return acc
      }, {})
      setReportData(Object.keys(counts).map(k => ({ name: k, count: counts[k] })))
    }
  }

  const downloadCSV = () => {
    if (!reportData) return
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Count\n" 
      + reportData.map((e: any) => `${e.name},${e.count}`).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `report_${reportType}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Filters Sidebar */}
      <div className="w-full md:w-72 space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Report Filters</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Report Type</label>
              <select className="w-full border border-slate-300 rounded-md p-2 text-sm" value={reportType} onChange={e => setReportType(e.target.value)}>
                <option value="department">Department-wise</option>
                <option value="panchayat">Panchayat-wise (Top 5)</option>
                <option value="monthly">Monthly Trend</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <select className="w-full border border-slate-300 rounded-md p-2 text-sm" value={department} onChange={e => setDepartment(e.target.value)}>
                <option value="All">All</option>
                <option value="LSGD">LSGD</option>
                <option value="Health">Health</option>
                <option value="PWD">PWD</option>
                <option value="Education">Education</option>
                <option value="Others">Others</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Severity</label>
              <select className="w-full border border-slate-300 rounded-md p-2 text-sm" value={severity} onChange={e => setSeverity(e.target.value)}>
                <option value="All">All</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select className="w-full border border-slate-300 rounded-md p-2 text-sm" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            
            <button 
              onClick={generateReport}
              className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Generate Report
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Export</h3>
          <button 
            onClick={downloadCSV}
            disabled={!reportData}
            className="w-full py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors font-medium flex items-center justify-center disabled:opacity-50"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Download CSV
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        {reportData ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-800">
                {reportType === "department" ? "Cases by Department" : 
                 reportType === "panchayat" ? "Top 5 Panchayats" : "Monthly Trend"}
              </h3>
            </div>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                {reportType === "monthly" ? (
                  <LineChart data={reportData} margin={{ top: 5, right: 30, left: 40, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} tick={{fontSize: 12}} />
                    <YAxis />
                    <Tooltip />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
                  </LineChart>
                ) : (
                  <BarChart data={reportData} layout={reportType === "panchayat" ? "vertical" : "horizontal"} margin={{ top: 5, right: 30, left: reportType === "panchayat" ? 100 : 20, bottom: reportType === "department" ? 5 : 25 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={reportType === "department"} vertical={reportType === "panchayat"} />
                    <XAxis 
                      type={reportType === "panchayat" ? "number" : "category"} 
                      dataKey={reportType === "department" ? "name" : undefined} 
                    />
                    <YAxis 
                      type={reportType === "panchayat" ? "category" : "number"} 
                      dataKey={reportType === "panchayat" ? "name" : undefined} 
                      width={reportType === "panchayat" ? 120 : 40}
                      tick={{fontSize: 12}}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 4, 4]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
            <BarChart className="h-16 w-16 mb-4 opacity-20" />
            <p>Select filters and generate a report to view data.</p>
          </div>
        )}
      </div>
    </div>
  )
}

