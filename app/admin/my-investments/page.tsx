"use client"

import useSWR from "swr"
import Link from "next/link"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, TrendingDown, Plus, Download, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((r) => {
  console.log('API Response for', url, ':', r.status)
  return r.json().then(data => {
    console.log('API Data for', url, ':', data)
    return data
  })
})

export default function AdminMyInvestmentsPage() {
  const { data: investments, mutate } = useSWR("/api/admin/my-investments", fetcher, {
    fallbackData: []
  })
  const { data: stats } = useSWR("/api/admin/my-investments/stats", fetcher)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  const deleteInvestment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this investment?")) return
    await fetch(`/api/admin/my-investments/${id}`, { method: "DELETE" })
    toast.success("Investment deleted")
    mutate()
  }

  const filtered = Array.isArray(investments) ? investments.filter((inv: any) => {
    const matchSearch = inv.business?.name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "ALL" || inv.status === statusFilter
    return matchSearch && matchStatus
  }) : []

  const calculateROI = (inv: any) => {
    if (!inv.amount) return 0
    const totalPnL = (inv.realizedPnL || 0) + (inv.unrealizedPnL || 0)
    return ((totalPnL / inv.amount) * 100).toFixed(2)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">My Investments</h1>
          <p className="text-slate-600 mt-1">Track your personal investments in other companies</p>
        </div>
        <Link href="/admin/my-investments/new">
          <Button className="bg-gradient-to-r from-blue-500 to-indigo-600">
            <Plus className="h-4 w-4 mr-2" />
            Add Investment
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Invested</CardTitle>
            <DollarSign className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats?.totalInvested || 0).toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Current Value</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats?.currentValue || 0).toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total P&L</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats?.totalPnL || 0).toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Avg ROI</CardTitle>
            <TrendingUp className="h-5 w-5 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.avgROI || 0).toFixed(2)}%</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Investment Portfolio</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by business name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              suppressHydrationWarning
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="CLOSED">Closed</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          <div className="space-y-3">
            {filtered.map((inv: any) => {
              const roi = calculateROI(inv)
              const isPositive = parseFloat(roi) >= 0
              return (
                <Link key={inv._id} href={`/admin/my-investments/${inv._id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{inv.business?.name || "Unknown Business"}</h3>
                            <Badge className={inv.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"}>
                              {inv.status}
                            </Badge>
                            <Badge variant="outline">{inv.instrumentType}</Badge>
                          </div>
                          <div className="flex gap-6 text-sm text-slate-600">
                            <span>Invested: <strong>${inv.amount?.toLocaleString()}</strong></span>
                            <span>Current: <strong>${(inv.currentValue || inv.amount)?.toLocaleString()}</strong></span>
                            <span>Ownership: <strong>{inv.ownershipPercent}%</strong></span>
                            <span>Date: <strong>{new Date(inv.investedAt).toLocaleDateString()}</strong></span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                              {isPositive ? "+" : ""}{roi}%
                            </div>
                            <div className="text-sm text-slate-500">ROI</div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={(e) => { e.preventDefault(); deleteInvestment(inv._id); }} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No investments found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
