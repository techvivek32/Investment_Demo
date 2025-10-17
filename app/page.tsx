import { auth } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  
  const role = (session.user as any).role
  if (role === "ADMIN") redirect("/admin")
  if (role === "BUSINESS_OWNER") redirect("/business")
  if (role === "INVESTOR") redirect("/investor")
  
  redirect("/dashboard")
}
