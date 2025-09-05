import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  variant?: "default" | "primary"
  size?: "default" | "sm"
}

export function FeatureCard({
  icon,
  title,
  description,
  href,
  variant = "default",
  size = "default",
}: FeatureCardProps) {
  return (
    <Link href={href}>
      <Card
        className={cn(
          "transition-all duration-200 hover:shadow-md cursor-pointer",
          variant === "primary" && "border-primary bg-primary/5",
        )}
      >
        <CardContent className={cn("flex items-center space-x-4", size === "sm" ? "p-4" : "p-6")}>
          <div
            className={cn(
              "flex-shrink-0 rounded-lg flex items-center justify-center",
              size === "sm" ? "w-10 h-10" : "w-12 h-12",
              variant === "primary" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground",
            )}
          >
            {icon}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={cn("font-semibold text-foreground", size === "sm" ? "text-sm" : "text-base")}>{title}</h3>
            <p className={cn("text-muted-foreground", size === "sm" ? "text-xs" : "text-sm")}>{description}</p>
          </div>

          <ChevronRight className={cn("text-muted-foreground flex-shrink-0", size === "sm" ? "h-4 w-4" : "h-5 w-5")} />
        </CardContent>
      </Card>
    </Link>
  )
}
