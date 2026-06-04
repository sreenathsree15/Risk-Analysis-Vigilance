import { useEffect, useState } from "react"
import { Search, ChevronLeft, ChevronRight, X, FileText, MapPin, ShieldAlert, CheckCircle2 } from "lucide-react"
import { useFilterStore } from "../store/useFilterStore"
import { useNavigate } from "react-router-dom"

const departmentProblems: Record<string, {
  overview: string;
  commonIssues: string[];
  recommendations: string[];
  riskIndicators: string[];
}> = {
  "Procedural Violations": {
    overview: "Failure to follow established regulatory guidelines, tender norms, or statutory procedures in local body decision-making and project execution.",
    commonIssues: [
      "Deviation from approved technical estimates without proper authorization.",
      "Splitting of contracts to avoid higher-level technical/administrative sanction.",
      "Delays in executing agreements after tender awards.",
      "Non-maintenance of essential registers (e.g., measurement books, asset registers)."
    ],
    riskIndicators: [
      "High frequency of administrative sanctions bypassed.",
      "Anomalies in e-tender portals and sudden withdrawal of competitive bids.",
      "Projects marked as complete with outstanding physical verification reports."
    ],
    recommendations: [
      "Implement mandatory digital auditing for all contract sanctions.",
      "Conduct surprise physical verification audits on selected works.",
      "Enforce strict timelines for contract execution and registry updates."
    ]
  },
  "Unauthorized Activities": {
    overview: "Permitting or engaging in activities without the required sanctions, licenses, or building permits under the Kerala Panchayat Raj Act / Municipalities Act.",
    commonIssues: [
      "Encroachment on public land and water bodies without local authority action.",
      "Issuance of building permits in violation of CRZ (Coastal Regulation Zone) norms.",
      "Illegal sand mining and soil excavation under local political patronage.",
      "Running commercial operations without valid license or pollution control permits."
    ],
    riskIndicators: [
      "Rapid unchecked construction in sensitive zones.",
      "Low tax collection from commercial establishments operating without licenses.",
      "Frequent local public complaints regarding public space usage."
    ],
    recommendations: [
      "Integrate GIS mapping to automatically flag illegal constructions.",
      "Establish an independent environmental surveillance unit.",
      "Streamline public grievance reporting on unauthorized developments."
    ]
  },
  "Corruption": {
    overview: "Direct or indirect financial irregularities, bribery, nepotism, or misuse of official power for personal gain.",
    commonIssues: [
      "Accepting bribes for processing files, licenses, or certificates.",
      "Disbursement of benefits to ineligible beneficiaries under welfare schemes.",
      "Under-valuation of properties to reduce registration fees/property tax.",
      "Collusion with local contractors during the bidding process."
    ],
    riskIndicators: [
      "High volume of anonymous vigilance complaints.",
      "Unexplained delays in processing routine applications until manual intervention.",
      "Disproportionate assets relative to known income sources."
    ],
    recommendations: [
      "Transition all public service applications to a faceless, cashless online portal.",
      "Mandate asset disclosure for high-risk positions annually.",
      "Strengthen whistleblower protection programs and anonymous tip-lines."
    ]
  },
  "Administrative Misconduct": {
    overview: "Negligence, insubordination, misuse of office resources, or failure to perform duties by government or local body employees.",
    commonIssues: [
      "Absenteeism and failure of officials to attend mandatory council meetings.",
      "Willful delay in implementing government orders and welfare schemes.",
      "Harassment of citizens requesting public services.",
      "Unauthorized destruction or alteration of official files and records."
    ],
    riskIndicators: [
      "High citizen dissatisfaction scores.",
      "Unresolved pending file count growing exponentially.",
      "Lack of periodic internal departmental reviews."
    ],
    recommendations: [
      "Enforce biometric attendance and link it to salary disbursement.",
      "Implement an auto-escalation mechanism for files pending beyond SLA limits.",
      "Conduct regular performance appraisals and administrative training workshops."
    ]
  },
  "Inadvertence / Negligence": {
    overview: "Lapse in oversight, oversight errors in bookkeeping, or general carelessness by administrative staff leading to systemic failure.",
    commonIssues: [
      "Errors in computing pension benefits or welfare allocation amounts.",
      "Loss of key vouchers and financial records due to poor storage practices.",
      "Omission of vital statutory clauses in lease and service agreements.",
      "Failure to reconcile bank accounts monthly, resulting in undetected leaks."
    ],
    riskIndicators: [
      "Frequent audit objections raised by internal audit departments.",
      "Unreconciled bank balances spanning multiple quarters.",
      "Duplicate payments processed under identical invoice numbers."
    ],
    recommendations: [
      "Provide refresher training on accounting systems and record management.",
      "Set up automatic daily bank reconciliation tools.",
      "Introduce a dual-signature verification step for all financial transactions above threshold limits."
    ]
  }
};

