import { auth } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  
  const role = (session.user as any).role
  if (role === "ADMIN") redirect("/admin")
  if (role === "INVESTOR") redirect("/investor")
  
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p>Welcome to Investment Manager</p>
    </main>
  )
}
