// "use client"

// import useSWR from "swr"
// import { useState } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Input } from "@/components/ui/input"
// import { Trash2 } from "lucide-react"
// import { toast } from "sonner"

// const fetcher = (url: string) => fetch(url).then((r) => r.json())

// export default function AdminInvestorsPage() {
//   const { data: businesses } = useSWR("/api/businesses", fetcher)
//   const { data: investors, mutate } = useSWR("/api/investors", fetcher, {
//     fallbackData: [],
//   })
//   const [selectedBiz, setSelectedBiz] = useState<string | null>(null)
//   const [filter, setFilter] = useState("")

//   const assignInvestor = async (investorId: string) => {
//     if (!selectedBiz) return
//     await fetch("/api/investments", {
//       method: "POST",
//       body: JSON.stringify({ investor: investorId, business: selectedBiz, amount: 0 }),
//     })
//     mutate()
//   }

//   const deleteInvestor = async (id: string) => {
//     if (!confirm("Are you sure you want to delete this investor?")) return
//     await fetch(`/api/investors/${id}`, { method: "DELETE" })
//     toast.success("Investor deleted")
//     mutate()
//   }

//   return (
//     <main className="p-6 max-w-6xl mx-auto grid gap-6">
//       <header className="flex items-center justify-between">
//         <h1 className="text-2xl font-semibold text-balance">Manage Investors</h1>
//       </header>

//       <Card>
//         <CardHeader>
//           <CardTitle>Assign Investor to Business</CardTitle>
//         </CardHeader>
//         <CardContent className="grid md:grid-cols-2 gap-4">
//           <div className="grid gap-2">
//             <Label>Business</Label>
//             <Select value={selectedBiz || ""} onValueChange={(v) => setSelectedBiz(v)}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select business" />
//               </SelectTrigger>
//               <SelectContent>
//                 {(businesses || []).map((b: any) => (
//                   <SelectItem key={b._id} value={b._id}>
//                     {b.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//           <div className="grid gap-2">
//             <Label>Filter investors</Label>
//             <Input placeholder="Search email or name" value={filter} onChange={(e) => setFilter(e.target.value)} />
//           </div>
//         </CardContent>
//       </Card>

//       <section className="grid gap-3">
//         <h2 className="text-xl font-semibold">All Investors</h2>
//         <div className="grid gap-2">
//           {(investors || [])
//             .filter((u: any) => (u.email + " " + (u.name || "")).toLowerCase().includes(filter.toLowerCase()))
//             .map((u: any) => (
//               <div key={u._id} className="flex items-center justify-between border rounded-md p-3">
//                 <div>
//                   <p className="font-medium">{u.email}</p>
//                   <p className="text-sm text-muted-foreground">{u.name || "—"}</p>
//                 </div>
//                 <div className="flex gap-2">
//                   <Button onClick={() => assignInvestor(u._id)} disabled={!selectedBiz}>
//                     Assign
//                   </Button>
//                   <Button variant="ghost" size="icon" onClick={() => deleteInvestor(u._id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
//                     <Trash2 className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             ))}
//         </div>
//       </section>
//     </main>
//   )
// }



"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusCircle, Trash2, Edit, Eye } from "lucide-react"
import { toast } from "sonner"

type Investor = {
  _id: string
  name: string
  email: string
  kyc?: {
    pan?: string
    aadhaar?: string
    verified: boolean
    documents?: Record<string, string>
  }
  createdAt: string
}

