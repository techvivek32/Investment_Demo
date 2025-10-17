import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, DollarSign, Building2, Users } from "lucide-react"

async function getAnalytics() {
  await import("@/lib/db").then((m: any) => m.connectToDB?.() || m.connectDB?.() || m.default?.())
  const { Investment } = await import("@/models/investment")
  const { Business } = await import("@/models/business")
  const { User } = await import("@/models/user")

  const [totalInvestedAgg, businessCount, investorCount, byBusiness] = await Promise.all([
    Investment.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
    Business.countDocuments(),
    User.countDocuments({ role: "INVESTOR" }),
    Investment.aggregate([
      { $group: { _id: "$business", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ])
  ])

  const totalInvested = totalInvestedAgg[0]?.total || 0
  const topBusinessesIds = byBusiness.map((b: any) => b._id)
  const businesses = await Business.find({ _id: { $in: topBusinessesIds } }, { name: 1, type: 1 }).lean()
  const bMap = new Map(businesses.map((b: any) => [String(b._id), { name: b.name, type: b.type }]))

  return {
    totalInvested,
    businessCount,
    investorCount,
    topBusinesses: byBusiness.map((b: any) => ({ 
      name: bMap.get(String(b._id))?.name || "Unknown", 
      type: bMap.get(String(b._id))?.type || "Business",
      total: b.total,
      count: b.count
    })),
  }
}

export default async function AdminAnalyticsPage() {
  const session = await import("@/lib/auth-helpers").then(m => m.auth())
  if (!session?.user) return null
  const data = await getAnalytics()
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Analytics Dashboard</h1>
        <p className="text-slate-600 mt-1">Platform performance and investment insights</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Capital</CardTitle>
            <DollarSign className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">${data.totalInvested.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">Under Management</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Businesses</CardTitle>
            <Building2 className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{data.businessCount}</div>
            <p className="text-xs text-slate-500 mt-1">Active businesses</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Investors</CardTitle>
            <Users className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{data.investorCount}</div>
            <p className="text-xs text-slate-500 mt-1">Registered investors</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Investment Destinations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.topBusinesses.length > 0 ? (
            <div className="space-y-4">
              {data.topBusinesses.map((business, index) => (
                <div key={business.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{business.name}</p>
                      <p className="text-sm text-slate-500">{business.type} • {business.count} investment{business.count !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">${business.total.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">Total invested</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No investment data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
