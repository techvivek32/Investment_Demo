"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Settings, Palette, Shield, Bell, Database, Users } from "lucide-react"
import { toast } from "sonner"

export default function AdminSettingsPage() {
  const [platformForm, setPlatformForm] = useState({ 
    platformName: "Investment Manager", 
    logo: "", 
    description: "Professional investment management platform",
    contactEmail: "admin@investmentmanager.com"
  })
  const [securityForm, setSecurityForm] = useState({
    twoFactorEnabled: false,
    sessionTimeout: "24",
    passwordPolicy: "strong"
  })
  const [notificationForm, setNotificationForm] = useState({
    emailNotifications: true,
    investmentAlerts: true,
    systemUpdates: false
  })
  const [loading, setLoading] = useState(false)

  const saveSettings = async (section: string, data: any) => {
    setLoading(true)
    const res = await fetch("/api/admin/settings", { 
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, ...data }) 
    })
    setLoading(false)
    if (res.ok) toast.success("Settings saved successfully")
    else toast.error("Failed to save settings")
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Settings & Configuration</h1>
        <p className="text-slate-600 mt-1">Manage platform settings and preferences</p>
      </div>

      <div className="grid gap-6">
        {/* Platform Settings */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Platform Branding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Platform Name</Label>
              <Input 
                value={platformForm.platformName} 
                onChange={(e) => setPlatformForm({ ...platformForm, platformName: e.target.value })} 
                placeholder="Investment Manager"
              />
            </div>
            <div className="grid gap-2">
              <Label>Platform Description</Label>
              <Textarea 
                value={platformForm.description} 
                onChange={(e) => setPlatformForm({ ...platformForm, description: e.target.value })} 
                placeholder="Brief description of your platform"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label>Contact Email</Label>
              <Input 
                type="email"
                value={platformForm.contactEmail} 
                onChange={(e) => setPlatformForm({ ...platformForm, contactEmail: e.target.value })} 
                placeholder="admin@yourplatform.com"
              />
            </div>
            <div className="grid gap-2">
              <Label>Logo URL</Label>
              <Input 
                value={platformForm.logo} 
                onChange={(e) => setPlatformForm({ ...platformForm, logo: e.target.value })} 
                placeholder="https://yoursite.com/logo.png"
              />
            </div>
            <Button onClick={() => saveSettings('platform', platformForm)} disabled={loading}>
              {loading ? "Saving..." : "Save Platform Settings"}
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-slate-500">Require 2FA for admin accounts</p>
              </div>
              <Switch 
                checked={securityForm.twoFactorEnabled}
                onCheckedChange={(checked) => setSecurityForm({ ...securityForm, twoFactorEnabled: checked })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Session Timeout (hours)</Label>
              <Input 
                type="number"
                value={securityForm.sessionTimeout} 
                onChange={(e) => setSecurityForm({ ...securityForm, sessionTimeout: e.target.value })} 
                placeholder="24"
              />
            </div>
            <div className="grid gap-2">
              <Label>Password Policy</Label>
              <select 
                value={securityForm.passwordPolicy}
                onChange={(e) => setSecurityForm({ ...securityForm, passwordPolicy: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="basic">Basic (8+ characters)</option>
                <option value="strong">Strong (8+ chars, mixed case, numbers)</option>
                <option value="strict">Strict (12+ chars, mixed case, numbers, symbols)</option>
              </select>
            </div>
            <Button onClick={() => saveSettings('security', securityForm)} disabled={loading}>
              {loading ? "Saving..." : "Save Security Settings"}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-slate-500">Send email alerts for important events</p>
              </div>
              <Switch 
                checked={notificationForm.emailNotifications}
                onCheckedChange={(checked) => setNotificationForm({ ...notificationForm, emailNotifications: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Investment Alerts</Label>
                <p className="text-sm text-slate-500">Notify about new investments and updates</p>
              </div>
              <Switch 
                checked={notificationForm.investmentAlerts}
                onCheckedChange={(checked) => setNotificationForm({ ...notificationForm, investmentAlerts: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>System Updates</Label>
                <p className="text-sm text-slate-500">Receive notifications about system maintenance</p>
              </div>
              <Switch 
                checked={notificationForm.systemUpdates}
                onCheckedChange={(checked) => setNotificationForm({ ...notificationForm, systemUpdates: checked })}
              />
            </div>
            <Button onClick={() => saveSettings('notifications', notificationForm)} disabled={loading}>
              {loading ? "Saving..." : "Save Notification Settings"}
            </Button>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Platform Version:</span>
              <span className="font-medium">v1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Database Status:</span>
              <span className="font-medium text-green-600">Connected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Last Backup:</span>
              <span className="font-medium">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Environment:</span>
              <span className="font-medium">Development</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
