export interface VigilanceCase {
  caseId: string
  panchayat: string
  district: string
  department: string
  severity: "High" | "Medium" | "Low" | string
  status: "Pending" | "In Progress" | "Resolved" | string
  date: string
  latitude?: number
  longitude?: number
}

export type NotificationCategory =
  | "important"
  | "highSeverity"
  | "newCases"
  | "unsolved"

export interface CaseNotificationGroups {
  important: VigilanceCase[]
  highSeverity: VigilanceCase[]
  newCases: VigilanceCase[]
  unsolved: VigilanceCase[]
  counts: {
    important: number
    highSeverity: number
    newCases: number
    unsolved: number
  }
  totalAlertCount: number
}

