import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import { Bell, User } from "lucide-react"

export default function Layout() {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
          <h1 className="text-xl font-semibold text-slate-800">
            Vigilance Monitoring System
          </h1>
          <div className="flex items-center space-x-4 text-slate-500">
            <button className="hover:text-slate-700">
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2 text-sm font-medium text-slate-700 border-l pl-4 ml-2">
              <User className="h-5 w-5 rounded-full bg-slate-100 p-0.5" />
              <span>Admin Officer</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
