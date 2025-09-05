"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, LogOut, User } from "lucide-react"
import { useRouter } from "next/navigation"

export function DashboardHeader() {
  const router = useRouter()

  const handleLogout = () => {
    router.push("/")
  }

  return (
    <header className="bg-primary text-primary-foreground dark:bg-gray-800 dark:text-white">
      <div className="container mx-auto px-4 py-4 max-w-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-foreground/20 dark:bg-white/20 rounded-lg flex items-center justify-center">
              <img
                src="/images/dengue-logo.png"
                alt="DengueTect"
                className="w-6 h-6 filter brightness-0 invert dark:invert-0 dark:brightness-100"
              />
            </div>
            <div>
              <h1 className="font-bold text-lg">DengueTect</h1>
              <p className="text-xs opacity-90">Health Monitoring</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full hover:bg-primary-foreground/10 dark:hover:bg-white/10"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
                  <AvatarFallback className="bg-primary-foreground text-primary dark:bg-white dark:text-gray-800">
                    JD
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 dark:bg-gray-800 dark:border-gray-700" align="end" forceMount>
              <DropdownMenuItem
                onClick={() => router.push("/profile")}
                className="dark:hover:bg-gray-700 dark:text-white"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/settings")}
                className="dark:hover:bg-gray-700 dark:text-white"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="dark:bg-gray-700" />
              <DropdownMenuItem onClick={handleLogout} className="dark:hover:bg-gray-700 dark:text-white">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
