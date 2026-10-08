import { Link, usePage } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { useTheme } from '@/hooks/use-theme'
import { useState, type MouseEvent } from 'react'
import { SharedData } from '@/types'

const navItems = [
  { href: '#features', label: 'Features' },
  { href: '#testimonials', label: 'Testimonials' },
  { href: '#pricing', label: 'Pricing' },
]

export function Header() {
  const { auth } = usePage<SharedData>().props
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)

  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 lg:px-6">
        <Link href="/" className="text-[13px] font-semibold tracking-tight">
          ProjectFlow
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="rounded-md px-2.5 py-1 text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground"
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
            className="h-8 w-8"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-3.5 w-3.5 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-3.5 w-3.5 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
          </Button>

          <div className="hidden items-center gap-1.5 md:flex">
            {auth.user ? (
              <Link href={route('dashboard')}>
                <Button size="sm" className="h-8 px-3 text-[13px]">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="h-8 px-3 text-[13px]">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="h-8 px-3 text-[13px]">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:hidden"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-3.5 w-3.5" /> : <Menu className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-0.5 px-4 py-2 lg:px-6">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-md px-2.5 py-1.5 text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={(e) => {
                  handleNavClick(e, item.href)
                  setOpen(false)
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mx-auto flex max-w-6xl flex-col gap-1.5 border-t border-border px-4 py-3 lg:px-6">
            {auth.user ? (
              <Link href={route('dashboard')} onClick={() => setOpen(false)}>
                <Button size="sm" className="h-8 w-full text-[13px]">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}>
                  <Button variant="outline" size="sm" className="h-8 w-full text-[13px]">
                    Log in
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}>
                  <Button size="sm" className="h-8 w-full text-[13px]">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
