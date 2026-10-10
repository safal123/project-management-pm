import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, Layers, Menu, Moon, Sun, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { href: '#features', label: 'Features' },
    { href: '#testimonials', label: 'Testimonials' },
    { href: '#pricing', label: 'Pricing' },
];

export function Header() {
    const { auth } = usePage<SharedData>().props;
    const { setTheme } = useTheme();
    const [open, setOpen] = useState(false);
    const accountLinks = (
        <>
            {auth.user ? (
                <Button asChild className="landing-button">
                    <Link href={route('dashboard')} onClick={() => setOpen(false)}>
                        Dashboard
                    </Link>
                </Button>
            ) : (
                <>
                    <Button asChild variant="ghost" className="landing-button">
                        <Link href="/login" onClick={() => setOpen(false)}>
                            Log in
                        </Link>
                    </Button>
                    <Button asChild className="landing-button">
                        <Link href="/register" onClick={() => setOpen(false)}>
                            Get started <ArrowUpRight />
                        </Link>
                    </Button>
                </>
            )}
        </>
    );
    return (
        <header className="border-border bg-background/90 sticky top-0 z-50 border-b backdrop-blur-sm">
            <div className="landing-container flex h-16 items-center justify-between gap-4">
                <Link href="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
                    <span className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-md">
                        <Layers className="size-5" />
                    </span>
                    ProjectFlow
                </Link>
                <nav aria-label="Main navigation" className="hidden items-center gap-2 lg:flex">
                    {navItems.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg px-3 py-2 text-sm"
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>
                <div className="flex items-center gap-1.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Toggle theme"
                        className="relative size-10"
                        onClick={() => setTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark')}
                    >
                        <Sun className="size-4 scale-100 rotate-0 dark:scale-0 dark:-rotate-90" />
                        <Moon className="absolute size-4 scale-0 rotate-90 dark:scale-100 dark:rotate-0" />
                    </Button>
                    <div className="hidden items-center gap-1.5 lg:flex">{accountLinks}</div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-10 lg:hidden"
                        aria-label={open ? 'Close navigation' : 'Open navigation'}
                        aria-expanded={open}
                        aria-controls="mobile-navigation"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <X className="size-4" /> : <Menu className="size-4" />}
                    </Button>
                </div>
            </div>
            {open && (
                <div id="mobile-navigation" className="border-border bg-background border-t lg:hidden">
                    <nav aria-label="Mobile navigation" className="landing-container flex flex-col gap-1 py-3">
                        {navItems.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg px-3 py-3 text-base"
                                onClick={() => setOpen(false)}
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>
                    <div className="landing-container border-border flex flex-col gap-2 border-t py-4">{accountLinks}</div>
                </div>
            )}
        </header>
    );
}
