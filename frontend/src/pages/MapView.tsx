import { useState, useEffect } from "react"
import { MapContainer } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { useFilterStore } from "../store/useFilterStore"
import { ShieldAlert, CheckCircle2, Clock } from "lucide-react"
import SeverityMapLayer, { MapSeverityLegend } from "../components/map/SeverityMapLayer"

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

  // Summary counts for analytics strip
  const total = filteredCases.length
  const high = filteredCases.filter(c => c.severity === "High").length
  const pending = filteredCases.filter(c => c.status === "Pending").length
  const resolved = filteredCases.filter(c => c.status === "Resolved").length

  // Filter panchayats based on the selected district
  const availablePanchayats = Array.from(
    new Set(
      allCases
        .filter(c => filters.district === 'All' || c.district === filters.district)
        .map(c => c.panchayat)
    )
  ).sort() as string[];

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 w-full">
          <FilterSelect 
            label="District" 
            value={filters.district} 
            onChange={val => {
              filters.setFilter('district', val)
              // If the selected panchayat is not in the new district, reset it to 'All'
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
          <FilterSelect label="Severity" value={filters.severity} onChange={val => filters.setFilter('severity', val)} options={["All", "High", "Medium", "Low"]} />
          <FilterSelect label="Status" value={filters.status} onChange={val => filters.setFilter('status', val)} options={["All", "Pending", "In Progress", "Resolved"]} />
          
          <button 
            onClick={filters.resetFilters} 
            className="h-10 w-full bg-slate-100 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-200 transition-colors border border-slate-200 flex items-center justify-center"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Map Container — choropleth polygons (QGIS-style), filters unchanged */}
      <div className="flex-1 rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0 bg-white">
        <MapContainer
          center={[10.5, 76.5]}
          zoom={7}
          style={{ height: "100%", width: "100%", background: "#ffffff" }}
        >
          <SeverityMapLayer
            geoData={geoData}
            filteredCases={filteredCases}
            selectedDistrict={filters.district}
          />
        </MapContainer>
        <MapSeverityLegend />
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
