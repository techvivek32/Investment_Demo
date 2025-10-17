import { auth } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default async function InvestorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const role = (session.user as any).role
  if (role !== "INVESTOR") redirect("/dashboard")

  return (
    <DashboardLayout user={{ name: session.user.name, email: session.user.email, role: "INVESTOR" }}>
      {children}
    </DashboardLayout>
  )
}
