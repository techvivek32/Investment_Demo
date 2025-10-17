"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Briefcase, 
  FileText, 
  BarChart3, 
  Settings,
  TrendingUp,
  FolderOpen,
  MessageSquare
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: any
}

interface SidebarProps {
  role: "ADMIN" | "INVESTOR"
}

const navItems: Record<string, NavItem[]> = {
  ADMIN: [
    { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    // { title: "All Businesses", href: "/admin/businesses", icon: Building2 },
    { title: "My Businesses", href: "/admin/my-businesses", icon: Briefcase },
    { title: "Investors", href: "/admin/investors", icon: Users },
    { title: "My Investments", href: "/admin/my-investments", icon: TrendingUp },
    { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { title: "Settings", href: "/admin/settings", icon: Settings },
  ],
  INVESTOR: [
    { title: "Dashboard", href: "/investor", icon: LayoutDashboard },
    { title: "My Investments", href: "/investor/investments", icon: TrendingUp },
    { title: "Settings", href: "/investor/settings", icon: Settings },
  ],
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const items = navItems[role] || []

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r bg-gradient-to-b from-slate-50 to-white">
      <nav className="flex flex-col gap-1 p-4">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
