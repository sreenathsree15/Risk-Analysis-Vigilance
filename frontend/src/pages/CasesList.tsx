import { useEffect, useState } from "react"
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { useFilterStore } from "../store/useFilterStore"

export default function CasesList() {
  const [allCases, setAllCases] = useState<any[]>([])
  const [filteredCases, setFilteredCases] = useState<any[]>([])
  const [search, setSearch] = useState("")
  
  const filters = useFilterStore()
  
  // Pagination
  const [page, setPage] = useState(1)
  const [perPage] = useState(10)

  useEffect(() => {
    fetch("http://localhost:8000/api/cases")
      .then(res => res.json())
      .then(data => {
        setAllCases(data.cases)
      })
  }, [])

  useEffect(() => {
    let result = allCases

    if (search) {
      const s = search.toLowerCase()
      result = result.filter(c => 
        c.caseId.toLowerCase().includes(s) || 
        c.panchayat.toLowerCase().includes(s) ||
        c.department.toLowerCase().includes(s)
      )
    }

    if (filters.district !== 'All') result = result.filter(c => c.district === filters.district)
    if (filters.panchayat !== 'All') result = result.filter(c => c.panchayat === filters.panchayat)
    if (filters.department !== 'All') result = result.filter(c => c.department === filters.department)
    if (filters.severity !== 'All') result = result.filter(c => c.severity === filters.severity)
    if (filters.status !== 'All') result = result.filter(c => c.status === filters.status)

    setFilteredCases(result)
    setPage(1)
  }, [allCases, search, filters])

  const totalPages = Math.ceil(filteredCases.length / perPage)
  const paginatedCases = filteredCases.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      {/* Top Bar */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by Case ID, Panchayat, Department..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
             <FilterSelect 
              label="District" 
              value={filters.district} 
              onChange={val => filters.setFilter('district', val)} 
              options={["All", ...Array.from(new Set(allCases.map(c => c.district))).sort() as string[]]} 
            />
            <FilterSelect 
              label="Panchayat" 
              value={filters.panchayat} 
              onChange={val => filters.setFilter('panchayat', val)} 
              options={["All", ...Array.from(new Set(allCases.map(c => c.panchayat))).sort() as string[]]} 
            />
             <FilterSelect 
              label="Department" 
              value={filters.department} 
              onChange={val => filters.setFilter('department', val)} 
              options={["All", "LSGD", "Health", "PWD", "Education", "Others"]} 
            />
             <FilterSelect 
              label="Severity" 
              value={filters.severity} 
              onChange={val => filters.setFilter('severity', val)} 
              options={["All", "High", "Medium", "Low"]} 
            />
            <button 
              onClick={filters.resetFilters}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-900 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold">Case ID</th>
              <th className="px-6 py-4 font-semibold">Panchayat</th>
              <th className="px-6 py-4 font-semibold">Department</th>
              <th className="px-6 py-4 font-semibold">Severity</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedCases.map((c, i) => (
              <tr key={i} className="hover:bg-slate-50 cursor-pointer">
                <td className="px-6 py-4 font-medium text-slate-900">{c.caseId}</td>
                <td className="px-6 py-4">{c.panchayat}</td>
                <td className="px-6 py-4">{c.department}</td>
                <td className="px-6 py-4">
                  <span className={`font-medium ${
                    c.severity === 'High' ? 'text-red-600' : 
                    c.severity === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {c.severity}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-6 py-4">{c.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
        <div>
          Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, filteredCases.length)} of {filteredCases.length} cases
        </div>
        <div className="flex space-x-2">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="p-2 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button 
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(p => p + 1)}
            className="p-2 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function FilterSelect({ label, options, value, onChange }: { label: string, options: string[], value: string, onChange: (val: string) => void }) {
  return (
    <select 
      className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="All" disabled hidden>{label}</option>
      {options.map(o => (
        <option key={o} value={o}>{o === 'All' ? `All ${label}s` : o}</option>
      ))}
    </select>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    "Pending": "bg-amber-100 text-amber-800",
    "In Progress": "bg-blue-100 text-blue-800",
    "Resolved": "bg-emerald-100 text-emerald-800"
  }[status] || "bg-slate-100 text-slate-800"

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles}`}>
      {status}
    </span>
  )
}

