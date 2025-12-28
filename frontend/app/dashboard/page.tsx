import { DashboardHeader } from "@/components/dashboard-header"
import { FeatureCard } from "@/components/feature-card"
import { Camera, FileText, Activity, BookOpen, MapPin } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6 max-w-md">
        <div className="space-y-6">
          {}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to DengueTect</h1>
            <p className="text-muted-foreground">Your AI-powered dengue pre-screening companion</p>
          </div>

          {}
          <div className="grid gap-4">
            <FeatureCard
              icon={<Camera className="h-6 w-6" />}
              title="Report a Bite"
              description="Take and upload a photo of a suspected mosquito bite for AI analysis"
              href="/report-bite"
              variant="primary"
            />

            <FeatureCard
              icon={<FileText className="h-6 w-6" />}
              title="Symptom Checker"
              description="Complete our comprehensive symptom assessment"
              href="/symptom-checker"
            />

            <FeatureCard
              icon={<Activity className="h-6 w-6" />}
              title="Risk Assessment"
              description="View your current dengue risk level and recommendations"
              href="/risk-assessment"
            />
          </div>

          {}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Educational Hub</h2>

            <div className="grid gap-3">
              <FeatureCard
                icon={<BookOpen className="h-5 w-5" />}
                title="What is Dengue?"
                description="Learn about dengue fever, symptoms, and prevention"
                href="/education#dengue"
                size="sm"
              />

              <FeatureCard
                icon={<MapPin className="h-5 w-5" />}
                title="Local Health Services"
                description="Find nearby healthcare facilities and emergency contacts"
                href="/education#services"
                size="sm"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
