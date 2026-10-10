import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const ROLE_STYLES: Record<string, string> = {
  owner: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  admin: 'border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
  member: 'border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800/70 dark:text-zinc-300',
}

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
}

export function roleLabel(role?: string | null) {
  if (!role) return 'Member'
  return ROLE_LABELS[role] ?? role
}

export function RoleBadge({ role, className }: { role?: string | null; className?: string }) {
  const key = role || 'member'

  return (
    <Badge
      variant="outline"
      className={cn(
        'h-5 px-1.5 text-[10px] font-medium capitalize',
        ROLE_STYLES[key] ?? ROLE_STYLES.member,
        className
      )}
    >
      {roleLabel(key)}
    </Badge>
  )
}
