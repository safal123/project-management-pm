import { Link } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const plans = [
  {
    name: 'Free',
    description: 'For individuals and small teams getting started.',
    price: '$0',
    period: 'forever',
    features: [
      'Up to 5 team members',
      'Up to 3 projects',
      'Basic task management',
      'File sharing up to 5GB',
      'Email support',
    ],
    popular: false,
    buttonText: 'Get started',
  },
  {
    name: 'Pro',
    description: 'For growing teams with more advanced needs.',
    price: '$12',
    period: 'per user / month',
    features: [
      'Unlimited team members',
      'Unlimited projects',
      'Advanced task management',
      'File sharing up to 50GB',
      'Priority email support',
      'Custom workflows',
      'Advanced analytics',
      'API access',
    ],
    popular: true,
    buttonText: 'Start free trial',
  },
  {
    name: 'Enterprise',
    description: 'For organizations with complex requirements.',
    price: 'Custom',
    period: 'contact for pricing',
    features: [
      'Everything in Pro',
      'Unlimited storage',
      '24/7 phone support',
      'Dedicated account manager',
      'Custom integrations',
      'Advanced security',
      'User provisioning (SCIM)',
      'SAML SSO',
    ],
    popular: false,
    buttonText: 'Contact sales',
  },
]

export function PricingSection() {
  return (
    <section id="pricing">
      <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6 lg:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            Pricing
          </p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight md:text-2xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            Start free. Upgrade when the team outgrows the basics. Every paid plan includes a 14-day trial.
          </p>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative flex flex-col rounded-md border bg-card p-4 shadow-sm',
                plan.popular
                  ? 'border-neutral-400 dark:border-white/30'
                  : 'border-border'
              )}
            >
              {plan.popular && (
                <span className="absolute right-3 top-3 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[11px] font-medium">
                  Popular
                </span>
              )}
              <h3 className="text-[13px] font-medium">{plan.name}</h3>
              <p className="mt-1 text-[13px] text-muted-foreground">{plan.description}</p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-semibold tracking-tight">{plan.price}</span>
                <span className="text-[11px] text-muted-foreground">/ {plan.period}</span>
              </div>
              <ul className="mt-4 flex-1 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-[13px]">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register" className="mt-4 block">
                <Button
                  variant={plan.popular ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 w-full text-[13px]"
                >
                  {plan.buttonText}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
