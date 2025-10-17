"use client"

import useSWR from "swr"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Download, FileText } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function InvestorInvestmentsPage() {
  const { data: investments } = useSWR("/api/investor/investments", fetcher)
  const [search, setSearch] = useState("")

  const filtered = (investments || []).filter((inv: any) =>
    inv.business?.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          My Investments
        </h1>
        <p className="text-slate-600 mt-1">View all your investment records</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Investment Portfolio</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by business name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-3">
            {filtered.map((inv: any) => (
              <Card key={inv._id} className="hover:shadow-md transition-shadow">
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
                        <span>Amount: <strong>${inv.amount?.toLocaleString()}</strong></span>
                        <span>Ownership: <strong>{inv.ownershipPercent}%</strong></span>
                        <span>Date: <strong>{new Date(inv.investedAt).toLocaleDateString()}</strong></span>
                      </div>
                      {inv.notes && (
                        <p className="text-sm text-slate-500 mt-2">{inv.notes}</p>
                      )}
                    </div>
                    {inv.documents && inv.documents.length > 0 && (
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Documents
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No investments found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
