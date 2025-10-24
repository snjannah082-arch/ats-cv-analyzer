import { FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <FileText className="h-8 w-8 text-primary" />
    </div>
  )
}
