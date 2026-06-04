import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import NotificationsDropdown from "./NotificationsDropdown"
import UserMenu from "./UserMenu"

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
          <div className="flex items-center space-x-2 text-slate-500">
            <NotificationsDropdown />
            <UserMenu />
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
