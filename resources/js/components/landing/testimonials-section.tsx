import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GradientBackground } from '@/components/ui/gradient-background';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

export function TestimonialsSection() {
    const testimonials = [
        {
            quote: "This platform transformed how our team collaborates. We've reduced project delivery time by 40% and improved client satisfaction.",
            author: "Sarah Johnson",
            role: "Product Manager, TechCorp",
            avatar: "SJ",
        },
        {
            quote: "The analytics dashboard gives us unprecedented visibility into our project health. We can identify bottlenecks before they become problems.",
            author: "Michael Chen",
            role: "CTO, InnovateLabs",
            avatar: "MC",
        },
        {
            quote: "We've tried many project management tools, but this one strikes the perfect balance between powerful features and ease of use.",
            author: "Emily Rodriguez",
            role: "Team Lead, DesignStudio",
            avatar: "ER",
        },
        {
            quote: "The custom workflow feature allowed us to adapt the system to our unique agency processes rather than changing how we work.",
            author: "David Wilson",
            role: "Agency Director, CreativeEdge",
            avatar: "DW",
        },
    ];

    return (
        <section id="testimonials" className="relative w-full py-12 md:py-24 lg:py-32">
            <GradientBackground variant="purple" intensity="light" />

            <div className="container relative z-10 mx-auto px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <div className="inline-block rounded-lg bg-purple-500/10 px-3 py-1 text-sm dark:bg-purple-500/20">
                            <span className="bg-gradient-to-r from-purple-500 to-purple-700 bg-clip-text font-semibold text-transparent">
                                Testimonials
                            </span>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                            What Our Customers Say
                        </h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl">
                            Don't just take our word for it. Here's what others have to say about ProjectFlow.
                        </p>
                    </div>
                </div>

                <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="flex flex-col justify-between space-y-4 rounded-lg border p-6 bg-background/80 backdrop-blur-sm"
                        >
                            <div className="space-y-2">
                                <div className="flex space-x-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <svg
                                            key={i}
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className={i < testimonial.rating ? "text-yellow-500" : "text-gray-300"}
                                        >
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-muted-foreground">{testimonial.quote}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-700 font-bold">
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{testimonial.author}</p>
                                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center mt-8">
                    <Link href="/register">
                        <Button
                            variant="gradient-sunset"
                            size="lg"
                            className="w-full sm:w-auto"
                        >
                            Join Our Community
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
