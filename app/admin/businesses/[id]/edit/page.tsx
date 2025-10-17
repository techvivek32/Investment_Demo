import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-helpers"
import { connect } from "@/lib/db"
import Business from "@/models/business"
import BusinessForm from "@/components/forms/business-form"

export default async function EditBusinessPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions as any)
  if (!session)
    return (
      <main className="container mx-auto p-6">
        <p className="text-destructive">Sign in required</p>
      </main>
    )
  await connect()
  const biz = await (Business as any).findById(params.id).lean()
  if (!biz) {
    return (
      <main className="container mx-auto p-6">
        <p className="text-destructive">Business not found</p>
      </main>
    )
  }
  return (
    <main className="container mx-auto p-6 grid gap-6">
      <h1 className="text-2xl font-semibold text-pretty">Edit Business</h1>
      <BusinessForm
        initial={{
          _id: String(biz._id),
          name: biz.name,
          description: biz.description,
          location: biz.location,
          registrationNumber: biz.registrationNumber,
          sector: biz.sector,
        }}
      />
    </main>
  )
}
