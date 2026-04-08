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
        'group relative gap-0 overflow-hidden border-border/70 bg-card/90 py-0 shadow-md shadow-black/[0.04] backdrop-blur-sm transition-all duration-300',
        'hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/[0.08]',
        'dark:border-border/80 dark:bg-card/70 dark:shadow-black/30 dark:hover:shadow-primary/10',
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-0.5 opacity-95"
        style={{ background: 'var(--gradient-primary)' }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-primary/[0.07] blur-3xl transition-[opacity,transform] duration-500 group-hover:scale-110 group-hover:opacity-100 dark:bg-primary/[0.12]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-full bg-chart-1/[0.06] blur-2xl dark:bg-chart-1/[0.1]"
        aria-hidden
      />

      <CardContent className="relative p-5 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="h-1 w-1 shrink-0 rounded-full bg-primary/70" aria-hidden />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {title}
              </p>
            </div>

            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground">
                {displayValue}
              </p>
              {trend && (
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
                    trendPositive === true &&
                      'bg-emerald-500/12 text-emerald-700 ring-1 ring-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-500/25',
                    trendPositive === false &&
                      'bg-red-500/12 text-red-700 ring-1 ring-red-500/20 dark:bg-red-500/15 dark:text-red-400 dark:ring-red-500/25',
                    trendPositive == null &&
                      'bg-muted/80 text-muted-foreground ring-1 ring-border/60'
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
              <p className="max-w-[20rem] text-xs leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
          </div>

          <div
            className={cn(
              'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
              'border border-border/60 bg-gradient-to-br from-background/90 to-muted/40',
              'shadow-sm ring-1 ring-black/[0.03] transition-all duration-300',
              'group-hover:scale-[1.06] group-hover:shadow-md group-hover:ring-primary/15',
              'dark:from-background/40 dark:to-muted/25 dark:ring-white/[0.06]',
              iconClassName
            )}
          >
            <Icon className="relative z-[1] h-5 w-5" strokeWidth={2} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
