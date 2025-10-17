"use client"

import useSWR from "swr"
import { useParams } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, FolderOpen, Trash2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function BusinessProjectsPage() {
  const params = useParams()
  const { data: business } = useSWR(`/api/admin/my-businesses/${params.id}`, fetcher)
  const { data: projects, mutate } = useSWR(`/api/projects?business=${params.id}`, fetcher)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "PLANNED"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        business: params.id
      })
    })

    setLoading(false)
    setShowForm(false)
    setForm({ name: "", description: "", status: "PLANNED" })
    mutate()
  }

  const deleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return
    await fetch(`/api/projects/${id}`, { method: "DELETE" })
    toast.success("Project deleted")
    mutate()
  }

  const statusColors: Record<string, string> = {
    PLANNED: "bg-slate-100 text-slate-700",
    ACTIVE: "bg-green-100 text-green-700",
    COMPLETED: "bg-blue-100 text-blue-700",
    ON_HOLD: "bg-yellow-100 text-yellow-700"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/my-businesses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {business?.name} - Projects
          </h1>
          <p className="text-slate-600 mt-1">Manage projects for this business</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-500 to-indigo-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {showForm && (
        <Card className="shadow-sm border-blue-200">
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="PLANNED">Planned</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ON_HOLD">On Hold</option>
                </select>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={loading || !form.name}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600"
                >
                  {loading ? "Creating..." : "Create Project"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {(projects || []).map((project: any) => (
          <Card key={project._id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <FolderOpen className="h-5 w-5 text-blue-500" />
                      <h3 className="text-lg font-semibold">{project.name}</h3>
                      <Badge className={statusColors[project.status] || statusColors.PLANNED}>
                        {project.status}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteProject(project._id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">{project.description || "No description"}</p>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-slate-500">Milestones: </span>
                      <span className="font-medium">{project.milestones?.length || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Expenses: </span>
                      <span className="font-medium">{project.expenses?.length || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Created: </span>
                      <span className="font-medium">{new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects && projects.length === 0 && !showForm && (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-500 mb-4">No projects yet</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Project
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
