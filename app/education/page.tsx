"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  BookOpen,
  MapPin,
  Phone,
  Clock,
  AlertTriangle,
  Shield,
  Droplets,
  Thermometer,
  Users,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"

export default function EducationPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
      <DashboardHeader />

      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-3">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Educational Hub</h1>
        </div>

        <div className="space-y-6">
          {/* What is Dengue Section */}
          <Card className="border-emerald-200 dark:border-gray-700 dark:bg-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center dark:text-white">
                <BookOpen className="mr-2 h-5 w-5 text-emerald-600" />
                What is Dengue?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-emerald-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Dengue is a mosquito-borne viral infection that causes flu-like illness and can develop into severe
                  complications.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="h-4 w-4 text-red-500" />
                    <span className="text-xs dark:text-gray-300">High Fever</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="text-xs dark:text-gray-300">Severe Headache</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span className="text-xs dark:text-gray-300">Muscle Pain</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-xs dark:text-gray-300">Skin Rash</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Dengue Prevention Guide
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Warning Signs & Symptoms
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Community Prevention Tips
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Prevention Tips */}
          <Card className="border-emerald-200 dark:border-gray-700 dark:bg-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center dark:text-white">
                <Shield className="mr-2 h-5 w-5 text-emerald-600" />
                Prevention Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-gray-700 rounded-lg">
                  <Droplets className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm dark:text-white">Remove Standing Water</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Empty containers, flower pots, and gutters regularly
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-gray-700 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm dark:text-white">Use Protection</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Wear long sleeves and use mosquito repellent
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-gray-700 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm dark:text-white">Peak Hours</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Avoid outdoor activities during dawn and dusk
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Local Health Services */}
          <Card className="border-emerald-200 dark:border-gray-700 dark:bg-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center dark:text-white">
                <MapPin className="mr-2 h-5 w-5 text-emerald-600" />
                Local Health Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Find nearby healthcare facilities and emergency contacts in your area.
              </p>

              {/* Emergency Contacts */}
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-medium text-red-800 dark:text-red-300 mb-2 flex items-center">
                  <Phone className="mr-2 h-4 w-4" />
                  Emergency Hotlines
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">DOH Hotline:</span>
                    <span className="font-mono text-red-700 dark:text-red-300">1555</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Emergency:</span>
                    <span className="font-mono text-red-700 dark:text-red-300">911</span>
                  </div>
                </div>
              </div>

              {/* Nearby Facilities */}
              <div className="space-y-3">
                <h4 className="font-medium dark:text-white">Nearby Health Centers</h4>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-between bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 h-auto p-3"
                  >
                    <div className="text-left">
                      <div className="font-medium text-sm">Pasay City General Hospital</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">0.8 km away • Open 24/7</div>
                    </div>
                    <MapPin className="h-4 w-4 text-emerald-600" />
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-between bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 h-auto p-3"
                  >
                    <div className="text-left">
                      <div className="font-medium text-sm">Barangay 183 Health Center</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">0.3 km away • 8AM - 5PM</div>
                    </div>
                    <MapPin className="h-4 w-4 text-emerald-600" />
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-between bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 h-auto p-3"
                  >
                    <div className="text-left">
                      <div className="font-medium text-sm">Manila Doctors Hospital</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">2.1 km away • Open 24/7</div>
                    </div>
                    <MapPin className="h-4 w-4 text-emerald-600" />
                  </Button>
                </div>
              </div>

              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                <MapPin className="mr-2 h-4 w-4" />
                Find More Nearby Facilities
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
