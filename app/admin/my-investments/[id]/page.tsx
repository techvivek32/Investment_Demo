"use client"

import useSWR from "swr"
import { useParams } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Download, FileText, TrendingUp, Plus, Edit } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function InvestmentDetailPage() {
  const params = useParams()
  const { data: investment, mutate } = useSWR(`/api/admin/my-investments/${params.id}`, fetcher)

  const extractEmbedUrl = (url: string): string => {
    if (!url) return ""
    
    const cleanUrl = url.trim()
    
    // If already an embed URL, return as is
    if (cleanUrl.includes('google.com/maps/embed') || cleanUrl.includes('maps/embed/v1')) {
      return cleanUrl
    }
    
    // Extract from iframe HTML
    const iframeMatch = cleanUrl.match(/src=["']([^"']*google\.com\/maps\/embed[^"']*)["']/)
    if (iframeMatch) {
      return iframeMatch[1]
    }
    
    // Convert regular Google Maps URL to embed URL
    if (cleanUrl.includes('google.com/maps') || cleanUrl.includes('maps.google.com')) {
      // Extract coordinates
      const coordMatch = cleanUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
      if (coordMatch) {
        const [, lat, lng] = coordMatch
        return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d12000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2s!4v${Date.now()}`
      }
      
      // Extract place name from URL
      const placeMatch = cleanUrl.match(/\/place\/([^/@?]+)/)
      if (placeMatch) {
        const place = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '))
        return `https://www.google.com/maps/embed/v1/place?key=demo&q=${encodeURIComponent(place)}`
      }
      
      // Handle search queries
      const searchMatch = cleanUrl.match(/\/search\/([^/@?]+)/)
      if (searchMatch) {
        const query = decodeURIComponent(searchMatch[1].replace(/\+/g, ' '))
        return `https://www.google.com/maps/embed/v1/search?key=demo&q=${encodeURIComponent(query)}`
      }
    }
    
    return cleanUrl
  }
  const [showMetricsDialog, setShowMetricsDialog] = useState(false)
  const [showTransactionDialog, setShowTransactionDialog] = useState(false)
  const [showMapDialog, setShowMapDialog] = useState(false)
  const [showDocumentDialog, setShowDocumentDialog] = useState(false)
  const [metricsForm, setMetricsForm] = useState({ currentValue: "" })
  const [transactionForm, setTransactionForm] = useState({ type: "CONTRIBUTION", amount: "", note: "" })
  const [mapForm, setMapForm] = useState({ mapLink: "" })
  const [documentForm, setDocumentForm] = useState({ type: "AGREEMENT", note: "" })
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)

  const updateMetrics = async () => {
    await fetch(`/api/admin/my-investments/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentValue: parseFloat(metricsForm.currentValue) || 0
      })
    })
    toast.success("Current value updated")
    setShowMetricsDialog(false)
    mutate()
  }

  const addTransaction = async () => {
    const transactions = investment.transactions || []
    transactions.push({
      type: transactionForm.type,
      amount: parseFloat(transactionForm.amount),
      note: transactionForm.note,
      date: new Date()
    })
    await fetch(`/api/admin/my-investments/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactions })
    })
    toast.success("Transaction added")
    setShowTransactionDialog(false)
    setTransactionForm({ type: "CONTRIBUTION", amount: "", note: "" })
    mutate()
  }

  const updateMapLink = async () => {
    await fetch(`/api/admin/my-investments/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mapLink: mapForm.mapLink })
    })
    toast.success("Map location updated")
    setShowMapDialog(false)
    mutate()
  }

  const uploadDocuments = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return
    
    setUploading(true)
    try {
      const documents = investment.documents || []
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const formData = new FormData()
        formData.append('file', file)
        
        const uploadRes = await fetch('/api/uploads', {
          method: 'POST',
          body: formData
        })
        
        if (uploadRes.ok) {
          const { path } = await uploadRes.json()
          documents.push({
            filename: file.name,
            path: path,
            type: documentForm.type,
            uploadDate: new Date(),
            size: file.size,
            note: documentForm.note
          })
        }
      }
      
      await fetch(`/api/admin/my-investments/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documents })
      })
      
      toast.success(`${selectedFiles.length} document(s) uploaded successfully`)
      setShowDocumentDialog(false)
      setSelectedFiles(null)
      setDocumentForm({ type: "AGREEMENT", note: "" })
      mutate()
    } catch (error) {
      toast.error("Failed to upload documents")
    }
    setUploading(false)
  }

  if (!investment) return <div>Loading...</div>

  const currentValue = investment.currentValue || investment.amount || 0
  const totalPnL = currentValue - (investment.amount || 0)
  const roi = investment.amount > 0 ? ((totalPnL / investment.amount) * 100).toFixed(2) : 0
  const isPositive = totalPnL >= 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/my-investments">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {investment.business?.name}
          </h1>
          <p className="text-slate-600 mt-1">Your personal investment details</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showMetricsDialog} onOpenChange={setShowMetricsDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => {
                setMetricsForm({
                  currentValue: investment.currentValue?.toString() || investment.amount?.toString() || "0"
                })
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Update Value
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Current Value</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Current Value ($)</Label>
                  <Input type="number" step="0.01" value={metricsForm.currentValue} onChange={(e) => setMetricsForm({...metricsForm, currentValue: e.target.value})} />
                  <p className="text-sm text-slate-500">P&L will be calculated automatically (Current Value - Invested Amount)</p>
                </div>
                <Button onClick={updateMetrics} className="w-full">Update Value</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Invested Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${investment.amount?.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">{new Date(investment.investedAt).toLocaleDateString()}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Current Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(investment.currentValue || investment.amount)?.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">Ownership: {investment.ownershipPercent}%</p>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${isPositive ? 'border-l-green-500' : 'border-l-red-500'} shadow-sm`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{roi}%
            </div>
            <p className="text-xs text-slate-500 mt-1">P&L: ${totalPnL.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Investment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Business Type:</span>
              <span className="font-medium">{investment.business?.type || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Instrument Type:</span>
              <Badge variant="outline">{investment.instrumentType}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Status:</span>
              <Badge className={investment.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                {investment.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Location:</span>
              <span className="font-medium">{investment.business?.location || 'N/A'}</span>
            </div>
            {investment.notes && (
              <div className="pt-2 border-t">
                <span className="text-slate-600 text-sm">Notes:</span>
                <p className="text-sm mt-1">{investment.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Invested Amount:</span>
              <span className="font-medium">${investment.amount?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Current Value:</span>
              <span className="font-medium">${currentValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-slate-600 font-medium">Total P&L:</span>
              <span className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}${totalPnL.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transactions</CardTitle>
            <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Transaction</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Type</Label>
                    <select value={transactionForm.type} onChange={(e) => setTransactionForm({...transactionForm, type: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="CONTRIBUTION">Contribution</option>
                      <option value="DISTRIBUTION">Distribution</option>
                      <option value="DIVIDEND">Dividend</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Amount ($)</Label>
                    <Input type="number" step="0.01" value={transactionForm.amount} onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Note</Label>
                    <Textarea value={transactionForm.note} onChange={(e) => setTransactionForm({...transactionForm, note: e.target.value})} />
                  </div>
                  <Button onClick={addTransaction} className="w-full">Add Transaction</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {investment.transactions && investment.transactions.length > 0 ? (
            <div className="space-y-2">
              {investment.transactions.map((txn: any, index: number) => (
                <div key={txn._id || index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{txn.type}</p>
                    <p className="text-sm text-slate-500">{new Date(txn.date).toLocaleDateString()}</p>
                    {txn.note && <p className="text-sm text-slate-600 mt-1">{txn.note}</p>}
                  </div>
                  <span className="font-semibold">${txn.amount?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No transactions recorded</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Documents</CardTitle>
            <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Documents
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload Documents</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Document Type</Label>
                    <select value={documentForm.type} onChange={(e) => setDocumentForm({...documentForm, type: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="AGREEMENT">Agreement</option>
                      <option value="RECEIPT">Receipt</option>
                      <option value="PROOF">Proof</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="INVOICE">Invoice</option>
                      <option value="REPORT">Report</option>
                      <option value="IMAGE">Image</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Files (All formats supported, no size limit)</Label>
                    <input 
                      type="file" 
                      multiple 
                      onChange={(e) => setSelectedFiles(e.target.files)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer file:border-0 file:bg-transparent file:text-sm file:font-medium"
                      accept="*/*"
                    />
                    <p className="text-xs text-slate-500">Select multiple files: PDF, DOC, XLS, ZIP, Images, etc.</p>
                  </div>
                  <div className="grid gap-2">
                    <Label>Note (Optional)</Label>
                    <Textarea 
                      value={documentForm.note} 
                      onChange={(e) => setDocumentForm({...documentForm, note: e.target.value})} 
                      placeholder="Add a note about these documents"
                      rows={2}
                    />
                  </div>
                  {selectedFiles && selectedFiles.length > 0 && (
                    <div className="p-3 bg-slate-50 rounded-md">
                      <p className="text-sm font-medium mb-2">Selected Files ({selectedFiles.length}):</p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {Array.from(selectedFiles).map((file, index) => (
                          <div key={index} className="text-xs text-slate-600 flex justify-between">
                            <span className="truncate">{file.name}</span>
                            <span>{(file.size / 1024 / 1024).toFixed(1)}MB</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <Button 
                    onClick={uploadDocuments} 
                    disabled={!selectedFiles || selectedFiles.length === 0 || uploading}
                    className="w-full"
                  >
                    {uploading ? "Uploading..." : `Upload ${selectedFiles?.length || 0} File(s)`}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {investment.documents && investment.documents.length > 0 ? (
            <div className="space-y-2">
              {investment.documents.map((doc: any, index: number) => (
                <div key={doc._id || index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">{doc.filename}</p>
                      <div className="flex gap-2 text-sm text-slate-500">
                        <span>{doc.type}</span>
                        <span>•</span>
                        <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                        {doc.size && (
                          <>
                            <span>•</span>
                            <span>{(doc.size / 1024 / 1024).toFixed(1)}MB</span>
                          </>
                        )}
                      </div>
                      {doc.note && <p className="text-xs text-slate-600 mt-1">{doc.note}</p>}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No documents uploaded</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Business Location</CardTitle>
            <Dialog open={showMapDialog} onOpenChange={setShowMapDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" onClick={() => setMapForm({ mapLink: investment.mapLink || "" })}>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Location
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Map Location</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Google Maps Embed Link</Label>
                    <Input value={mapForm.mapLink} onChange={(e) => setMapForm({ mapLink: e.target.value })} placeholder="Paste embed URL" />
                    <p className="text-xs text-slate-500">Go to Google Maps → Share → Embed a map → Copy HTML</p>
                  </div>
                  <Button onClick={updateMapLink} className="w-full">Update Location</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {investment.mapLink ? (() => {
            const embedUrl = extractEmbedUrl(investment.mapLink)
            return (
              <div className="w-full h-96 rounded-lg overflow-hidden">
                <iframe
                  src={embedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )
          })() : (
            <p className="text-slate-500 text-center py-8">No map location added</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
