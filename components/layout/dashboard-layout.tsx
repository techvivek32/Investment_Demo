import { Navbar } from "./navbar"
import { Sidebar } from "./sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
  user: {
    name?: string | null
    email?: string | null
    role: "ADMIN" | "INVESTOR"
  }
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} />
      <Sidebar role={user.role} />
      <main className="ml-64 mt-16 p-8">
        {children}
      </main>
    </div>
  )
}
