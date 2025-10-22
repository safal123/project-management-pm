import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section id="hero" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Manage Your Projects with Ease
              </h1>
              <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                Simplify your workflow, collaborate with your team, and deliver projects on time with our intuitive project management solution.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/register">
                <Button size="lg" className="w-full min-[400px]:w-auto">
                  Get Started
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full min-[400px]:w-auto">
                  Log In
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center w-full px-4 sm:px-0 mt-8 sm:mt-10 lg:mt-0">
            <div className="relative w-full max-w-full">
              <div className="overflow-hidden rounded-lg shadow-lg">
                <img
                  alt="Project Management Dashboard"
                  className="w-full h-auto object-cover"
                  src="/images/dashboard-preview.svg"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-primary/30 blur-2xl" />
              <div className="absolute -right-6 -top-6 h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-primary/30 blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
