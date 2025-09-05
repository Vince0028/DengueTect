"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Settings, Bell, Shield, Globe, Camera, MapPin, Moon, Sun } from "lucide-react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:bg-black">
      <DashboardHeader />

      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-3">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>

        <div className="space-y-4">
          <Card className="border-emerald-200 dark:border-emerald-800 dark:bg-gray-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center dark:text-white">
                {theme === "dark" ? (
                  <Moon className="mr-2 h-5 w-5 text-emerald-600" />
                ) : (
                  <Sun className="mr-2 h-5 w-5 text-emerald-600" />
                )}
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium dark:text-white">Dark Mode</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Switch between light and dark themes</p>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-emerald-200 dark:border-emerald-800 dark:bg-gray-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center dark:text-white">
                <Bell className="mr-2 h-5 w-5 text-emerald-600" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium dark:text-white">Health Reminders</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get notified about dengue prevention tips</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium dark:text-white">Risk Alerts</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receive alerts for high-risk assessments</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Permissions */}
          <Card className="border-emerald-200 dark:border-emerald-800 dark:bg-gray-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center dark:text-white">
                <Shield className="mr-2 h-5 w-5 text-emerald-600" />
                Privacy & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Camera className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="font-medium dark:text-white">Camera Access</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">For bite photo analysis</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="font-medium dark:text-white">Location Access</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Find nearby health centers</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium dark:text-white">Data Sharing</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Anonymous data for public health</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Language & Region */}
          <Card className="border-emerald-200 dark:border-emerald-800 dark:bg-gray-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center dark:text-white">
                <Globe className="mr-2 h-5 w-5 text-emerald-600" />
                Language & Region
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent dark:text-white dark:border-gray-600"
              >
                Language: English
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent dark:text-white dark:border-gray-600"
              >
                Region: Philippines
              </Button>
            </CardContent>
          </Card>

          {/* About */}
          <Card className="border-emerald-200 dark:border-emerald-800 dark:bg-gray-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center dark:text-white">
                <Settings className="mr-2 h-5 w-5 text-emerald-600" />
                About
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent dark:text-white dark:border-gray-600"
              >
                Privacy Policy
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent dark:text-white dark:border-gray-600"
              >
                Terms of Service
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent dark:text-white dark:border-gray-600"
              >
                App Version: 1.0.0
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
