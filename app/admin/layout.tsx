import { auth } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const role = (session.user as any).role
  if (role !== "ADMIN") redirect("/dashboard")

  return (
    <DashboardLayout user={{ name: session.user.name, email: session.user.email, role: "ADMIN" }}>
      {children}
    </DashboardLayout>
  )
}
