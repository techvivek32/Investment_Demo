"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Shield, Calendar, CheckCircle, XCircle } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function InvestorSettingsPage() {
  const { data: profile } = useSWR("/api/investor/profile", fetcher)

  if (!profile) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          My Profile
        </h1>
        <p className="text-slate-600 mt-1">View your account information</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">Full Name</label>
              <div className="p-3 bg-slate-50 rounded-md">
                {profile.name || 'Not provided'}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">Email Address</label>
              <div className="p-3 bg-slate-50 rounded-md flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-500" />
                {profile.email}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Account Created</label>
            <div className="p-3 bg-slate-50 rounded-md flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              {new Date(profile.createdAt).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            KYC Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-md">
            <div className="flex items-center gap-3">
              {profile.kyc?.verified ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">KYC Status</span>
            </div>
            <Badge className={profile.kyc?.verified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
              {profile.kyc?.verified ? 'Verified' : 'Pending Verification'}
            </Badge>
          </div>
          
          {profile.kyc?.pan && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">PAN Number</label>
              <div className="p-3 bg-slate-50 rounded-md">
                {profile.kyc.pan}
              </div>
            </div>
          )}
          
          {profile.kyc?.aadhaar && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">Aadhaar Number</label>
              <div className="p-3 bg-slate-50 rounded-md">
                {profile.kyc.aadhaar.replace(/.(?=.{4})/g, '*')}
              </div>
            </div>
          )}
          
          {!profile.kyc?.verified && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Your KYC verification is pending. Please contact the administrator for assistance.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Need to update your information?</strong> Please contact the administrator to make changes to your profile.
        </p>
      </div>
    </div>
  )
}
