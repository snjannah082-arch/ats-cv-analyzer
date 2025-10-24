"use client"

import { Button } from "@/components/ui/button"
import { Logo } from "@/components/Logo"
import { useTheme } from "next-themes"
import { Moon, Sun, Upload, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navigation() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 md:gap-3">
          <Logo className="w-8 h-8 md:w-10 md:h-10 text-primary" />
          <span className="text-lg md:text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            ATS CV
          </span>
        </Link>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          <Link href="/upload">
            <Button variant="outline" size="sm" className="hidden md:flex">
              <Upload className="h-4 w-4 mr-2" />
              Upload Resume
            </Button>
          </Link>
          
          <Link href="/candidates">
            <Button size="sm" className="hidden md:flex">
              <Users className="h-4 w-4 mr-2" />
              View Candidates
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
