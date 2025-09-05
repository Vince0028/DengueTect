"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, Phone, MapPin } from "lucide-react"
import Link from "next/link"

export default function RiskAssessmentPage() {
  // Mock risk calculation - in real app this would be based on symptoms and AI analysis
  const riskLevels = {
    low: 10,
    moderate: 50,
    high: 85,
  }

  const currentRisk = "moderate" // This would be calculated based on symptoms
  const riskPercentage = riskLevels[currentRisk]

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-600"
      case "moderate":
        return "text-yellow-600"
      case "high":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "low":
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case "moderate":
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />
      case "high":
        return <XCircle className="h-6 w-6 text-red-600" />
      default:
        return null
    }
  }

  const getRiskMessage = (risk: string) => {
    switch (risk) {
      case "low":
        return "The bite and symptoms show minimal signs of dengue infection. Continue monitoring your condition and practice standard mosquito prevention."
      case "moderate":
        return "Some signs suggest the possibility of dengue infection. Monitor your symptoms closely over the next 24-48 hours. If new symptoms appear or worsen, consult seeking medical advice."
      case "high":
        return "There is a strong indication of potential dengue infection. You are advised to seek medical attention, especially if you experience fever, severe headache, or body pain."
      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4">
        <div className="container mx-auto max-w-md flex items-center space-x-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Risk Assessment</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-md space-y-6">
        {/* Risk Level Display */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              {getRiskIcon(currentRisk)}
              <span className={getRiskColor(currentRisk)}>
                {currentRisk.charAt(0).toUpperCase() + currentRisk.slice(1)} Risk
              </span>
            </CardTitle>
            <CardDescription>Based on your symptoms and bite analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Risk Percentage Circle */}
            <div className="flex justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={getRiskColor(currentRisk)}
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${riskPercentage}, 100`}
                    strokeLinecap="round"
                    fill="transparent"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-2xl font-bold ${getRiskColor(currentRisk)}`}>{riskPercentage}%</span>
                </div>
              </div>
            </div>

            <p className="text-center text-muted-foreground">{getRiskMessage(currentRisk)}</p>
          </CardContent>
        </Card>

        {/* Risk Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Risk Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Low Risk</span>
              <div className="flex items-center space-x-2">
                <Progress value={riskLevels.low} className="w-20 h-2" />
                <span className="text-sm text-green-600">{riskLevels.low}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Moderate Risk</span>
              <div className="flex items-center space-x-2">
                <Progress value={riskLevels.moderate} className="w-20 h-2" />
                <span className="text-sm text-yellow-600">{riskLevels.moderate}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">High Risk</span>
              <div className="flex items-center space-x-2">
                <Progress value={riskLevels.high} className="w-20 h-2" />
                <span className="text-sm text-red-600">{riskLevels.high}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        {currentRisk !== "low" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recommended Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Phone className="h-4 w-4 mr-2" />
                Call Emergency Hotline: 911
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <MapPin className="h-4 w-4 mr-2" />
                Find Nearest Hospital
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/symptom-checker">Retake Assessment</Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/education/dengue-info">Learn More About Dengue</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
