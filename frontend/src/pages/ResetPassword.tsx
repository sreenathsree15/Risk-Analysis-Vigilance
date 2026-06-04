import { useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Shield, Lock, Eye, EyeOff, CheckCircle2, ArrowRight } from "lucide-react"

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    
    if (!token) {
      setError("Verification token is missing in URL parameters")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("http://localhost:8000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password })
      })
      
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.detail || "Reset request failed")
      }
      
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ebf3fc] via-[#f1f6fd] to-[#e4eefb] flex items-center justify-center font-sans p-4 relative overflow-hidden">
      {/* Background glowing blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-200/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#cbdffb]/40 blur-[130px] pointer-events-none" />
      
      <div className="w-full max-w-[420px] bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white/60 shadow-xl flex flex-col items-center z-10 transition-all duration-300">
        
        {success ? (
          /* SUCCESS VIEW */
          <div className="w-full text-center space-y-6 py-4 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center shadow-sm mx-auto">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-[#0f2e5c] tracking-tight">Password Reset Complete</h2>
              <p className="text-xs text-slate-500 font-semibold mt-2">
                Your credentials have been securely updated. You can now access your account.
              </p>
            </div>
            
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Back to Login</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          /* RESET PASSWORD FORM */
          <form onSubmit={handleSubmit} className="w-full flex flex-col animate-fade-in">
            {/* Brand Header */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center shadow-sm mb-4">
                <Shield className="h-9 w-9 text-blue-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#0f2e5c] tracking-tight">Create New Password</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Enter your new security credentials below.
              </p>
            </div>

            {error && (
              <div className="p-3 mb-4 text-xs font-semibold bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-center">
                {error}
              </div>
            )}

            {!token && (
              <div className="p-3 mb-4 text-xs font-semibold bg-amber-50 border border-amber-100 text-amber-700 rounded-xl text-center leading-relaxed">
                Verification link is invalid or incomplete. Verify that the URL contains the token parameter.
              </div>
            )}

            {/* Inputs */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  required
                  disabled={!token}
                  className="w-full pl-11 pr-11 py-3 text-sm bg-slate-50/50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700 disabled:opacity-50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  required
                  disabled={!token}
                  className="w-full pl-11 pr-11 py-3 text-sm bg-slate-50/50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700 disabled:opacity-50"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer text-center"
            >
              {loading ? "Saving Credentials..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>

      {/* Embedded Animations Rule */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97) translateY(4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  )
}
