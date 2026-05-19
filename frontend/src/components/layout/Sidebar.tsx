import { NavLink } from "react-router-dom"
import { LayoutDashboard, Map, List, BarChart3, Info, Shield } from "lucide-react"

export default function Sidebar() {
  const links = [
    { name: "Dashboard", to: "/", icon: LayoutDashboard },
    { name: "Map View", to: "/map", icon: Map },
    { name: "Cases", to: "/cases", icon: List },
    { name: "Reports", to: "/reports", icon: BarChart3 },
    { name: "About", to: "/about", icon: Info },
  ]

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 text-white font-semibold text-lg tracking-wide">
        <Shield className="mr-3 h-6 w-6 text-blue-400" />
        Vigilance System
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <NavLink
                key={link.name}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <Icon className="mr-3 flex-shrink-0 h-5 w-5" aria-hidden="true" />
                {link.name}
              </NavLink>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
