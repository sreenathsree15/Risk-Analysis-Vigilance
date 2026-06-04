import type { PathOptions } from "leaflet"

export interface BlockCaseStats {
  blockName: string
  district: string | null
  total: number
  high: number
  medium: number
  low: number
  pending: number
  worstSeverity: "High" | "Medium" | "Low" | null
  cases: Array<{
    caseId: string
    panchayat: string
    department: string
    severity: string
    status: string
    date: string
  }>
}

const SEVERITY_RANK: Record<string, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
}

/** QGIS2web severity palette (full-opacity polygon fills). */
export const QGIS_SEVERITY_FILL: Record<string, string> = {
  High: "rgba(255,18,1,1)",
  Medium: "rgba(255,166,1,1)",
  Low: "rgba(91,228,0,1)",
  none: "rgba(0,126,0,1)",
}

const POLYGON_BORDER: PathOptions = {
  color: "rgba(35,35,35,1)",
  weight: 1,
  dashArray: "2 1",
  lineCap: "butt",
  lineJoin: "miter",
  fillOpacity: 1,
  opacity: 1,
}

export function normalizeMapName(value: string | null | undefined): string {
  if (!value) return ""
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+municipality$/i, "")
    .replace(/\s+block$/i, "")
    .replace(/\s+panchayat$/i, "")
}

type GeoFeature = {
  properties: {
    Blocks?: string
    District?: string | null
  }
}

type CaseRecord = {
  caseId: string
  panchayat: string
  district: string
  department: string
  severity: string
  status: string
  date: string
}

function buildBlockIndex(geoFeatures: GeoFeature[]) {
  return geoFeatures.map((f) => ({
    blockName: String(f.properties.Blocks ?? ""),
    district: f.properties.District ?? null,
    normalized: normalizeMapName(f.properties.Blocks),
  }))
}

export function matchCaseToBlock(
  panchayat: string,
  district: string,
  blockIndex: ReturnType<typeof buildBlockIndex>
): string | null {
  const pn = normalizeMapName(panchayat)
  const dn = normalizeMapName(district)
  if (!pn) return null

  const exact = blockIndex.find((b) => b.normalized === pn)
  if (exact) return exact.blockName

  const partial = blockIndex.filter(
    (b) => b.normalized.includes(pn) || pn.includes(b.normalized)
  )
  if (partial.length === 1) return partial[0].blockName
  if (partial.length > 1 && dn) {
    const withDistrict = partial.find((b) => normalizeMapName(b.district) === dn)
    if (withDistrict) return withDistrict.blockName
    return partial[0].blockName
  }
  if (partial.length > 0) return partial[0].blockName

  return null
}

export function buildBlockCaseStats(
  cases: CaseRecord[],
  geoData: { features: GeoFeature[] } | null
): Map<string, BlockCaseStats> {
  const stats = new Map<string, BlockCaseStats>()
  if (!geoData?.features?.length) return stats

  const blockIndex = buildBlockIndex(geoData.features)

  for (const feature of geoData.features) {
    const blockName = String(feature.properties.Blocks ?? "")
    if (!blockName) continue
    stats.set(blockName, {
      blockName,
      district: feature.properties.District ?? null,
      total: 0,
      high: 0,
      medium: 0,
      low: 0,
      pending: 0,
      worstSeverity: null,
      cases: [],
    })
  }

  for (const c of cases) {
    const blockName = matchCaseToBlock(c.panchayat, c.district, blockIndex)
    if (!blockName) continue

    const entry = stats.get(blockName)
    if (!entry) continue

    entry.total += 1
    entry.cases.push({
      caseId: c.caseId,
      panchayat: c.panchayat,
      department: c.department,
      severity: c.severity,
      status: c.status,
      date: c.date,
    })

    if (c.severity === "High") entry.high += 1
    else if (c.severity === "Medium") entry.medium += 1
    else if (c.severity === "Low") entry.low += 1

    if (c.status === "Pending" || c.status === "In Progress") entry.pending += 1

    const currentRank = entry.worstSeverity ? SEVERITY_RANK[entry.worstSeverity] : 0
    const caseRank = SEVERITY_RANK[c.severity] ?? 0
    if (caseRank > currentRank) {
      entry.worstSeverity = c.severity as BlockCaseStats["worstSeverity"]
    }
  }

  return stats
}

export function getBlockPolygonStyle(
  stats: BlockCaseStats | undefined,
  options?: { dimmed?: boolean; hidden?: boolean }
): PathOptions {
  if (options?.hidden) {
    return {
      ...POLYGON_BORDER,
      fillColor: "rgba(0,0,0,0)",
      fillOpacity: 0,
      opacity: 0,
      weight: 0,
    }
  }

  if (options?.dimmed || !stats?.total) {
    return {
      ...POLYGON_BORDER,
      fillColor: "rgba(0,126,0,1)",
      fillOpacity: 0.28,
      opacity: 0.75,
      weight: 0.8,
    }
  }

  const severityKey = stats.worstSeverity ?? "none"
  return {
    ...POLYGON_BORDER,
    fillColor: QGIS_SEVERITY_FILL[severityKey] ?? QGIS_SEVERITY_FILL.none,
    fillOpacity: 1,
  }
}

export function buildBlockPopupHtml(stats: BlockCaseStats): string {
  const severityLabel = stats.worstSeverity ?? "No open severity"
  const previewCases = stats.cases.slice(0, 5)

  const rows = previewCases
    .map(
      (c) =>
        `<tr>
          <td style="font-size:11px;font-weight:600">${c.caseId}</td>
          <td style="font-size:11px">${c.severity}</td>
          <td style="font-size:11px">${c.status}</td>
        </tr>`
    )
    .join("")

  return `
    <div style="min-width:220px;font-family:system-ui,sans-serif">
      <h4 style="margin:0 0 8px;font-size:14px;font-weight:700;color:#0f172a;border-bottom:1px solid #e2e8f0;padding-bottom:6px">
        ${stats.blockName}
      </h4>
      <table style="width:100%;border-collapse:collapse;margin-bottom:8px">
        <tr><th style="text-align:left;font-size:11px;color:#64748b;padding:2px 8px 2px 0">District</th><td style="font-size:11px">${stats.district ?? "—"}</td></tr>
        <tr><th style="text-align:left;font-size:11px;color:#64748b;padding:2px 8px 2px 0">Total cases</th><td style="font-size:11px;font-weight:700">${stats.total}</td></tr>
        <tr><th style="text-align:left;font-size:11px;color:#64748b;padding:2px 8px 2px 0">Worst severity</th><td style="font-size:11px;font-weight:700">${severityLabel}</td></tr>
        <tr><th style="text-align:left;font-size:11px;color:#64748b;padding:2px 8px 2px 0">Pending / open</th><td style="font-size:11px">${stats.pending}</td></tr>
      </table>
      ${
        previewCases.length
          ? `<p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase">Recent cases</p>
             <table style="width:100%;border-collapse:collapse">${rows}</table>
             ${stats.cases.length > 5 ? `<p style="margin:6px 0 0;font-size:10px;color:#94a3b8">+ ${stats.cases.length - 5} more</p>` : ""}`
          : `<p style="margin:0;font-size:11px;color:#94a3b8">No cases match current filters for this area.</p>`
      }
    </div>
  `
}