type Business = {
  _id: string
  name: string
  description?: string
  valuation: number
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminInvestorsPage() {
  const { data: investors = [], mutate } = useSWR<Investor[]>("/api/admin/investors", fetcher, {
    fallbackData: [],
  })
  const { data: businesses = [] } = useSWR<Business[]>("/api/admin/my-businesses", fetcher, {
    fallbackData: [],
  })
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filter, setFilter] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    kyc: {
      verified: false,
      documents: [] as File[],
      existingDocs: [] as string[]
    },
    selectedBusinesses: [] as string[],
    businessInvestments: {} as Record<string, { amount: number; percentage: number }>
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewingInvestor, setViewingInvestor] = useState<Investor | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewInvestments, setViewInvestments] = useState<any[]>([])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    
    if (name.startsWith('kyc.')) {
      const kycField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        kyc: {
          ...prev.kyc,
          [kycField]: type === 'checkbox' ? checked : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleBusinessSelection = (businessId: string, checked: boolean) => {
    setFormData(prev => {
      const newSelected = checked 
        ? [...prev.selectedBusinesses, businessId]
        : prev.selectedBusinesses.filter(id => id !== businessId)
      
      const newInvestments = { ...prev.businessInvestments }
      if (checked) {
        newInvestments[businessId] = { amount: 0, percentage: 0 }
      } else {
        delete newInvestments[businessId]
      }
      
      return {
        ...prev,
        selectedBusinesses: newSelected,
        businessInvestments: newInvestments
      }
    })
  }

  const handleInvestmentChange = (businessId: string, field: 'amount' | 'percentage', value: number) => {
    setFormData(prev => ({
      ...prev,
      businessInvestments: {
        ...prev.businessInvestments,
        [businessId]: {
          ...prev.businessInvestments[businessId],
          [field]: value
        }
      }
    }))
  }

  const handleFileChange = (index: number, file: File | null) => {
    setFormData(prev => {
      const newDocs = [...prev.kyc.documents]
      if (file) {
        newDocs[index] = file
      } else {
        newDocs.splice(index, 1)
      }
      return {
        ...prev,
        kyc: {
          ...prev.kyc,
          documents: newDocs
        }
      }
    })
  }

  const addDocumentField = () => {
    setFormData(prev => ({
      ...prev,
      kyc: {
        ...prev.kyc,
        documents: [...prev.kyc.documents, null as any]
      }
    }))
  }

  const removeDocumentField = (index: number) => {
    setFormData(prev => {
      const newDocs = prev.kyc.documents.filter((_, i) => i !== index)
      const newExisting = prev.kyc.existingDocs.filter((_, i) => i !== index)
      return {
        ...prev,
        kyc: {
          ...prev.kyc,
          documents: newDocs,
          existingDocs: newExisting
        }
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingId 
        ? `/api/admin/investors/${editingId}`
        : '/api/admin/investors'
      
      const method = editingId ? 'PUT' : 'POST'
      
      const submitData = new FormData()
      submitData.append('name', formData.name || '')
      submitData.append('email', formData.email || '')
      submitData.append('password', formData.password || '')
      submitData.append('kyc.verified', formData.kyc.verified.toString())
      
      console.log('Form data being sent:', {
        name: formData.name,
        email: formData.email,
        password: formData.password ? '***' : 'empty',
        verified: formData.kyc.verified
      })
      
      // Add files - ensure sequential indices without gaps
      console.log('Form files:', formData.kyc.documents)
      let docIndex = 0
      formData.kyc.documents.forEach((file, index) => {
        if (file) {
          console.log(`Adding document${docIndex}:`, file.name)
          submitData.append(`document${docIndex}`, file)
          docIndex++
        }
      })
      console.log(`Total documents being sent: ${docIndex}`)
      
      // Add businesses
      submitData.append('businesses', JSON.stringify(
        formData.selectedBusinesses.map(businessId => ({
          businessId,
          amount: formData.businessInvestments[businessId]?.amount || 0,
          percentage: formData.businessInvestments[businessId]?.percentage || 0
        }))
      ))
      
      const response = await fetch(url, {
        method,
        body: submitData
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('API Error:', error)
        throw new Error(error.error || 'Operation failed')
      }

      toast.success(`Investor ${editingId ? 'updated' : 'added'} successfully`)
      await mutate() // Wait for data refresh
      
      // Force a small delay to ensure data is updated
      setTimeout(async () => {
        await mutate()
      }, 500)
      
      setIsDialogOpen(false)
      setFormData({
        name: "",
        email: "",
        password: "",
        kyc: {
          verified: false,
          documents: [],
          existingDocs: []
        },
        selectedBusinesses: [],
        businessInvestments: {}
      })
      setEditingId(null)
    } catch (error: any) {
      console.error('Submit error:', error)
      toast.error(error.message || 'An error occurred')
    }
  }

  const handleView = async (investor: Investor) => {
    console.log('View - investor data:', investor)
    console.log('View - kyc:', investor.kyc)
    console.log('View - documents:', investor.kyc?.documents)
    setViewingInvestor(investor)
    setIsViewDialogOpen(true)
    
    // Fetch investments for this investor
    try {
      const response = await fetch(`/api/investments?investor=${investor._id}`)
      const investments = await response.json()
      setViewInvestments(investments)
    } catch (error) {
      console.error('Failed to load investments:', error)
      setViewInvestments([])
    }
  }

  const handleEdit = async (investor: Investor) => {
    setEditingId(investor._id)
    console.log('Edit - investor data:', investor)
    console.log('Edit - kyc:', investor.kyc)
    console.log('Edit - documents:', investor.kyc?.documents)
    
    try {
      // Fetch existing investments for this investor
      const response = await fetch(`/api/investments?investor=${investor._id}`)
      const investments = await response.json()
      
      const selectedBusinesses: string[] = []
      const businessInvestments: Record<string, { amount: number; percentage: number }> = {}
      
      investments.forEach((inv: any) => {
        selectedBusinesses.push(inv.business._id || inv.business)
        businessInvestments[inv.business._id || inv.business] = {
          amount: inv.amount || 0,
          percentage: inv.ownershipPercent || 0
        }
      })
      
      const existingDocs = investor.kyc?.documents || {}
      const docValues = Object.values(existingDocs).filter(doc => doc)
      
      setFormData({
        name: investor.name,
        email: investor.email,
        password: '',
        kyc: {
          verified: investor.kyc?.verified || false,
          documents: new Array(Math.max(docValues.length, 1)).fill(null),
          existingDocs: docValues
        },
        selectedBusinesses,
        businessInvestments
      })
    } catch (error) {
      console.error('Failed to load investments:', error)
      const existingDocs = investor.kyc?.documents || {}
      const docValues = Object.values(existingDocs).filter(doc => doc)
      
      setFormData({
        name: investor.name,
        email: investor.email,
        password: '',
        kyc: {
          verified: investor.kyc?.verified || false,
          documents: new Array(Math.max(docValues.length, 1)).fill(null),
          existingDocs: docValues
        },
        selectedBusinesses: [],
        businessInvestments: {}
      })
    }
    
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this investor?')) return
    
    try {
      const response = await fetch(`/api/admin/investors/${id}`, { 
        method: 'DELETE' 
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete')
      }
      
      toast.success('Investor deleted successfully')
      mutate()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete investor')
    }
  }

  const filteredInvestors = investors.filter(investor => 
    investor.name.toLowerCase().includes(filter.toLowerCase()) ||
    investor.email.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Investors</h1>
          <p className="text-muted-foreground">Manage all investor accounts</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingId(null)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Investor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{editingId ? 'Edit' : 'Add New'} Investor</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">Fill in the investor details below</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <h3 className="font-semibold text-gray-800">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      required
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      required
                      disabled={!!editingId}
                      className="bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{editingId ? 'New Password (leave blank to keep current)' : 'Password *'}</Label>
                  <Input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    required={!editingId}
                    className="bg-white"
                  />
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                <h3 className="font-semibold text-gray-800">KYC Details</h3>

                <div className="space-y-4">
                  {Math.max(formData.kyc.documents.length, formData.kyc.existingDocs.length, 1) > 0 && 
                    Array.from({ length: Math.max(formData.kyc.documents.length, formData.kyc.existingDocs.length, 1) }).map((_, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Document {index + 1}</Label>
                            {index > 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeDocumentField(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          <Input
                            type="file"
                            onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
                            className="bg-white file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700"
                          />
                          {(formData.kyc.documents[index] || formData.kyc.existingDocs[index]) && (
                            <div className="space-y-1">
                              <p className="text-xs text-green-600">✓ {formData.kyc.documents[index]?.name || `Document ${index + 1}`}</p>
                              {formData.kyc.documents[index] ? (
                                formData.kyc.documents[index].type.startsWith('image/') && (
                                  <img 
                                    src={URL.createObjectURL(formData.kyc.documents[index])} 
                                    alt={`Document ${index + 1} Preview`} 
                                    className="w-20 h-12 object-cover rounded border"
                                  />
                                )
                              ) : formData.kyc.existingDocs[index] && (
                                <img 
                                  src={`/${formData.kyc.existingDocs[index]}`} 
                                  alt={`Document ${index + 1}`} 
                                  className="w-20 h-12 object-cover rounded border"
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  }
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addDocumentField}
                    className="w-full"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Document
                  </Button>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="kyc-verified"
                    name="kyc.verified"
                    checked={formData.kyc.verified}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="kyc-verified" className="text-sm font-medium">
                    KYC Verified
                  </label>
                </div>
              </div>
              {(
                <div className="bg-green-50 p-4 rounded-lg space-y-4">
                  <h3 className="font-semibold text-gray-800">Business Assignments</h3>
                  <p className="text-sm text-muted-foreground">Select businesses and set investment details</p>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {businesses.map((business) => (
                      <div key={business._id} className="bg-white border rounded-lg p-3 space-y-3">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={`business-${business._id}`}
                            checked={formData.selectedBusinesses.includes(business._id)}
                            onCheckedChange={(checked) => 
                              handleBusinessSelection(business._id, checked as boolean)
                            }
                          />
                          <label 
                            htmlFor={`business-${business._id}`} 
                            className="font-medium cursor-pointer flex-1"
                          >
                            {business.name}
                            {business.description && (
                              <span className="text-muted-foreground text-sm block">- {business.description}</span>
                            )}
                          </label>
                        </div>
                        {formData.selectedBusinesses.includes(business._id) && (
                          <div className="grid grid-cols-2 gap-3 ml-6 pt-2 border-t">
                            <div>
                              <Label className="text-sm font-medium">Investment Amount ($)</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={formData.businessInvestments[business._id]?.amount || ''}
                                onChange={(e) => handleInvestmentChange(
                                  business._id, 
                                  'amount', 
                                  parseFloat(e.target.value) || 0
                                )}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Ownership (%)</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                max="100"
                                value={formData.businessInvestments[business._id]?.percentage || ''}
                                onChange={(e) => handleInvestmentChange(
                                  business._id, 
                                  'percentage', 
                                  parseFloat(e.target.value) || 0
                                )}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-3 pt-6 border-t bg-gray-50 -mx-6 px-6 py-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    setFormData({
                      name: "",
                      email: "",
                      password: "",
                      kyc: {
                        verified: false,
                        documents: [],
                        existingDocs: []
                      },
                      selectedBusinesses: [],
                      businessInvestments: {}
                    })
                    setEditingId(null)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingId ? 'Update' : 'Create'} Investor
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Investor List</CardTitle>
              <CardDescription>Manage all investor accounts</CardDescription>
            </div>
            <div className="w-full md:w-64">
              <Input
                placeholder="Search investors..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <div className="grid grid-cols-12 gap-4 p-4 border-b bg-gray-50">
              <div className="col-span-4 font-medium">Name</div>
              <div className="col-span-4 font-medium">Email</div>
              <div className="col-span-2 font-medium">KYC Status</div>
              <div className="col-span-2 text-right font-medium">Actions</div>
            </div>
            {filteredInvestors.length > 0 ? (
              filteredInvestors.map((investor) => (
                <div key={investor._id} className="grid grid-cols-12 gap-4 p-4 border-b items-center">
                  <div className="col-span-4">{investor.name}</div>
                  <div className="col-span-4">{investor.email}</div>
                  <div className="col-span-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      investor.kyc?.verified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {investor.kyc?.verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleView(investor)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(investor)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(investor._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                {filter ? 'No matching investors found' : 'No investors found'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Investor Detail View Modal */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Investor Details</DialogTitle>
            <DialogDescription>View investor information and documents</DialogDescription>
          </DialogHeader>
          {viewingInvestor && (
            <div className="space-y-6 mt-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xl">
                    {viewingInvestor.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{viewingInvestor.name}</h3>
                  <p className="text-gray-600">{viewingInvestor.email}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                    viewingInvestor.kyc?.verified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {viewingInvestor.kyc?.verified ? 'KYC Verified' : 'KYC Pending'}
                  </span>
                </div>
              </div>
              

              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Member Since</h4>
                <p className="text-gray-900">{new Date(viewingInvestor.createdAt).toLocaleDateString()}</p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">KYC Documents</h4>
                <div className="grid grid-cols-2 gap-4">
                  {viewingInvestor.kyc?.documents && Object.keys(viewingInvestor.kyc.documents).length > 0 ? (
                    Object.entries(viewingInvestor.kyc.documents)
                      .filter(([key, doc]) => doc && doc.trim() !== '')
                      .map(([key, doc], index) => (
                        <div key={key} className="p-3 bg-gray-50 rounded space-y-2">
                          <p className="text-sm font-medium text-gray-700">{key.replace('document', 'Document ')}</p>
                          <img 
                            src={`/${doc}`} 
                            alt={key} 
                            className="w-24 h-16 object-cover rounded border"
                          />
                          <p className="text-xs text-green-600">✓ Uploaded</p>
                        </div>
                      ))
                  ) : (
                    <div className="col-span-2 p-8 text-center text-gray-500">
                      No documents uploaded
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Business Investments</h4>
                {viewInvestments.length > 0 ? (
                  <div className="space-y-2">
                    {viewInvestments.map((investment: any) => (
                      <div key={investment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{investment.business?.name || 'Unknown Business'}</p>
                          <p className="text-sm text-gray-600">{investment.business?.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${investment.amount?.toLocaleString() || 0}</p>
                          <p className="text-sm text-gray-600">{investment.ownershipPercent || 0}% ownership</p>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            investment.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                            investment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {investment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No investments yet</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    setTimeout(() => handleEdit(viewingInvestor), 100)
                  }}
                >
                  Edit Investor
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
