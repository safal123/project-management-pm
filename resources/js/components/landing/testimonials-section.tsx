import { Button } from '@/components/ui/button'
import { Link } from '@inertiajs/react'

const testimonials = [
  {
    quote: 'We cut delivery time and finally have one place for boards, due dates, and updates.',
    author: 'Sarah Johnson',
    role: 'Product Manager, TechCorp',
    avatar: 'SJ',
  },
  {
    quote: 'The dashboard is quiet and useful. We spot bottlenecks before they become slips.',
    author: 'Michael Chen',
    role: 'CTO, InnovateLabs',
    avatar: 'MC',
  },
  {
    quote: 'Powerful enough for our agency workflow without feeling heavy or noisy.',
    author: 'Emily Rodriguez',
    role: 'Team Lead, DesignStudio',
    avatar: 'ER',
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6 lg:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            Testimonials
          </p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight md:text-2xl">
            What teams say
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            Built for the same density and clarity you get inside the product.
          </p>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="flex flex-col justify-between rounded-md border border-border bg-card p-4 shadow-sm"
            >
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                “{testimonial.quote}”
              </p>
              <div className="mt-4 flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[11px] font-medium">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-[13px] font-medium">{testimonial.author}</p>
                  <p className="text-[11px] text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link href="/register">
            <Button size="sm" className="h-8 px-3 text-[13px]">
              Join the workspace
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
