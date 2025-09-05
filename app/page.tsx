import { LoginForm } from "@/components/login-form"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center">
              <img
                src="/images/dengue-logo.png"
                alt="DengueTect Logo"
                className="w-12 h-12 filter brightness-0 invert"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">DengueTect</h1>
          <p className="text-muted-foreground">AI-Powered Dengue Pre-Screening</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
