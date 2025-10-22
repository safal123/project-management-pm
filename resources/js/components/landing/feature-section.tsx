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
      icon: <CheckSquare className="h-6 w-6 text-emerald-500" />,
      bgColor: "bg-emerald-100 dark:bg-emerald-950/30",
    },
    {
      title: "Real-time Collaboration",
      description: "Work together effortlessly with team members. Comment, share files, and update progress in real-time.",
      icon: <Users className="h-6 w-6 text-violet-500" />,
      bgColor: "bg-violet-100 dark:bg-violet-950/30",
    },
    {
      title: "Analytics Dashboard",
      description: "Gain insights with powerful analytics. Track progress, identify bottlenecks, and measure team performance.",
      icon: <BarChart3 className="h-6 w-6 text-blue-500" />,
      bgColor: "bg-blue-100 dark:bg-blue-950/30",
    },
    {
      title: "Resource Management",
      description: "Allocate and optimize resources efficiently. Track availability, workload, and utilization rates.",
      icon: <Clock className="h-6 w-6 text-amber-500" />,
      bgColor: "bg-amber-100 dark:bg-amber-950/30",
    },
    {
      title: "Custom Workflows",
      description: "Create workflows that match your team's process. Adapt and evolve as your needs change.",
      icon: <Workflow className="h-6 w-6 text-indigo-500" />,
      bgColor: "bg-indigo-100 dark:bg-indigo-950/30",
    },
    {
      title: "Integrations",
      description: "Connect with the tools you already use. Seamlessly integrate with popular services and platforms.",
      icon: <PackagePlus className="h-6 w-6 text-rose-500" />,
      bgColor: "bg-rose-100 dark:bg-rose-950/30",
    },
  ];

  return (
    <section id="features" className="relative w-full py-12 md:py-24 lg:py-32">
      <GradientBackground variant="blue" intensity="light" />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-block rounded-lg bg-blue-500/10 px-3 py-1 text-sm dark:bg-blue-500/20">
            <span className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text font-semibold text-transparent">
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
            <div key={index} className="flex flex-col space-y-2 rounded-lg border p-6 bg-background/80 backdrop-blur-sm">
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg", feature.bgColor)}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <Link href="/register">
            <Button
              variant="gradient-blue"
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
