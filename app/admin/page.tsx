import { auth } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"
import { connectDB } from "@/lib/db"
import { Investment } from "@/models/investment"
import { Business } from "@/models/business"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PerformanceLine, DiversificationPie, PnLBar } from "@/components/charts/portfolio-charts"
import { TrendingUp, Building2, Users, DollarSign } from "lucide-react"

export default async function AdminDashboard() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const role = (session.user as any).role
  if (role !== "ADMIN") redirect("/dashboard")

  await connectDB()
  const [totals, bizCount, investorCount] = await Promise.all([
    Investment.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
    Business.countDocuments(),
    Investment.distinct("investor").then((x) => x.length),
  ])
  const totalCapital = totals?.[0]?.total || 0

  const since = new Date()
  since.setMonth(since.getMonth() - 5)
  since.setDate(1)
  const perfAgg = await Investment.aggregate([
    { $match: { investedAt: { $gte: since } } },
    {
      $group: {
        _id: { y: { $year: "$investedAt" }, m: { $month: "$investedAt" } },
        value: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.y": 1, "_id.m": 1 } },
  ])
  const perf = perfAgg.map((r) => ({
    period: `${r._id.y}-${String(r._id.m).padStart(2, "0")}`,
    value: r.value,
  }))

  const divAgg = await Investment.aggregate([
    { $lookup: { from: "businesses", localField: "business", foreignField: "_id", as: "biz" } },
    { $unwind: "$biz" },
    { $group: { _id: "$biz.type", value: { $sum: "$amount" } } },
    { $sort: { value: -1 } },
  ])
  const div = divAgg.map((r) => ({ name: r._id || "Uncategorized", value: r.value }))

  const pnlAgg = await Investment.aggregate([
    {
      $group: {
        _id: "$business",
        profit: { $sum: "$realizedPnL" },
        loss: { $sum: "$unrealizedPnL" },
      },
    },
    { $lookup: { from: "businesses", localField: "_id", foreignField: "_id", as: "biz" } },
    { $unwind: "$biz" },
    { $project: { name: "$biz.name", profit: 1, loss: 1 } },
    { $sort: { profit: -1 } },
    { $limit: 10 },
  ])
  const pnl = pnlAgg.map((r) => ({ name: r.name, profit: r.profit, loss: Math.abs(r.loss) }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Admin Dashboard</h1>
        <p className="text-slate-600 mt-1">Overview of your investment platform</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Capital</CardTitle>
            <DollarSign className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">${totalCapital.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">Under Management</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Businesses</CardTitle>
            <Building2 className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{bizCount}</div>
            <p className="text-xs text-slate-500 mt-1">Total businesses</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Investors</CardTitle>
            <Users className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{investorCount}</div>
            <p className="text-xs text-slate-500 mt-1">Active investors</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PerformanceLine data={perf} />
        <DiversificationPie data={div} />
      </div>

      <PnLBar data={pnl} />
    </div>
  )
}
