import React, { useId, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import AppTooltip from "@/components/app-tooltip";

type CircularProgressChipProps = {
  percent: number;
  size?: number;
};

export function CircularProgressChip({
  percent,
  size = 25,
}: CircularProgressChipProps) {
  const progress = useMemo(
    () => Math.max(0, Math.min(100, Math.round(percent))),
    [percent]
  );

  const radius = 16;
  const strokeWidth = 3;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const strokeDashoffset =
    circumference - (progress / 100) * circumference;

  const gradientId = useId();

  const gradientColors = useMemo(() => {
    if (progress === 100)
      return { start: "#4ade80", end: "#059669" }; // success
    if (progress >= 75)
      return { start: "#60a5fa", end: "#0891b2" }; // strong progress
    if (progress >= 50)
      return { start: "#818cf8", end: "#2563eb" }; // medium
    if (progress >= 25)
      return { start: "#facc15", end: "#f97316" }; // low
    if (progress > 0)
      return { start: "#fb923c", end: "#ea580c" }; // started (more visible)
    return { start: "#d1d5db", end: "#9ca3af" }; // idle
  }, [progress]);

  return (
    <AppTooltip
      content={`Project progress: ${progress}%`}
      side="top"
    >
      <Badge
        variant="outline"
        className="flex items-center gap-1.5 bg-card px-1.5"
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 36 36"
          className="-rotate-90"
          role="img"
          aria-label={`Progress ${progress}%`}
        >
          <defs>
            <linearGradient
              id={gradientId}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={gradientColors.start} />
              <stop offset="100%" stopColor={gradientColors.end} />
            </linearGradient>
          </defs>

          {/* Background track */}
          <circle
            cx="18"
            cy="18"
            r={normalizedRadius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted-foreground/40"
          />

          {/* Progress indicator */}
          <circle
            cx="18"
            cy="18"
            r={normalizedRadius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />
        </svg>

        <span className="text-xs font-medium tabular-nums text-muted-foreground">
          {progress}%
        </span>
      </Badge>
    </AppTooltip>
  );
}
