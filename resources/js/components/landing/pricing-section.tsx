import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { Check } from 'lucide-react';

const plans = [
    {
        name: 'Free',
        description: 'For individuals and small teams getting started.',
        price: '$0',
        period: 'forever',
        features: ['Up to 5 team members', 'Up to 3 projects', 'Basic task management', 'File sharing up to 5GB', 'Email support'],
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
];

export function PricingSection() {
    return (
        <section id="pricing">
            <div className="landing-container landing-section">
                <div className="mx-auto max-w-2xl text-center">
                    <p className="landing-eyebrow">Pricing</p>
                    <h2 className="landing-heading">Simple, transparent pricing</h2>
                    <p className="landing-description">
                        Start free. Upgrade when the team outgrows the basics. Every paid plan includes a 14-day trial.
                    </p>
                </div>

                <div className="mt-9 grid gap-5 md:grid-cols-3">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={cn(
                                'bg-card relative flex flex-col rounded-lg border p-6',
                                plan.popular ? 'border-primary ring-primary ring-1' : 'border-border',
                            )}
                        >
                            {plan.popular && (
                                <span className="bg-primary text-primary-foreground absolute top-5 right-5 rounded-full px-3 py-1 text-xs font-semibold">
                                    Popular
                                </span>
                            )}
                            <h3 className="text-lg font-semibold">{plan.name}</h3>
                            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{plan.description}</p>
                            <div className="mt-7 flex flex-wrap items-baseline gap-2">
                                <span className="text-3xl font-semibold tracking-tight">{plan.price}</span>
                                <span className="text-muted-foreground text-xs">/ {plan.period}</span>
                            </div>
                            <ul className="border-border mt-7 flex-1 space-y-3 border-t pt-6">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-sm leading-relaxed">
                                        <Check className="text-primary mt-0.5 size-4 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button asChild variant={plan.popular ? 'default' : 'outline'} size="sm" className="landing-button mt-8 w-full">
                                <Link href="/register">{plan.buttonText}</Link>
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
