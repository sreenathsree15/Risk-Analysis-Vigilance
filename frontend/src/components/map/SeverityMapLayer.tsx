import { useEffect, useMemo, useRef } from "react"
import { GeoJSON, TileLayer, useMap } from "react-leaflet"
import L from "leaflet"
import type { Layer, PathOptions } from "leaflet"
import type { Feature, GeoJsonObject } from "geojson"
import {
  buildBlockCaseStats,
  buildBlockPopupHtml,
  getBlockPolygonStyle,
  QGIS_SEVERITY_FILL,
} from "../../utils/mapChoropleth"

const SATELLITE_URL = "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"

interface CaseRecord {
  caseId: string
  panchayat: string
  district: string
  department: string
  severity: string
  status: string
  date: string
}

interface SeverityMapLayerProps {
  geoData: GeoJsonObject | null
  filteredCases: CaseRecord[]
  selectedDistrict: string
}

function MapBoundsFitter({ geoData }: { geoData: GeoJsonObject | null }) {
  const map = useMap()
  const fitted = useRef(false)

  useEffect(() => {
    if (!geoData || fitted.current) return
    const bounds = L.geoJSON(geoData).getBounds()
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [24, 24] })
      fitted.current = true
    }
  }, [geoData, map])

  return null
}

export default function SeverityMapLayer({
  geoData,
  filteredCases,
  selectedDistrict,
}: SeverityMapLayerProps) {
  const blockStats = useMemo(
    () => buildBlockCaseStats(filteredCases, geoData as { features: Array<{ properties: Record<string, unknown> }> } | null),
    [filteredCases, geoData]
  )

  const styleFeature = (feature?: Feature): PathOptions => {
    const blockName = String(feature?.properties?.Blocks ?? "")
    const featureDistrict = feature?.properties?.District as string | null | undefined
    const stats = blockStats.get(blockName)

    if (selectedDistrict !== "All") {
      const districtMatch =
        featureDistrict === selectedDistrict ||
        normalizeDistrict(featureDistrict) === normalizeDistrict(selectedDistrict)
      if (!districtMatch) {
        return getBlockPolygonStyle(stats, { hidden: true })
      }
    }

    return getBlockPolygonStyle(stats, { dimmed: !stats?.total })
  }

  const layerKey = `${selectedDistrict}-${filteredCases.length}-${filteredCases[0]?.caseId ?? "empty"}`

  if (!geoData) {
    return (
      <TileLayer
        url={SATELLITE_URL}
        attribution="Google"
        maxZoom={20}
        maxNativeZoom={19}
      />
    )
  }

  return (
    <>
      <TileLayer
        url={SATELLITE_URL}
        attribution="Google"
        maxZoom={20}
        maxNativeZoom={19}
      />
      <MapBoundsFitter geoData={geoData} />
      <GeoJSON
        key={layerKey}
        data={geoData}
        style={styleFeature}
        onEachFeature={(feature, layer) => {
          const blockName = String(feature.properties?.Blocks ?? "")
          const stats = blockStats.get(blockName)
          const baseStyle = styleFeature(feature)

          layer.on({
            mouseover: (e) => {
              const target = e.target as Layer & { setStyle: (s: PathOptions) => void }
              if (baseStyle.fillOpacity === 0) return
              target.setStyle({
                weight: 2.5,
                color: "#ffffff",
                fillOpacity: baseStyle.fillOpacity ?? 1,
              })
            },
            mouseout: (e) => {
              const target = e.target as Layer & { setStyle: (s: PathOptions) => void }
              target.setStyle(baseStyle)
            },
          })

          if (stats) {
            layer.bindPopup(buildBlockPopupHtml(stats), { maxHeight: 320 })
          } else {
            layer.bindPopup(
              `<div style="font-family:system-ui,sans-serif"><strong>${blockName}</strong><p style="margin:4px 0 0;font-size:11px;color:#64748b">No case data for current filters.</p></div>`
            )
          }
        }}
      />
    </>
  )
}

function normalizeDistrict(value: string | null | undefined): string {
  return (value ?? "").toLowerCase().trim()
}

export function MapSeverityLegend() {
  return (
    <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg border border-slate-200 shadow-lg px-3 py-2.5 pointer-events-none">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
        Case severity (area fill)
      </p>
      <div className="space-y-1.5">
        {[
          { label: "High", color: QGIS_SEVERITY_FILL.High },
          { label: "Medium", color: QGIS_SEVERITY_FILL.Medium },
          { label: "Low", color: QGIS_SEVERITY_FILL.Low },
          { label: "No cases / default", color: QGIS_SEVERITY_FILL.none },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="w-4 h-3 rounded-sm border border-slate-800/40 flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[11px] font-medium text-slate-700">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
