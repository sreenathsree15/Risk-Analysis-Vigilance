import type { CaseNotificationGroups, VigilanceCase } from "../types/case"

const NEW_CASE_DAYS = 30
const LIST_LIMIT = 8

function parseCaseDate(dateStr: string): Date | null {
  const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return null
  const [, day, month, year] = match
  return new Date(Number(year), Number(month) - 1, Number(day))
}

function isUnresolved(c: VigilanceCase): boolean {
  return c.status !== "Resolved"
}

function isNewCase(c: VigilanceCase, now = new Date()): boolean {
  const parsed = parseCaseDate(c.date)
  if (!parsed) return false
  const diffMs = now.getTime() - parsed.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays >= 0 && diffDays <= NEW_CASE_DAYS
}

function isImportant(c: VigilanceCase): boolean {
  if (!isUnresolved(c)) return false
  return c.severity === "High" || c.department === "Corruption"
}

export function buildCaseNotifications(cases: VigilanceCase[]): CaseNotificationGroups {
  const important = cases.filter(isImportant)
  const highSeverity = cases.filter((c) => c.severity === "High" && isUnresolved(c))
  const newCases = cases.filter((c) => isNewCase(c) && isUnresolved(c))
  const unsolved = cases.filter((c) => c.status === "Pending" || c.status === "In Progress")

  const alertIds = new Set<string>()
  for (const group of [important, highSeverity, newCases, unsolved]) {
    for (const c of group) alertIds.add(c.caseId)
  }

  return {
    important: important.slice(0, LIST_LIMIT),
    highSeverity: highSeverity.slice(0, LIST_LIMIT),
    newCases: newCases.slice(0, LIST_LIMIT),
    unsolved: unsolved.slice(0, LIST_LIMIT),
    counts: {
      important: important.length,
      highSeverity: highSeverity.length,
      newCases: newCases.length,
      unsolved: unsolved.length,
    },
    totalAlertCount: alertIds.size,
  }
}

export const NOTIFICATION_SECTIONS = [
  {
    id: "important" as const,
    label: "Important Cases",
    description: "High severity or corruption-related, not yet resolved",
    dotClass: "bg-violet-500",
  },
  {
    id: "highSeverity" as const,
    label: "High Severity",
    description: "Open cases marked as high severity",
    dotClass: "bg-red-500",
  },
  {
    id: "newCases" as const,
    label: "New Cases",
    description: `Registered in the last ${NEW_CASE_DAYS} days`,
    dotClass: "bg-blue-500",
  },
  {
    id: "unsolved" as const,
    label: "Pending / Unsolved",
    description: "Pending or in progress — not yet resolved",
    dotClass: "bg-amber-500",
  },
] as const
