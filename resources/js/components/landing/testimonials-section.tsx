import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

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
];

export function TestimonialsSection() {
    return (
        <section id="testimonials" className="border-border bg-muted/60 border-y">
            <div className="landing-container landing-section">
                <div className="mx-auto max-w-2xl text-center">
                    <p className="landing-eyebrow">Testimonials</p>
                    <h2 className="landing-heading">A little less busywork. A lot more progress.</h2>
                    <p className="landing-description">A shared workspace makes it easier to focus, collaborate, and move forward together.</p>
                </div>

                <div className="mt-9 grid gap-5 md:grid-cols-3">
                    {testimonials.map((testimonial) => (
                        <div key={testimonial.author} className="border-border bg-card flex flex-col justify-between rounded-lg border p-6">
                            <p className="text-foreground text-base leading-relaxed">“{testimonial.quote}”</p>
                            <div className="mt-8 flex items-center gap-3">
                                <div className="bg-accent text-primary flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-medium">
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">{testimonial.author}</p>
                                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{testimonial.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-10 flex justify-center">
                    <Button asChild size="sm" className="landing-button">
                        <Link href="/register">Join the workspace</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
