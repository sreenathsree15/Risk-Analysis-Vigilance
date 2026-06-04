import { useState, useEffect } from "react"
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Mail,
  ArrowLeft,
  ShieldAlert,
  CheckCircle2,
  LogIn,
} from "lucide-react"
import { useAuthStore } from "../store/useAuthStore"
import { useNavigate } from "react-router-dom"
import LoginAnimatedHero from "../components/login/LoginAnimatedHero"

export default function Login() {
  const [view, setView] = useState<"login" | "forgot">("login")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [email, setEmail] = useState("")
  const [forgotSent, setForgotSent] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError] = useState<string | null>(null)

  const loginStore = useAuthStore((state) => state.login)
  const token = useAuthStore((state) => state.token)
  const navigate = useNavigate()

  useEffect(() => {
    if (token) navigate("/")
  }, [token, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Authentication failed")

      loginStore(data.access_token, data.user, rememberMe)
      navigate("/")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotLoading(true)
    setForgotError(null)

    try {
      const res = await fetch("http://localhost:8000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Failed to trigger email reset")

      setForgotSent(true)
    } catch (err: unknown) {
      setForgotError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Left — login form (Figma layout) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 min-h-[100dvh] lg:min-h-screen">
        <div className="w-full max-w-md">
          {view === "login" ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="flex justify-center mb-2">
                <img
                  src="/vigilancelogo.png"
                  alt="Vigilance Monitoring System"
                  className="w-56 sm:w-64 h-auto object-contain"
                />
              </div>

              {error && (
                <div className="p-3 text-xs font-bold bg-rose-50 border border-rose-100 text-rose-600 rounded-lg flex items-center justify-center gap-2">
                  <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm font-medium text-gray-800"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm font-medium text-gray-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setView("forgot")
                    setError(null)
                    setForgotSent(false)
                    setEmail("")
                  }}
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  "Authenticating..."
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign in
                  </>
                )}
              </button>

              <div className="pt-8 border-t border-gray-200">
                <p className="text-center text-sm text-gray-700 leading-relaxed">
                  Building a corruption free society through
                  <br />
                  transparency and accountability.
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleForgot} className="space-y-6">
              <button
                type="button"
                onClick={() => setView("login")}
                className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </button>

              <div className="flex justify-center">
                <img
                  src="/vigilancelogo.png"
                  alt="Vigilance Monitoring System"
                  className="w-48 h-auto object-contain opacity-90"
                />
              </div>

              <div className="text-center">
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Mail className="h-7 w-7 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Recover Password</h2>
                <p className="text-sm text-gray-500 mt-2">
                  Enter your registered email to receive a reset link.
                </p>
              </div>

              {forgotError && (
                <div className="p-3 text-xs font-bold bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-center">
                  {forgotError}
                </div>
              )}

              {forgotSent ? (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                  <p className="text-sm font-bold text-emerald-900">Reset request sent</p>
                  <p className="text-xs text-emerald-700">
                    Check{" "}
                    <code className="bg-emerald-100/60 px-1 rounded font-mono">
                      local_email_outbox.json
                    </code>
                  </p>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Email Address"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {forgotLoading ? "Processing..." : "Send Reset Link"}
                  </button>
                </>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Right — animated hero (Figma design) */}
      <div className="hidden lg:block lg:w-1/2 min-h-screen border-l border-blue-100/60">
        <LoginAnimatedHero />
      </div>

      {/* Mobile hero strip */}
      <div className="lg:hidden w-full h-[320px] border-t border-blue-100/60">
        <LoginAnimatedHero />
      </div>
    </div>
  )
}
