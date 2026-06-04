import { useEffect, useRef, useState } from "react"
import { User, LogOut, ChevronDown, Settings } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../../store/useAuthStore"
import ProfileEditModal from "./ProfileEditModal"

export default function UserMenu() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [menuOpen])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <>
      <div ref={menuRef} className="relative flex items-center border-l pl-4 ml-2">
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center space-x-2 text-sm font-medium text-slate-700 hover:text-slate-900 rounded-lg px-2 py-1.5 hover:bg-slate-100 transition-colors"
          aria-expanded={menuOpen}
          aria-haspopup="true"
        >
          <User className="h-5 w-5 rounded-full bg-slate-100 p-0.5 text-slate-500" />
          <span className="max-w-[140px] truncate">{user?.name || "Admin Officer"}</span>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`}
          />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-lg z-50 py-1 overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.username}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                setProfileOpen(true)
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              Edit profile
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        )}
      </div>

      <ProfileEditModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  )
}
