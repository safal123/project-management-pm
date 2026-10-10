import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { BarChart3, CheckSquare, Clock, PackagePlus, Users, Workflow } from 'lucide-react';

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
];

export function FeatureSection() {
    return (
        <section id="features" className="border-border border-b">
            <div className="landing-container landing-section">
                <div className="mx-auto max-w-2xl text-center">
                    <p className="landing-eyebrow">Features</p>
                    <h2 className="landing-heading">Everything you need to run a project</h2>
                    <p className="landing-description">
                        Less time chasing updates. More time doing work that matters. Bring your projects, people, and plans together.
                    </p>
                </div>

                <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                        <div key={feature.title} className="border-border bg-card rounded-lg border p-6">
                            <div className="bg-accent text-primary mb-6 flex size-11 items-center justify-center rounded-md">
                                <feature.icon className="size-5" />
                            </div>
                            <h3 className="text-base font-semibold">{feature.title}</h3>
                            <p className="text-muted-foreground mt-3 text-base leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-10 flex justify-center">
                    <Button asChild size="sm" className="landing-button">
                        <Link href="/register">Explore the product</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
