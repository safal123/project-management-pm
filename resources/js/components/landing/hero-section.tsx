import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { GradientBackground } from '@/components/ui/gradient-background';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Users, Plus, MoreHorizontal } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative w-full py-12 md:py-24 lg:py-24 xl:py-16 overflow-hidden">
      <GradientBackground variant="primary" intensity="light" withOrbs />

      <div className="lg:container relative z-10 mx-auto px-8">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm border border-primary/20">
                <span className="font-semibold text-primary">
                  Introducing ProjectFlow
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                <span className="text-primary">Streamline</span> Your Projects with Precision
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Empower your team with our intuitive project management platform. Plan, collaborate, and deliver exceptional results.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/register">
                <Button
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

          {/* Interesting Interactive Component (Live Kanban Mockup) */}
          <div className="flex items-center justify-center w-full mt-12 lg:mt-0">
            <div className="relative mx-auto w-full group max-w-2xl">
              {/* Outer Glow Effect */}
              <div className="absolute -inset-4 bg-primary/5 rounded-[2rem] blur-3xl opacity-50 group-hover:opacity-100 transition duration-700" />

              <div className="relative">
                {/* Browser-like Window Frame */}
                <div className="overflow-hidden rounded-xl border border-border/60 bg-background shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 group-hover:translate-y-[-8px] group-hover:shadow-primary/10">
                  {/* Browser Toolbar */}
                  <div className="flex items-center justify-between border-b border-border/40 bg-muted/20 px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-destructive/40" />
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-500/40" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/40" />
                    </div>
                    <div className="h-5 w-1/2 rounded-md bg-muted/40 border border-border/10 flex items-center justify-center px-3">
                      <div className="h-1.5 w-full rounded-full bg-muted-foreground/10" />
                    </div>
                    <div className="flex gap-2 opacity-20">
                      <div className="h-4 w-4 rounded bg-muted-foreground" />
                      <div className="h-4 w-4 rounded bg-muted-foreground" />
                    </div>
                  </div>

                  {/* Mock Content (Kanban Board) */}
                  <div className="p-4 bg-background/50 h-[380px] overflow-hidden">
                    <div className="grid grid-cols-3 gap-4 h-full">
                      {/* Column 1: To Do */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">To Do</span>
                          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground font-medium">3</span>
                        </div>
                        <div className="space-y-2">
                          <MockCard title="Research API" priority="Low" tag="Planning" delay="delay-75" />
                          <MockCard title="Design System" priority="High" tag="UI/UX" delay="delay-150" active />
                          <MockCard title="Setup DB" priority="Med" tag="Dev" delay="delay-300" />
                        </div>
                      </div>

                      {/* Column 2: In Progress */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Doing</span>
                          <span className="text-[10px] bg-primary/10 px-1.5 py-0.5 rounded-full text-primary font-medium">1</span>
                        </div>
                        <div className="space-y-2">
                          <MockCard
                            title="Hero Redesign"
                            priority="High"
                            tag="Frontend"
                            progress={65}
                            user="JD"
                            className="ring-1 ring-primary/20 shadow-lg translate-y-[-2px]"
                          />
                        </div>
                      </div>

                      {/* Column 3: Done */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Done</span>
                          <span className="text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded-full text-emerald-600 font-medium">12</span>
                        </div>
                        <div className="space-y-2 opacity-60 grayscale-[0.5]">
                          <MockCard title="Landing Page" priority="Low" tag="Marketing" done />
                          <MockCard title="Bug: Auth" priority="High" tag="Dev" done />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements for Depth */}
                <div className="absolute -left-12 top-20 hidden lg:block animate-bounce [animation-duration:3s]">
                  <div className="p-3 bg-background/90 backdrop-blur-md rounded-xl border border-border/50 shadow-2xl -rotate-6">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="h-2 w-20 rounded-full bg-muted" />
                        <div className="h-1.5 w-12 rounded-full bg-emerald-500/30" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-8 bottom-12 hidden lg:block animate-pulse">
                  <div className="p-3 bg-background/90 backdrop-blur-md rounded-xl border border-border/50 shadow-2xl rotate-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-amber-500" />
                      <div className="h-1.5 w-24 rounded-full bg-amber-500/20" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Background Orbs */}
              <div className="absolute -bottom-10 -left-10 h-32 w-32 sm:h-48 sm:w-48 rounded-full bg-primary/10 blur-[60px] -z-10" />
              <div className="absolute -right-10 -top-10 h-32 w-32 sm:h-48 sm:w-48 rounded-full bg-primary/10 blur-[60px] -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MockCard({
  title,
  priority,
  tag,
  progress,
  user = "SP",
  done = false,
  active = false,
  className = ""
}: any) {
  return (
    <div className={`p-2.5 rounded-lg border border-border/50 bg-background shadow-sm hover:border-primary/30 transition-all ${active ? 'border-primary/40 bg-primary/5' : ''} ${className}`}>
      <div className="flex items-start justify-between mb-2">
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${priority === 'High' ? 'bg-destructive/10 text-destructive' :
          priority === 'Med' ? 'bg-amber-500/10 text-amber-600' : 'bg-muted text-muted-foreground'
          }`}>
          {priority}
        </span>
        <MoreHorizontal className="h-3 w-3 text-muted-foreground/40" />
      </div>
      <p className="text-xs font-semibold mb-2 leading-tight">{title}</p>
      <div className="flex items-center gap-1.5 mb-2.5">
        <Badge variant="secondary" className="text-[8px] h-3.5 px-1 bg-muted/50 text-muted-foreground border-transparent">
          {tag}
        </Badge>
      </div>
      {progress !== undefined && (
        <div className="w-full bg-muted/50 h-1 rounded-full mb-3 overflow-hidden">
          <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
      )}
      <div className="flex items-center justify-between border-t border-border/20 pt-2 mt-1">
        <div className="flex -space-x-1.5">
          <div className="h-5 w-5 rounded-full border border-background bg-primary/20 text-[8px] flex items-center justify-center font-bold">{user}</div>
          {active && <div className="h-5 w-5 rounded-full border border-background bg-muted-foreground/20 text-[8px] flex items-center justify-center font-bold">JD</div>}
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground/60">
          <Users className="h-2.5 w-2.5" />
          <Plus className="h-2.5 w-2.5" />
        </div>
      </div>
    </div>
  );
}
