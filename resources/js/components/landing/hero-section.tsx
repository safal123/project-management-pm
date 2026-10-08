import { Link } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:gap-12 lg:px-6 lg:py-16">
        <div className="space-y-4">
          <p className="inline-flex rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            Project management for teams
          </p>
          <h1 className="max-w-xl text-[28px] font-semibold leading-tight tracking-tight md:text-4xl">
            Plan work, ship faster, stay aligned
          </h1>
          <p className="max-w-lg text-[13px] leading-relaxed text-muted-foreground">
            Boards, tables, and calendars in one workspace. Assign owners, track due dates, and keep every project moving without the noise.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Link href="/register">
              <Button size="sm" className="h-8 px-3 text-[13px]">
                Get started
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="sm" className="h-8 px-3 text-[13px]">
                See features
              </Button>
            </a>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/40 p-2 dark:bg-neutral-950/50">
          <div className="overflow-hidden rounded-md border border-border bg-background shadow-sm">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <span className="size-2 rounded-full bg-neutral-300 dark:bg-neutral-600" />
              <span className="size-2 rounded-full bg-neutral-300 dark:bg-neutral-600" />
              <span className="size-2 rounded-full bg-neutral-300 dark:bg-neutral-600" />
              <span className="ml-2 rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                projectflow.app / board
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 bg-muted/50 p-2.5 dark:bg-neutral-950/70">
              <MockColumn
                title="To do"
                count="3"
                cards={[
                  { title: 'Research API', meta: 'Low' },
                  { title: 'Design system', meta: 'High', active: true },
                  { title: 'Setup database', meta: 'Med' },
                ]}
              />
              <MockColumn
                title="In progress"
                count="1"
                cards={[{ title: 'Hero redesign', meta: 'High', progress: true }]}
              />
              <MockColumn
                title="Done"
                count="2"
                cards={[
                  { title: 'Landing page', meta: 'Done', done: true },
                  { title: 'Auth bugfix', meta: 'Done', done: true },
                ]}
              />
            </div>
          </div>
          <div className="mt-2 hidden items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-[12px] text-muted-foreground sm:flex">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Design system moved to In progress
          </div>
        </div>
      </div>
    </section>
  )
}

function MockColumn({
  title,
  count,
  cards,
}: {
  title: string
  count: string
  cards: { title: string; meta: string; active?: boolean; progress?: boolean; done?: boolean }[]
}) {
  return (
    <div className="rounded-md bg-neutral-100 p-1.5 dark:bg-neutral-950/80">
      <div className="mb-1.5 flex items-center justify-between px-1">
        <span className="text-[11px] font-medium text-foreground">{title}</span>
        <span className="text-[11px] text-muted-foreground">{count}</span>
      </div>
      <div className="space-y-1.5">
        {cards.map((card) => (
          <div
            key={card.title}
            className={`rounded-md border bg-white px-2 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-neutral-800 ${
              card.active
                ? 'border-neutral-300 dark:border-white/20'
                : 'border-neutral-200/90 dark:border-white/10'
            } ${card.done ? 'opacity-70' : ''}`}
          >
            <p className="truncate text-[12px] font-medium">{card.title}</p>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">{card.meta}</span>
              {card.progress && <span className="h-1 w-8 rounded-full bg-neutral-300 dark:bg-neutral-600" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
