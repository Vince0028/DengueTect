"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const symptoms = [
  { id: "fever", label: "High fever (above 38°C)", severity: "high" },
  { id: "headache", label: "Severe headache", severity: "medium" },
  { id: "eye-pain", label: "Pain behind the eyes", severity: "medium" },
  { id: "muscle-pain", label: "Muscle pain", severity: "medium" },
  { id: "joint-pain", label: "Joint pain", severity: "medium" },
  { id: "nausea", label: "Nausea or vomiting", severity: "medium" },
  { id: "rash", label: "Skin rash", severity: "high" },
  { id: "fatigue", label: "Extreme tiredness", severity: "low" },
  { id: "loss-appetite", label: "Loss of appetite", severity: "low" },
  { id: "abdominal-pain", label: "Abdominal pain", severity: "medium" },
]

export default function SymptomCheckerPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(1)
  const router = useRouter()

  const totalSteps = 10
  const progress = (currentStep / totalSteps) * 100

  const handleSymptomToggle = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId) ? prev.filter((id) => id !== symptomId) : [...prev, symptomId],
    )
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1)
    } else {
      // Complete assessment
      router.push("/risk-assessment")
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const currentSymptom = symptoms[currentStep - 1]

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4">
        <div className="container mx-auto max-w-md flex items-center space-x-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Symptom Checker</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-md">
        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Current Question */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Are you experiencing this symptom?</CardTitle>
              <CardDescription>
                Select if you are currently experiencing or have experienced this symptom in the past 7 days
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-3 p-4 border rounded-lg">
                <Checkbox
                  id={currentSymptom?.id}
                  checked={selectedSymptoms.includes(currentSymptom?.id || "")}
                  onCheckedChange={() => handleSymptomToggle(currentSymptom?.id || "")}
                />
                <label htmlFor={currentSymptom?.id} className="text-base font-medium cursor-pointer flex-1">
                  {currentSymptom?.label}
                </label>
              </div>

              {/* Navigation */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="flex-1 bg-transparent"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleNext} className="flex-1">
                  {currentStep === totalSteps ? "Complete" : "Next"}
                  {currentStep < totalSteps && <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Selected Symptoms Summary */}
          {selectedSymptoms.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Selected Symptoms ({selectedSymptoms.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedSymptoms.map((symptomId) => {
                    const symptom = symptoms.find((s) => s.id === symptomId)
                    return (
                      <span key={symptomId} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {symptom?.label}
                      </span>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
