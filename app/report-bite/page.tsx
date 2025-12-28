"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Upload, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ReportBitePage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [indicator, setIndicator] = useState<{ text: string; cls: "red" | "yellow" | "muted" } | null>(null)
  const [debugStats, setDebugStats] = useState<{ rFrac: number; yFrac: number; rFracC: number; yFracC: number } | null>(null)
  
  const [roi, setRoi] = useState<{ cx: number; cy: number; r: number } | null>(null)

  const imgRef = useRef<HTMLImageElement | null>(null)
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null)
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
    
    setTimeout(() => {
      setIsAnalyzing(false)
      router.push("/bite-analysis-result")
    }, 3000)
  }

  
  function rgbToHsv(r: number, g: number, b: number) {
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    const d = max - min
    let h = 0
    const s = max === 0 ? 0 : d / max
    const v = max
    if (d !== 0) {
      switch (max) {
        case r: h = ((g - b) / (d || 1)) % 6; break
        case g: h = (b - r) / (d || 1) + 2; break
        case b: h = (r - g) / (d || 1) + 4; break
      }
      h *= 60; if (h < 0) h += 360
    }
    return { h, s, v }
  }

  type Stats = { red: number; yellow: number; total: number; redC: number; yellowC: number; centerTotal: number }

  function analyzeImageData(img: ImageData, roiBox?: { cx: number; cy: number; r: number }): Stats {
    let red = 0, yellow = 0, total = 0
    let redC = 0, yellowC = 0, centerTotal = 0
    const arr = img.data
    const w = img.width || 0, h = img.height || 0

    
    const defaultCx0 = Math.floor(w * 0.20), defaultCx1 = Math.ceil(w * 0.80)
    const defaultCy0 = Math.floor(h * 0.20), defaultCy1 = Math.ceil(h * 0.80)

    
    let rx0 = defaultCx0, rx1 = defaultCx1, ry0 = defaultCy0, ry1 = defaultCy1
    if (roiBox) {
      const rc = Math.max(8, Math.floor(Math.min(w, h) * (roiBox.r || 0.25)))
      const cx = Math.floor((roiBox.cx || 0.5) * w)
      const cy = Math.floor((roiBox.cy || 0.5) * h)
      rx0 = Math.max(0, cx - rc); rx1 = Math.min(w - 1, cx + rc)
      ry0 = Math.max(0, cy - rc); ry1 = Math.min(h - 1, cy + rc)
    }

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4
        const r = arr[idx] / 255, g = arr[idx + 1] / 255, b = arr[idx + 2] / 255

        const { h: hue, s, v } = rgbToHsv(r, g, b)
        
        const isRedHSV = (s >= 0.22 && v >= 0.18) && (hue <= 15 || hue >= 345)
        const isYellowHSV = (s >= 0.20 && v >= 0.25) && (hue >= 25 && hue <= 75)
        
        const isRedRGB = (r >= 0.35) && (r - Math.max(g, b) >= 0.10) && (r / (g + 1e-6) >= 1.30) && (r / (b + 1e-6) >= 1.30)
        const isYellowRGB = (r >= 0.30 && g >= 0.30 && b <= 0.45) && (Math.min(r, g) / Math.max(r, g) >= 0.75) && ((r - b) >= 0.08) && ((g - b) >= 0.08)
        
        const isPinkish = (v >= 0.6 && s >= 0.10 && s <= 0.40) && (hue <= 20 || hue >= 340) && (r > g && r > b)

        let isRed = isRedHSV || isRedRGB || isPinkish
        let isYellow = !isRed && (isYellowHSV || isYellowRGB)

        if (isRed) red++; else if (isYellow) yellow++
        total++

        const inCenter = (x >= rx0 && x <= rx1 && y >= ry0 && y <= ry1)
        if (inCenter) {
          centerTotal++
          if (isRed) redC++; else if (isYellow) yellowC++
        }
      }
    }
    return { red, yellow, total, redC, yellowC, centerTotal }
  }

  function decideLabel(stats: Stats) {
    const { red, yellow, total, redC, yellowC, centerTotal } = stats
    if (!total) return { text: "No signal", cls: "muted" as const }
    const rFrac = red / total, yFrac = yellow / total
    const rFracC = centerTotal ? (redC / centerTotal) : 0
    const yFracC = centerTotal ? (yellowC / centerTotal) : 0
    const minFrac = 0.005 
    const centerMinFrac = 0.01 
    if ((rFrac >= minFrac && rFrac >= yFrac) || (rFracC >= centerMinFrac)) return { text: "Detected: red/pink area", cls: "red" as const }
    if ((yFrac >= minFrac) || (yFracC >= centerMinFrac)) return { text: "Detected: yellowish area", cls: "yellow" as const }
    return { text: "No clear red/yellow detected", cls: "muted" as const }
  }

  const analyzeNow = useCallback(() => {
    const el = imgRef.current
    if (!el) return
    
    const w = 200
    const ratio = el.naturalWidth / (el.naturalHeight || 1)
    const h = Math.max(1, Math.round(w / (ratio || 1)))
    let cvs = offscreenCanvasRef.current
    if (!cvs) {
      cvs = document.createElement("canvas")
      offscreenCanvasRef.current = cvs
    }
    const ctx = cvs.getContext("2d")
    if (!ctx) return
    cvs.width = w; cvs.height = h
    ctx.drawImage(el, 0, 0, w, h)
    const img = ctx.getImageData(0, 0, w, h)
    const stats = analyzeImageData(img, roi || undefined)
    const res = decideLabel(stats)
    setIndicator(res)
    setDebugStats({
      rFrac: stats.total ? stats.red / stats.total : 0,
      yFrac: stats.total ? stats.yellow / stats.total : 0,
      rFracC: stats.centerTotal ? stats.redC / stats.centerTotal : 0,
      yFracC: stats.centerTotal ? stats.yellowC / stats.centerTotal : 0,
    })
  }, [roi])

  useEffect(() => {
    
    analyzeNow()
  }, [selectedImage, roi, analyzeNow])

  const onImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = (e.clientX - rect.left) / rect.width
    const cy = (e.clientY - rect.top) / rect.height
    
    setRoi({ cx, cy, r: 0.25 })
    
  }

  const resetRoi = () => setRoi(null)

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
                    ref={imgRef}
                    src={selectedImage || "/placeholder.svg"}
                    alt="Uploaded bite"
                    className="w-full h-64 object-cover rounded-lg select-none"
                    onLoad={() => analyzeNow()}
                    onClick={onImageClick}
                  />
                  {}
                  {roi && (
                    <div
                      className="pointer-events-none absolute border-2 border-red-400/80 rounded-full shadow"
                      style={{
                        left: `${Math.max(0, (roi.cx - roi.r) * 100)}%`,
                        top: `${Math.max(0, (roi.cy - roi.r) * 100)}%`,
                        width: `${Math.min(100, roi.r * 2 * 100)}%`,
                        height: `${Math.min(100, roi.r * 2 * 100)}%`,
                      }}
                    />
                  )}
                  {}
                  <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1">
                    {indicator && (
                      <div
                        className={`text-xs px-2 py-1 rounded-md shadow ${
                          indicator.cls === "red" ? "bg-red-600 text-white" : indicator.cls === "yellow" ? "bg-yellow-500 text-black" : "bg-black/60 text-white"
                        }`}
                      >
                        {indicator.text}
                      </div>
                    )}
                    {debugStats && (
                      <div className="text-[10px] leading-tight px-2 py-1 rounded-md bg-black/50 text-white shadow">
                        <div>Global: R {(debugStats.rFrac * 100).toFixed(1)}% | Y {(debugStats.yFrac * 100).toFixed(1)}%</div>
                        <div>ROI: R {(debugStats.rFracC * 100).toFixed(1)}% | Y {(debugStats.yFracC * 100).toFixed(1)}%</div>
                      </div>
                    )}
                  </div>
                  {}
                  <div className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded bg-black/40 text-white">
                    Tap the rash to focus detection
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setSelectedImage(null)} className="flex-1">
                    Retake
                  </Button>
                  <Button variant="secondary" onClick={resetRoi} className="px-3">Reset Focus</Button>
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
              <li>• Tip: tap the rash to focus the detector on that area</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
