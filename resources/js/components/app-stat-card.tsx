import { Card, CardContent } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'
import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AppStatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  iconClassName?: string
  className?: string
  trend?: string
  trendPositive?: boolean
}

export function AppStatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
  className,
  trend,
  trendPositive,
}: AppStatCardProps) {
  const displayValue =
    typeof value === 'number' ? value.toLocaleString() : value

  return (
    <Card
      className={cn(
        'group relative gap-0 overflow-hidden py-0',
        className
      )}
    >
      <CardContent className="relative p-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-[11px] font-medium text-muted-foreground">
              {title}
            </p>

            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <p className="text-xl font-semibold tabular-nums tracking-tight text-foreground">
                {displayValue}
              </p>
              {trend && (
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium tabular-nums',
                    trendPositive === true &&
                      'bg-muted text-foreground',
                    trendPositive === false &&
                      'bg-destructive/10 text-destructive',
                    trendPositive == null &&
                      'bg-muted/80 text-muted-foreground'
                  )}
                >
                  {trendPositive === true && (
                    <TrendingUp className="h-3 w-3 shrink-0" strokeWidth={2.5} />
                  )}
                  {trendPositive === false && (
                    <TrendingDown className="h-3 w-3 shrink-0" strokeWidth={2.5} />
                  )}
                  {trendPositive == null && (
                    <Minus className="h-3 w-3 shrink-0" strokeWidth={2.5} />
                  )}
                  {trend}
                </span>
              )}
            </div>

            {description && (
              <p className="text-[11px] leading-snug text-muted-foreground">
                {description}
              </p>
            )}
          </div>

          <div
            className={cn(
              'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
              'border border-border/60 bg-muted/40',
              iconClassName
            )}
          >
            <Icon className="relative z-[1] h-3.5 w-3.5" strokeWidth={2} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
