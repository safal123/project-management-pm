import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GradientBackground } from '@/components/ui/gradient-background';

export function PricingSection() {
  const plans = [
    {
      name: "Free",
      description: "For individuals and small teams getting started.",
      price: "$0",
      period: "forever",
      features: [
        "Up to 5 team members",
        "Up to 3 projects",
        "Basic task management",
        "File sharing up to 5GB",
        "Email support",
      ],
      popular: false,
      buttonText: "Get Started",
      buttonVariant: "outline" as const,
    },
    {
      name: "Pro",
      description: "For growing teams with more advanced needs.",
      price: "$12",
      period: "per user/month",
      features: [
        "Unlimited team members",
        "Unlimited projects",
        "Advanced task management",
        "File sharing up to 50GB",
        "Priority email support",
        "Custom workflows",
        "Advanced analytics",
        "API access",
      ],
      popular: true,
      buttonText: "Start Free Trial",
      buttonVariant: "gradient-green" as const,
    },
    {
      name: "Enterprise",
      description: "For organizations with complex requirements.",
      price: "Custom",
      period: "contact for pricing",
      features: [
        "Everything in Pro",
        "Unlimited storage",
        "24/7 phone support",
        "Dedicated account manager",
        "Custom integrations",
        "Advanced security",
        "User provisioning (SCIM)",
        "SAML SSO",
      ],
      popular: false,
      buttonText: "Contact Sales",
      buttonVariant: "gradient-ocean" as const,
    },
  ];

  return (
    <section id="pricing" className="relative w-full py-12 md:py-24 lg:py-32">
      <GradientBackground variant="green" intensity="light" />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-green-500/10 px-3 py-1 text-sm dark:bg-green-500/20">
              <span className="bg-gradient-to-r from-green-500 to-green-700 bg-clip-text font-semibold text-transparent">
                Pricing
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Simple, transparent pricing
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl">
              Choose the plan that's right for your team. All plans include a 14-day free trial.
            </p>
          </div>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={cn(
                "flex flex-col backdrop-blur-sm bg-background/80",
                plan.popular ? "border-primary shadow-md" : "border-border"
              )}
            >
              {plan.popular && (
                <div className="absolute right-0 top-0 rounded-bl-lg rounded-tr-lg bg-green-600 px-3 py-1 text-xs font-medium text-white">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4 flex items-baseline text-gray-900 dark:text-gray-50">
                  <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
                  {plan.period && (
                    <span className="ml-1 text-sm text-muted-foreground">/{plan.period}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="mr-2 h-5 w-5 shrink-0 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href={plan.name === "Enterprise" ? "/contact" : "/register"} className="w-full">
                  <Button variant={plan.buttonVariant} className="w-full">
                    {plan.buttonText}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
