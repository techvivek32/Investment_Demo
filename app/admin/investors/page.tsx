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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlusCircle, Trash2, Edit } from "lucide-react"
import { toast } from "sonner"

type Investor = {
  _id: string
  name: string
  email: string
  kyc?: {
    pan?: string
    aadhaar?: string
    verified: boolean
  }
  createdAt: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminInvestorsPage() {
  const { data: investors = [], mutate } = useSWR<Investor[]>("/api/admin/investors", fetcher, {
    fallbackData: [],
  })
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filter, setFilter] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    kyc: {
      pan: "",
      aadhaar: "",
      verified: false
    }
  })
  const [editingId, setEditingId] = useState<string | null>(null)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingId 
        ? `/api/admin/investors/${editingId}`
        : '/api/admin/investors'
      
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Operation failed')
      }

      toast.success(`Investor ${editingId ? 'updated' : 'added'} successfully`)
      mutate()
      setIsDialogOpen(false)
      setFormData({
        name: "",
        email: "",
        password: "",
        kyc: {
          pan: "",
          aadhaar: "",
          verified: false
        }
      })
      setEditingId(null)
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
    }
  }

  const handleEdit = (investor: Investor) => {
    setFormData({
      name: investor.name,
      email: investor.email,
      password: '',
      kyc: {
        pan: investor.kyc?.pan || '',
        aadhaar: investor.kyc?.aadhaar || '',
        verified: investor.kyc?.verified || false
      }
    })
    setEditingId(investor._id)
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
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Investor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit' : 'Add New'} Investor</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  required
                  disabled={!!editingId}
                />
              </div>
              <div className="space-y-2">
                <Label>{editingId ? 'New Password (leave blank to keep current)' : 'Password'}</Label>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required={!editingId}
                />
              </div>
              <div className="space-y-2 pt-4 border-t">
                <h4 className="font-medium">KYC Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>PAN Number</Label>
                    <Input
                      name="kyc.pan"
                      value={formData.kyc.pan}
                      onChange={handleInputChange}
                      placeholder="ABCDE1234F"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Aadhaar Number</Label>
                    <Input
                      name="kyc.aadhaar"
                      value={formData.kyc.aadhaar}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012"
                    />
                  </div>
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
              <div className="flex justify-end space-x-2 pt-4">
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
                        pan: "",
                        aadhaar: "",
                        verified: false
                      }
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
    </div>
  )
}
