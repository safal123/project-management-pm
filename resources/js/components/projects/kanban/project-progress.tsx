import React from "react"
import { Badge } from "@/components/ui/badge"
import AppTooltip from "@/components/app-tooltip"

type CircularProgressChipProps = {
  percent: number
  size?: number
}

export function CircularProgressChip({
  percent,
  size = 25,
}: CircularProgressChipProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)))
  const radius = 16
  const stroke = 3
  const normalizedRadius = radius - stroke / 2
  const circumference = 2 * Math.PI * normalizedRadius
  const strokeDashoffset = circumference - (clamped / 100) * circumference

  // Gradient colors based on percentage
  const getGradientColors = () => {
    if (clamped === 100) return { start: "#4ade80", end: "#059669" } // green-400 to emerald-600
    if (clamped >= 75) return { start: "#60a5fa", end: "#0891b2" } // blue-400 to cyan-600
    if (clamped >= 50) return { start: "#818cf8", end: "#2563eb" } // indigo-400 to blue-600
    if (clamped >= 25) return { start: "#facc15", end: "#f97316" } // yellow-400 to orange-500
    return { start: "#d1d5db", end: "#9ca3af" } // gray-300 to gray-400
  }

  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`
  const colors = getGradientColors()

  return (
    <AppTooltip content={`Project progress: ${clamped}%`} side="top">
      <Badge className="bg-card border-border">
        {/* Circular Progress SVG */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 36 36"
          className="-rotate-90"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.start} />
              <stop offset="100%" stopColor={colors.end} />
            </linearGradient>
          </defs>
          {/* Background circle */}
          <circle
            cx="18"
            cy="18"
            r={normalizedRadius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="bg-primary/20"
          />
          {/* Progress circle with gradient */}
          <circle
            cx="18"
            cy="18"
            r={normalizedRadius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>

        {/* Percentage */}
        <span className="text-xs font-medium tabular-nums text-muted-foreground">{clamped}%</span>
      </Badge>
    </AppTooltip>
  )
}
