import { auth } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"
import { connectDB } from "@/lib/db"
import { Investment } from "@/models/investment"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { TrendingUp, Wallet, Building2 } from "lucide-react"
import Link from "next/link"

export default async function InvestorDashboard() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const role = (session.user as any).role
  if (role !== "INVESTOR") redirect("/dashboard")

  await connectDB()
  const userId = (session.user as any).id
  const investments = await Investment.find({ investor: userId }).populate("business", "name").lean()
  
  const totalInvested = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0)
  const activeCount = investments.filter(inv => inv.status === "ACTIVE").length
  const totalPnL = investments.reduce((sum, inv) => sum + (inv.realizedPnL || 0) + (inv.unrealizedPnL || 0), 0)

  return (
    <DashboardLayout user={{ name: session.user.name, email: session.user.email, role: "INVESTOR" }}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Investor Dashboard</h1>
          <p className="text-slate-600 mt-1">Track your investment portfolio</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Invested</CardTitle>
              <Wallet className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">${totalInvested.toLocaleString()}</div>
              <p className="text-xs text-slate-500 mt-1">{investments.length} investments</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total P&L</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1">Realized + Unrealized</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Investments</CardTitle>
              <Building2 className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{activeCount}</div>
              <p className="text-xs text-slate-500 mt-1">Currently active</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Investments</CardTitle>
              <Link href="/investor/investments" className="text-sm text-blue-600 hover:underline">
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {investments.slice(0, 5).map((inv: any) => (
                <div key={inv._id.toString()} className="flex items-center justify-between border-l-4 border-l-blue-500 pl-4 py-2">
                  <div>
                    <p className="font-medium">{inv.business?.name || "Unknown Business"}</p>
                    <p className="text-sm text-slate-500">
                      Ownership: {inv.ownershipPercent}% · {new Date(inv.investedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-semibold text-lg">${inv.amount?.toLocaleString()}</p>
                </div>
              ))}
              {investments.length === 0 && (
                <p className="text-center text-slate-500 py-8">No investments yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
