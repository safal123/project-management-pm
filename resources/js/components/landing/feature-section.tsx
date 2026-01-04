import { GradientBackground } from '@/components/ui/gradient-background';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { CheckSquare, Users, BarChart3, Clock, Workflow, PackagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FeatureSection() {
  const features = [
    {
      title: "Task Management",
      description: "Easily create, assign, and track tasks with our intuitive interface. Set priorities, deadlines, and dependencies.",
      icon: <CheckSquare className="h-6 w-6 text-primary" />,
      bgColor: "bg-primary/10",
    },
    {
      title: "Real-time Collaboration",
      description: "Work together effortlessly with team members. Comment, share files, and update progress in real-time.",
      icon: <Users className="h-6 w-6 text-primary" />,
      bgColor: "bg-primary/10",
    },
    {
      title: "Analytics Dashboard",
      description: "Gain insights with powerful analytics. Track progress, identify bottlenecks, and measure team performance.",
      icon: <BarChart3 className="h-6 w-6 text-primary" />,
      bgColor: "bg-primary/10",
    },
    {
      title: "Resource Management",
      description: "Allocate and optimize resources efficiently. Track availability, workload, and utilization rates.",
      icon: <Clock className="h-6 w-6 text-primary" />,
      bgColor: "bg-primary/10",
    },
    {
      title: "Custom Workflows",
      description: "Create workflows that match your team's process. Adapt and evolve as your needs change.",
      icon: <Workflow className="h-6 w-6 text-primary" />,
      bgColor: "bg-primary/10",
    },
    {
      title: "Integrations",
      description: "Connect with the tools you already use. Seamlessly integrate with popular services and platforms.",
      icon: <PackagePlus className="h-6 w-6 text-primary" />,
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <section id="features" className="relative w-full py-12 md:py-24 lg:py-32">
      <GradientBackground variant="primary" intensity="light" />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm border border-primary/20">
            <span className="font-semibold text-primary">
              Features
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
            Everything you need to manage your projects
          </h2>
          <p className="text-muted-foreground md:text-xl">
            Our platform offers a comprehensive set of tools designed to streamline your project management workflow.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col space-y-2 rounded-lg border p-6 bg-background/50 backdrop-blur-sm hover:border-primary/50 transition-colors group">
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg mb-2", feature.bgColor)}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <Link href="/register">
            <Button
              size="lg"
              className="w-full sm:w-auto"
            >
              Explore All Features
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
