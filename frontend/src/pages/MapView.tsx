import { useState, useEffect } from "react"
import { MapContainer, TileLayer, CircleMarker, Popup, GeoJSON } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { useFilterStore } from "../store/useFilterStore"
import { ShieldAlert, CheckCircle2, Clock } from "lucide-react"
import { Link } from "react-router-dom"

export default function MapView() {
  const [allCases, setAllCases] = useState<any[]>([])
  const [filteredCases, setFilteredCases] = useState<any[]>([])
  const [geoData, setGeoData] = useState<any>(null)
  const filters = useFilterStore()

  useEffect(() => {
    fetch("http://localhost:8000/api/cases")
      .then(res => res.json())
      .then(data => setAllCases(data.cases))
      
    // Fetch the GeoJSON boundaries
    fetch("/Vigilance_Block_Panchayath.geojson")
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("Error loading GeoJSON:", err))
  }, [])

  useEffect(() => {
    let result = allCases
    if (filters.district !== 'All') result = result.filter(c => c.district === filters.district)
    if (filters.panchayat !== 'All') result = result.filter(c => c.panchayat === filters.panchayat)
    if (filters.department !== 'All') result = result.filter(c => c.department === filters.department)
    if (filters.severity !== 'All') result = result.filter(c => c.severity === filters.severity)
    if (filters.status !== 'All') result = result.filter(c => c.status === filters.status)
    setFilteredCases(result)
  }, [allCases, filters])

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'High': return '#ef4444'
      case 'Medium': return '#f59e0b'
      case 'Low': return '#10b981'
      default: return '#3b82f6'
    }
  }

  // Summary counts for analytics strip
  const total = filteredCases.length
  const high = filteredCases.filter(c => c.severity === "High").length
  const pending = filteredCases.filter(c => c.status === "Pending").length
  const resolved = filteredCases.filter(c => c.status === "Resolved").length

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
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
        <FilterSelect label="Department" value={filters.department} onChange={val => filters.setFilter('department', val)} options={["All", "LSGD", "Health", "PWD", "Education", "Others"]} />
        <FilterSelect label="Severity" value={filters.severity} onChange={val => filters.setFilter('severity', val)} options={["All", "High", "Medium", "Low"]} />
        <FilterSelect label="Status" value={filters.status} onChange={val => filters.setFilter('status', val)} options={["All", "Pending", "In Progress", "Resolved"]} />
        
        <div className="flex-1"></div>
        <button onClick={filters.resetFilters} className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-200 transition-colors">
          Reset Filters
        </button>
      </div>

      {/* Map Container */}
      <div className="flex-1 rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0 bg-[#e2e8f0]">
        <MapContainer center={[10.5, 76.5]} zoom={7} style={{ height: '100%', width: '100%', backgroundColor: '#f8f9fa' }}>
          
          {/* GeoJSON Base */}
          {geoData && (
            <GeoJSON 
              data={geoData} 
              style={{
                fillColor: '#cbd5e1',
                fillOpacity: 0.4,
                color: '#94a3b8',
                weight: 1
              }}
            />
          )}

          {/* Labels Only Layer - This provides location markings without the "grid" background */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          {filteredCases.map(c => (
            <CircleMarker
              key={c.caseId}
              center={[c.latitude, c.longitude]}
              radius={6}
              fillColor={getSeverityColor(c.severity)}
              fillOpacity={0.8}
              color="#fff"
              weight={1.5}
            >
              <Popup>
                <div className="p-1">
                  <h4 className="font-bold text-slate-800 border-b pb-2 mb-2">{c.caseId}</h4>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p><span className="font-medium">Panchayat:</span> {c.panchayat} ({c.district})</p>
                    <p><span className="font-medium">Department:</span> {c.department}</p>
                    <p>
                      <span className="font-medium">Severity: </span> 
                      <span style={{color: getSeverityColor(c.severity)}} className="font-semibold">{c.severity}</span>
                    </p>
                    <p><span className="font-medium">Status:</span> {c.status}</p>
                    <p><span className="font-medium">Date:</span> {c.date}</p>
                  </div>
                  <Link to="/cases" onClick={() => filters.setFilter('panchayat', c.panchayat)} className="mt-3 block text-center text-sm font-medium text-blue-600 hover:text-blue-800">
                    View Details
                  </Link>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Analytics Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center text-sm">
        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-medium">Showing Cases:</span>
          <span className="font-bold text-slate-900 text-lg">{total}</span>
        </div>
        <div className="flex space-x-8">
          <div className="flex items-center text-red-600">
            <ShieldAlert className="h-5 w-5 mr-2" />
            <span className="font-medium">{high} High Severity</span>
          </div>
          <div className="flex items-center text-amber-600">
            <Clock className="h-5 w-5 mr-2" />
            <span className="font-medium">{pending} Pending</span>
          </div>
          <div className="flex items-center text-emerald-600">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            <span className="font-medium">{resolved} Resolved</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterSelect({ label, options, value, onChange }: { label: string, options: string[], value: string, onChange: (val: string) => void }) {
  return (
    <select 
      className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
