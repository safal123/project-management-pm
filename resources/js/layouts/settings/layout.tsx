import Heading from '@/components/heading'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { type NavItem } from '@/types'
import { Link, usePage } from '@inertiajs/react'
import { type PropsWithChildren } from 'react'

const sidebarNavItems: NavItem[] = [
  {
    title: 'Profile',
    url: '/settings/profile',
    icon: null,
  },
  {
    title: 'Password',
    url: '/settings/password',
    icon: null,
  },
  {
    title: 'Appearance',
    url: '/settings/appearance',
    icon: null,
  },
]

export default function SettingsLayout({ children }: PropsWithChildren) {
  const currentPath = usePage().url.split('?')[0]

  return (
    <div className="px-4 py-4 lg:px-6">
      <Heading title="Settings" description="Manage your profile and account settings" />

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <aside className="w-full lg:w-44">
          <nav className="flex flex-col gap-0.5">
            {sidebarNavItems.map((item) => (
              <Button
                key={item.url}
                size="sm"
                variant="ghost"
                asChild
                className={cn(
                  'h-7 w-full justify-start rounded-md border border-transparent px-2 text-[13px] font-normal text-muted-foreground hover:bg-neutral-100 hover:text-foreground dark:hover:bg-neutral-800',
                  currentPath === item.url &&
                    'border-neutral-300 bg-neutral-200/80 font-medium text-foreground dark:border-neutral-700 dark:bg-neutral-800/80'
                )}
              >
                <Link href={item.url} prefetch>
                  {item.title}
                </Link>
              </Button>
            ))}
          </nav>
        </aside>

        <Separator className="md:hidden" />

        <div className="min-w-0 flex-1 md:max-w-2xl">
          <section className="max-w-xl space-y-4">{children}</section>
        </div>
      </div>
    </div>
  )
}
