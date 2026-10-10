import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ArrowRight, Check } from 'lucide-react';

export function HeroSection() {
    return (
        <section className="landing-hero border-border border-b">
            <div className="landing-container py-12 sm:pt-16 sm:pb-16">
                <div className="mx-auto max-w-2xl text-center">
                    <p className="landing-eyebrow text-muted-foreground">Project management, simplified</p>
                    <h1 className="mx-auto mt-5 max-w-lg text-[clamp(2rem,3.5vw,2.75rem)] leading-[1.15] font-semibold tracking-[-0.04em] text-balance">
                        Good work starts with a clear plan.
                    </h1>
                    <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-[15px] leading-7">
                        Keep projects organized, give every task an owner, and stay on top of what’s next. One shared workspace for your team’s
                        everyday work.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <Button asChild className="landing-button">
                            <Link href="/register">
                                Get started <ArrowRight />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="landing-button">
                            <a href="#features">Explore features</a>
                        </Button>
                    </div>
                    <p className="text-muted-foreground mt-4 flex items-center justify-center gap-2 text-xs">
                        <Check className="size-3.5" /> Tasks, conversations, and deadlines in one place.
                    </p>
                </div>
                <figure className="border-border bg-card mt-10 overflow-hidden rounded-lg border p-1 sm:mt-12 sm:p-2">
                    <img
                        src="/images/dashboard-banner.png"
                        alt="ProjectFlow desktop dashboard showing project totals, task activity, task status, and recent updates."
                        width={3456}
                        height={1920}
                        fetchPriority="high"
                        className="block h-auto w-full rounded-sm dark:hidden"
                    />
                    <img
                        src="/images/dashboard-banner-dark.png"
                        alt="ProjectFlow desktop dashboard showing project totals, task activity, task status, and recent updates in dark mode."
                        width={3446}
                        height={1896}
                        fetchPriority="high"
                        className="hidden h-auto w-full rounded-sm dark:block"
                    />
                </figure>
            </div>
        </section>
    );
}
