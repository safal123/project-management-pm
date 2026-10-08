import { Button } from '@/components/ui/button'
import { Link } from '@inertiajs/react'
import { BarChart3, CheckSquare, Clock, PackagePlus, Users, Workflow } from 'lucide-react'

const features = [
  {
    title: 'Task management',
    description: 'Create, assign, and track work with priorities, due dates, and dependencies.',
    icon: CheckSquare,
  },
  {
    title: 'Collaboration',
    description: 'Comment, share files, and keep everyone on the same card without extra tools.',
    icon: Users,
  },
  {
    title: 'Analytics',
    description: 'See progress, bottlenecks, and workload across projects in a compact dashboard.',
    icon: BarChart3,
  },
  {
    title: 'Scheduling',
    description: 'Month, week, and agenda views for events and due dates in one calendar.',
    icon: Clock,
  },
  {
    title: 'Custom workflows',
    description: 'Shape boards and statuses around how your team already works.',
    icon: Workflow,
  },
  {
    title: 'Integrations',
    description: 'Connect GitHub and keep branches linked to the tasks they belong to.',
    icon: PackagePlus,
  },
]

export function FeatureSection() {
  return (
    <section id="features" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6 lg:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            Features
          </p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight md:text-2xl">
            Everything you need to run a project
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            Boards, tables, calendars, and workspace tools with the same dense, professional UI.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-md border border-border bg-card p-4 shadow-sm"
            >
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted/40">
                <feature.icon className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-[13px] font-medium">{feature.title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link href="/register">
            <Button size="sm" className="h-8 px-3 text-[13px]">
              Explore the product
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
