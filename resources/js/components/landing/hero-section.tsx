import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { GradientBackground } from '@/components/ui/gradient-background';

export function HeroSection() {
  return (
    <section className="relative w-full py-12 md:py-24 lg:py-24 xl:py-16 overflow-hidden">
      <GradientBackground variant="blue" intensity="light" withOrbs />

      <div className="lg:container relative z-10 mx-auto px-8">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-gradient-to-r from-purple-500/20 via-violet-500/10 to-indigo-500/5 px-3 py-1 text-sm">
                <span className="bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 bg-clip-text font-semibold text-transparent">
                  Introducing ProjectFlow
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                <span className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">Streamline</span> Your Projects with Precision
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Empower your team with our intuitive project management platform. Plan, collaborate, and deliver exceptional results.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/register">
                <Button
                  variant="gradient"
                  size="lg"
                  className="w-full min-[400px]:w-auto"
                >
                  Get Started
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full min-[400px]:w-auto border-primary/20 text-primary hover:bg-primary/5"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Dashboard preview container with proper mobile centering */}
          <div className="flex items-center justify-center w-full mt-8 sm:mt-10 lg:mt-0">
            <div className="relative mx-auto w-full">
              <div className="overflow-hidden rounded-lg shadow-lg">
                <img
                  alt="Project Management Dashboard"
                  className="w-full h-auto object-cover"
                  src="/images/dashboard-preview.svg"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-purple-500/30 blur-2xl" />
              <div className="absolute -right-6 -top-6 h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-indigo-500/30 blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
