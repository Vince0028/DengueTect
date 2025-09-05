"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Upload, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ReportBitePage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const router = useRouter()

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyze = () => {
    setIsAnalyzing(true)
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false)
      router.push("/bite-analysis-result")
    }, 3000)
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
          <h1 className="text-lg font-semibold">Report a Bite</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Upload Bite Photo</CardTitle>
            <CardDescription>
              Take or upload a clear photo of the suspected mosquito bite for AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedImage ? (
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No image selected</p>
                <div className="space-y-2">
                  <label htmlFor="camera-input">
                    <Button className="w-full" asChild>
                      <span>
                        <Camera className="h-4 w-4 mr-2" />
                        Take Photo
                      </span>
                    </Button>
                  </label>
                  <input
                    id="camera-input"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  <label htmlFor="upload-input">
                    <Button variant="outline" className="w-full bg-transparent" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload from Gallery
                      </span>
                    </Button>
                  </label>
                  <input
                    id="upload-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={selectedImage || "/placeholder.svg"}
                    alt="Uploaded bite"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setSelectedImage(null)} className="flex-1">
                    Retake
                  </Button>
                  <Button onClick={handleAnalyze} disabled={isAnalyzing} className="flex-1">
                    {isAnalyzing ? "Analyzing..." : "Analyze Bite"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-2">Tips for Best Results:</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Ensure good lighting</li>
              <li>• Keep the bite in focus</li>
              <li>• Include surrounding skin for context</li>
              <li>• Avoid blurry or dark images</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
