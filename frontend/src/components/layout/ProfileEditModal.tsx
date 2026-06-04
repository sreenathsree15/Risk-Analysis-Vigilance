import { useEffect, useState } from "react"
import { X, Loader2, User, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { useAuthStore } from "../../store/useAuthStore"

const API_UPDATE_PROFILE = "http://localhost:8000/api/auth/update-profile"

interface ProfileEditModalProps {
  open: boolean
  onClose: () => void
}

export default function ProfileEditModal({ open, onClose }: ProfileEditModalProps) {
  const user = useAuthStore((s) => s.user)
  const rememberMe = useAuthStore((s) => s.rememberMe)
  const updateSession = useAuthStore((s) => s.updateSession)

  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (open && user) {
      setName(user.name)
      setUsername(user.username)
      setNewPassword("")
      setConfirmPassword("")
      setError(null)
      setSuccess(null)
    }
  }, [open, user])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!name.trim()) {
      setError("Name is required.")
      return
    }
    if (!username.trim()) {
      setError("Username (email) is required.")
      return
    }
    if (newPassword && newPassword.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      const body: { name: string; username: string; new_password?: string } = {
        name: name.trim(),
        username: username.trim(),
      }
      if (newPassword) body.new_password = newPassword

      const res = await fetch(API_UPDATE_PROFILE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.detail || "Failed to update profile")
      }

      updateSession(data.access_token, data.user, rememberMe)
      setSuccess("Profile updated successfully.")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => onClose(), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-labelledby="profile-edit-title"
        className="relative w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 id="profile-edit-title" className="text-lg font-bold text-slate-900">
            Edit Profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Full name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Admin Officer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Username (email)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="admin@vigilance.gov.in"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              New password <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Leave blank to keep current"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {newPassword && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}

          {user?.role && (
            <p className="text-xs text-slate-500">
              Role: <span className="font-semibold text-slate-700">{user.role}</span>
            </p>
          )}

          {error && (
            <p className="text-xs font-medium text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
          {success && (
            <p className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">
              {success}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
