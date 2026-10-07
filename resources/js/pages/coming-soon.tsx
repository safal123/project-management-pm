import AppLayout from '@/layouts/app-layout'
import AppEmpty from '@/components/app-empty'
import { type BreadcrumbItem } from '@/types'
import { Head } from '@inertiajs/react'
import { Archive, Clock, CreditCard, Mail, Users, type LucideIcon } from 'lucide-react'

const icons: Record<string, LucideIcon> = {
  users: Users,
  clock: Clock,
  mail: Mail,
  'credit-card': CreditCard,
  archive: Archive,
}

interface ComingSoonProps {
  title: string
  description: string
  icon: string
}

export default function ComingSoon({ title, description, icon }: ComingSoonProps) {
  const Icon = icons[icon] ?? Clock
  const breadcrumbs: BreadcrumbItem[] = [{ title, href: '#' }]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={title} />

      <div className="px-4 py-4 lg:px-6">
        <div className="mb-4">
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>
        </div>

        <AppEmpty
          title="Coming soon"
          description={`${title} is not available yet. This page is a placeholder while we build it.`}
          icon={<Icon className="text-muted-foreground" />}
        />
      </div>
    </AppLayout>
  )
}
