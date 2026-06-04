import { useEffect, useRef, useState } from "react"
import { Bell, Loader2, AlertTriangle, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import type { NotificationCategory, VigilanceCase } from "../../types/case"
import { buildCaseNotifications, NOTIFICATION_SECTIONS } from "../../utils/caseNotifications"
import { useFilterStore } from "../../store/useFilterStore"

const API_CASES = "http://localhost:8000/api/cases"

export default function NotificationsDropdown() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<NotificationCategory>("important")
  const [groups, setGroups] = useState(() => buildCaseNotifications([]))
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const setFilter = useFilterStore((s) => s.setFilter)

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  const refreshNotifications = () => {
    setLoading(true)
    setError(null)
    return fetch(API_CASES)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load cases")
        return res.json()
      })
      .then((data) => {
        setGroups(buildCaseNotifications(data.cases ?? []))
      })
      .catch(() => setError("Could not load notifications. Try again."))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!open) return
    refreshNotifications()
  }, [open])

  useEffect(() => {
    refreshNotifications()
  }, [])

  const handleOpen = () => {
    setOpen(!open)
  }

  const activeList = groups[activeSection]

  const goToCases = (c: VigilanceCase) => {
    setFilter("status", c.status)
    setFilter("severity", c.severity)
    setFilter("district", c.district)
    setOpen(false)
    navigate("/cases")
  }

  const goToCasesFiltered = () => {
    if (activeSection === "highSeverity") setFilter("severity", "High")
    else if (activeSection === "unsolved") setFilter("status", "Pending")
    else {
      setFilter("severity", "All")
      setFilter("status", "All")
    }
    setOpen(false)
    navigate("/cases")
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        className="relative p-2 rounded-lg hover:bg-slate-100 hover:text-slate-700 transition-colors"
        title="Case alerts"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell className="h-5 w-5" />
        {groups.totalAlertCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full">
            {groups.totalAlertCount > 99 ? "99+" : groups.totalAlertCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[380px] max-h-[min(520px,70vh)] bg-white rounded-xl border border-slate-200 shadow-xl z-50 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80">
            <h3 className="text-sm font-bold text-slate-900">Case Alerts</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Important, severity, new, and unresolved cases
            </p>
          </div>

          <div className="flex border-b border-slate-100 overflow-x-auto">
            {NOTIFICATION_SECTIONS.map((section) => {
              const count = groups.counts[section.id]
              const isActive = activeSection === section.id
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`flex-shrink-0 px-3 py-2.5 text-[11px] font-semibold border-b-2 transition-colors ${
                    isActive
                      ? "border-blue-600 text-blue-700 bg-blue-50/50"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {section.label.split(" ")[0]}
                  <span className={`ml-1 ${isActive ? "text-blue-600" : "text-slate-400"}`}>
                    ({count})
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {loading && (
              <div className="flex items-center justify-center py-10 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}

            {!loading && error && (
              <div className="text-center py-6 space-y-2">
                <p className="text-xs text-red-600">{error}</p>
                <button
                  type="button"
                  onClick={refreshNotifications}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && activeList.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-8">No cases in this category.</p>
            )}

            {!loading && !error && activeList.length > 0 && (
              <ul className="space-y-2">
                {activeList.map((c: VigilanceCase) => (
                  <li key={c.caseId}>
                    <button
                      type="button"
                      onClick={() => goToCases(c)}
                      className="w-full text-left p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800 line-clamp-1">
                          {c.caseId}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-500 flex-shrink-0" />
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        {c.district} · {c.panchayat}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            c.severity === "High"
                              ? "bg-red-100 text-red-700"
                              : c.severity === "Medium"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {c.severity}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            c.status === "Pending"
                              ? "bg-amber-100 text-amber-800"
                              : c.status === "In Progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {c.status}
                        </span>
                        <span className="text-[9px] text-slate-400 ml-auto">{c.date}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {groups.totalAlertCount} total alerts
            </span>
            <button
              type="button"
              onClick={goToCasesFiltered}
              className="text-[11px] font-semibold text-blue-600 hover:underline"
            >
              View all in Cases
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