export default function CasesList() {
  const [allCases, setAllCases] = useState<any[]>([])
  const [filteredCases, setFilteredCases] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [selectedCase, setSelectedCase] = useState<any | null>(null)
  
  const filters = useFilterStore()
  const navigate = useNavigate()
  
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

  // Filter panchayats based on the selected district
  const availablePanchayats = Array.from(
    new Set(
      allCases
        .filter(c => filters.district === 'All' || c.district === filters.district)
        .map(c => c.panchayat)
    )
  ).sort() as string[];

  const totalPages = Math.ceil(filteredCases.length / perPage)
  const paginatedCases = filteredCases.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 relative">
      {/* Top Bar */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search Case ID, Panchayat..."
              className="w-full pl-10 pr-4 h-10 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filters Group - Compact and in One Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 flex-1 w-full">
             <FilterSelect 
              label="District" 
              value={filters.district} 
              onChange={val => {
                filters.setFilter('district', val)
                // If selected panchayat is not in the new district, reset to 'All'
                if (val !== 'All' && filters.panchayat !== 'All') {
                  const belongsToDistrict = allCases.some(c => c.district === val && c.panchayat === filters.panchayat)
                  if (!belongsToDistrict) {
                    filters.setFilter('panchayat', 'All')
                  }
                }
              }} 
              options={["All", ...Array.from(new Set(allCases.map(c => c.district))).sort() as string[]]} 
            />
            <FilterSelect 
              label="Panchayat" 
              value={filters.panchayat} 
              onChange={val => filters.setFilter('panchayat', val)} 
              options={["All", ...availablePanchayats]} 
            />
             <FilterSelect 
              label="Department" 
              value={filters.department} 
              onChange={val => filters.setFilter('department', val)} 
              options={["All", ...Array.from(new Set(allCases.map(c => c.department))).sort() as string[]]} 
            />
             <FilterSelect 
              label="Severity" 
              value={filters.severity} 
              onChange={val => filters.setFilter('severity', val)} 
              options={["All", "High", "Medium", "Low"]} 
            />
            <button 
              onClick={filters.resetFilters}
              className="h-10 w-full bg-slate-100 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-200 transition-colors border border-slate-200 flex items-center justify-center"
            >
              Reset Filters
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
              <tr 
                key={i} 
                className="hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => setSelectedCase(c)}
              >
                <td className="px-6 py-4 font-medium text-blue-600 hover:underline">{c.caseId}</td>
                <td className="px-6 py-4">{c.panchayat}</td>
                <td className="px-6 py-4">{c.department}</td>
                <td className="px-6 py-4">
                  <span className={`font-semibold ${
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
          Showing {filteredCases.length === 0 ? 0 : ((page - 1) * perPage) + 1} to {Math.min(page * perPage, filteredCases.length)} of {filteredCases.length} cases
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

      {/* Popup Case Details Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  Case Details & Analysis
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {selectedCase.caseId}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedCase(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Badges Strip */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-center">
                  <span className="text-xs text-slate-500 font-medium block mb-1">Status</span>
                  <StatusBadge status={selectedCase.status} />
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-center">
                  <span className="text-xs text-slate-500 font-medium block mb-1">Severity</span>
                  <span className={`text-sm font-bold ${
                    selectedCase.severity === 'High' ? 'text-red-600' : 
                    selectedCase.severity === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {selectedCase.severity}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-center">
                  <span className="text-xs text-slate-500 font-medium block mb-1">Date Created</span>
                  <span className="text-sm font-semibold text-slate-800">{selectedCase.date}</span>
                </div>
              </div>

              {/* Subject Section */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-blue-500" />
                  Subject Matter & Location
                </h4>
                <div className="p-4 bg-blue-50/40 border border-blue-100 rounded-lg space-y-3">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Vigilance review reference concerning suspicious activities and potential administrative discrepancies in <span className="font-semibold">{selectedCase.department}</span> at <span className="font-semibold">{selectedCase.panchayat}</span> Panchayat of <span className="font-semibold">{selectedCase.district}</span> District.
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-1 border-t border-blue-100/50">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {selectedCase.panchayat}, {selectedCase.district}
                    </span>
                    {selectedCase.latitude && selectedCase.longitude && (
                      <span className="text-slate-400 font-mono">
                        GPS: {selectedCase.latitude.toFixed(6)}, {selectedCase.longitude.toFixed(6)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Department Analysis Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-amber-500" />
                  Departmental Analysis: {selectedCase.department}
                </h4>
                
                {(() => {
                  const analysis = departmentProblems[selectedCase.department] || {
                    overview: "Monitoring and evaluation of service delivery, compliance guidelines, and resource management within the local governing authority.",
                    commonIssues: [
                      "Unreconciled records and missing physical measurement updates.",
                      "Procedural gaps in sanctioning funds or assets.",
                      "Lack of proactive citizen notification."
                    ],
                    recommendations: [
                      "Increase digital record auditing frequency.",
                      "Establish standard operating procedures for public outreach."
                    ]
                  };
                  
                  return (
                    <div className="space-y-4">
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {analysis.overview}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Issues */}
                        <div className="p-4 border border-rose-100 bg-rose-50/10 rounded-lg space-y-2">
                          <h5 className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                            Typical Issues in this Department
                          </h5>
                          <ul className="space-y-1.5">
                            {analysis.commonIssues.map((issue, idx) => (
                              <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                                <span className="text-rose-400 font-bold mt-0.5">•</span>
                                <span>{issue}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Recommendations */}
                        <div className="p-4 border border-emerald-100 bg-emerald-50/10 rounded-lg space-y-2">
                          <h5 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                            Recommended Action Plan
                          </h5>
                          <ul className="space-y-1.5">
                            {analysis.recommendations.map((rec, idx) => (
                              <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
              <button 
                onClick={() => setSelectedCase(null)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-md transition-colors"
              >
                Close
              </button>
              
              <button 
                onClick={() => {
                  filters.setFilter('panchayat', selectedCase.panchayat)
                  filters.setFilter('district', selectedCase.district)
                  setSelectedCase(null)
                  navigate('/map')
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-1.5"
              >
                <MapPin className="h-4 w-4" />
                View on Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterSelect({ label, options, value, onChange }: { label: string, options: string[], value: string, onChange: (val: string) => void }) {
  return (
    <select 
      className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-full h-10 truncate"
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
