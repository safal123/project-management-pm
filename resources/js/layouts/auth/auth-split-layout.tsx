import AppLogoIcon from '@/components/app-logo-icon'
import { type SharedData } from '@/types'
import { Link, usePage } from '@inertiajs/react'
import { type PropsWithChildren } from 'react'

interface AuthLayoutProps {
  title?: string
  description?: string
}

const highlights = [
  { title: 'Projects', copy: 'Boards, tables, and calendars in one workspace.' },
  { title: 'People', copy: 'Invite the team and keep roles clear.' },
  { title: 'Activity', copy: 'See what changed without digging through chat.' },
]

export default function AuthSplitLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
  const { name } = usePage<SharedData>().props

  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between border-r border-border bg-zinc-950 px-10 py-10 text-white lg:flex">
        <Link href={route('home')} className="relative z-10 flex items-center gap-2 text-[13px] font-semibold">
          <AppLogoIcon className="size-6 fill-current text-white" />
          {name}
        </Link>

        <div className="relative z-10 max-w-sm">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/50">Workspace</p>
          <h2 className="mt-2 text-[28px] font-semibold leading-tight tracking-tight">
            Plan work, stay aligned, ship faster.
          </h2>
          <ul className="mt-8 space-y-4">
            {highlights.map((item) => (
              <li key={item.title}>
                <p className="text-[13px] font-medium">{item.title}</p>
                <p className="mt-0.5 text-[12px] text-white/60">{item.copy}</p>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-[12px] text-white/40">Built for teams that want less noise.</p>
      </div>

      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-[360px]">
          <Link href={route('home')} className="mb-6 flex items-center gap-2 lg:hidden">
            <AppLogoIcon className="size-6 fill-current" />
            <span className="text-[13px] font-semibold">{name}</span>
          </Link>
          <div className="mb-5">
            <h1 className="text-[18px] font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 text-[12px] text-muted-foreground">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
