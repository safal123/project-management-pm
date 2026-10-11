import { Link } from '@inertiajs/react';
import { ArrowLeft, Layers } from 'lucide-react';
import { type PropsWithChildren } from 'react';
import '../../../css/landing.css';

interface AuthLoginLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthLoginLayout({
    children,
    title = 'Welcome back',
    description = 'Log in to your ProjectFlow workspace.',
}: PropsWithChildren<AuthLoginLayoutProps>) {
    return (
        <div className="landing-page grid min-h-dvh font-sans lg:grid-cols-[1fr_1fr]">
            <aside className="hidden flex-col justify-between border-r border-neutral-800 bg-neutral-950 p-10 text-white lg:flex xl:p-14">
                <Link href={route('home')} className="flex w-fit items-center gap-2.5 text-lg font-semibold tracking-tight">
                    <span className="flex size-9 items-center justify-center rounded-lg border border-white/20">
                        <Layers className="size-5" />
                    </span>
                    ProjectFlow
                </Link>
                <div className="my-16 w-full max-w-xl self-center">
                    <p className="text-xs font-medium tracking-[0.12em] text-neutral-400 uppercase">Your team. Your workspace.</p>
                    <h2 className="mt-5 max-w-sm text-3xl leading-tight font-medium tracking-tight">A clear view of the work ahead.</h2>
                    <p className="mt-4 max-w-sm text-sm leading-7 text-neutral-400">
                        Bring your projects, conversations, and deadlines together. Pick up right where you left off.
                    </p>
                    <div className="mt-9 overflow-hidden rounded-lg border border-white/15 bg-neutral-900 p-1.5">
                        <img
                            src="/images/dashboard-banner-dark.png"
                            alt="ProjectFlow dashboard with project progress, task activity, and recent updates."
                            width={3446}
                            height={1896}
                            className="block h-auto w-full rounded"
                        />
                    </div>
                    <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-neutral-400">
                        <span>Organize projects</span>
                        <span aria-hidden="true">/</span>
                        <span>Keep teams aligned</span>
                        <span aria-hidden="true">/</span>
                        <span>Track progress</span>
                    </div>
                </div>
                <p className="text-xs text-neutral-500">© {new Date().getFullYear()} ProjectFlow</p>
            </aside>
            <div className="flex min-h-dvh flex-col px-6 py-6 sm:px-10 sm:py-8 xl:px-16">
                <header className="flex items-center justify-between gap-4">
                    <Link href={route('home')} className="flex items-center gap-2 text-sm font-semibold lg:hidden">
                        <Layers className="size-5" />
                        ProjectFlow
                    </Link>
                    <Link href={route('home')} className="text-muted-foreground hover:text-foreground ml-auto flex items-center gap-2 text-xs">
                        <ArrowLeft className="size-3.5" />
                        Back to home
                    </Link>
                </header>
                <main className="mx-auto flex w-full max-w-[380px] flex-1 flex-col justify-center py-12 sm:py-16">
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{description}</p>
                    </div>
                    {children}
                </main>
                <p className="text-muted-foreground text-center text-xs">A little less busywork. A little more progress.</p>
            </div>
        </div>
    );
}
