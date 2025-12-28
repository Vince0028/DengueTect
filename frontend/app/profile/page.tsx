"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, User, LogOut, Edit, Lock, Mail, Phone, MapPin, Calendar, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"

export default function ProfilePage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "JUAN DELA CRUZ",
    email: "juan.delacruz@email.com",
    phone: "+63 912 345 6789",
    location: "Barangay 183 Villamor, Pasay City",
    birthdate: "1990-01-15",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleLogout = () => {
    router.push("/")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = () => {
    console.log("Saving profile:", formData)
    setIsEditing(false)
  }

  const handleChangePassword = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      alert("New passwords don't match!")
      return
    }
    console.log("Changing password")
    setFormData((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
      <DashboardHeader />

      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-3">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Profile / User Settings</h1>
        </div>

        <div className="space-y-4">
          {}
          <Card className="border-emerald-200 dark:border-gray-700 dark:bg-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between dark:text-white">
                <div className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-emerald-600" />
                  Personal Information
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-emerald-600 hover:text-emerald-700"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder-user.png" alt="Juan Dela Cruz" />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg">JD</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={formData.username}
                        onChange={(e) => handleInputChange("username", e.target.value)}
                        className="font-semibold dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                        Dengue Slayer
                      </Badge>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-semibold text-lg dark:text-white">{formData.username}</h3>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                        Dengue Slayer
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  {isEditing ? (
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Email address"
                      className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  ) : (
                    <span className="text-sm text-gray-700 dark:text-gray-300">{formData.email}</span>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  {isEditing ? (
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Phone number"
                      className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  ) : (
                    <span className="text-sm text-gray-700 dark:text-gray-300">{formData.phone}</span>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  {isEditing ? (
                    <Input
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      placeholder="Location"
                      className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  ) : (
                    <span className="text-sm text-gray-700 dark:text-gray-300">{formData.location}</span>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  {isEditing ? (
                    <Input
                      type="date"
                      value={formData.birthdate}
                      onChange={(e) => handleInputChange("birthdate", e.target.value)}
                      className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  ) : (
                    <span className="text-sm text-gray-700 dark:text-gray-300">{formData.birthdate}</span>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex space-x-2 pt-2">
                  <Button onClick={handleSaveProfile} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {}
          <Card className="border-emerald-200 dark:border-gray-700 dark:bg-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center dark:text-white">
                <Lock className="mr-2 h-5 w-5 text-emerald-600" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="currentPassword" className="text-sm font-medium dark:text-white">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                      placeholder="Enter current password"
                      className="pr-10 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="newPassword" className="text-sm font-medium dark:text-white">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange("newPassword", e.target.value)}
                      placeholder="Enter new password"
                      className="pr-10 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium dark:text-white">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      placeholder="Confirm new password"
                      className="pr-10 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleChangePassword}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={!formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                >
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {}
          <Button
            variant="outline"
            className="w-full justify-start bg-transparent dark:text-white dark:border-gray-600"
          >
            PERMISSIONS CONTROL
          </Button>

          {}
          <Button
            variant="outline"
            className="w-full justify-start bg-transparent dark:text-white dark:border-gray-600"
          >
            PRIVACY & TERMS
          </Button>

          {}
          <Button onClick={handleLogout} className="w-full bg-red-500 hover:bg-red-600 text-white">
            <LogOut className="mr-2 h-4 w-4" />
            LOG OUT
          </Button>
        </div>
      </div>
    </div>
  )
}
