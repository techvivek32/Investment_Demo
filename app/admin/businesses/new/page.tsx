import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-helpers"
import BusinessForm from "@/components/forms/business-form"

export default async function NewBusinessPage() {
  const session = await getServerSession(authOptions as any)
  if (!session)
    return (
      <main className="container mx-auto p-6">
        <p className="text-destructive">Sign in required</p>
      </main>
    )
  return (
    <main className="container mx-auto p-6 grid gap-6">
      <h1 className="text-2xl font-semibold text-pretty">Create Business</h1>
      <BusinessForm />
    </main>
  )
}
