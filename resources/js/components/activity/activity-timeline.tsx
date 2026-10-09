import { Link } from '@inertiajs/react'
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'
import {
  ArrowRightLeft,
  Calendar,
  CalendarClock,
  Check,
  Clock,
  Folder,
  GitBranch,
  Heart,
  History,
  Link2,
  ListTodo,
  ListTree,
  MessageSquare,
  Paperclip,
  Pencil,
  Plus,
  RefreshCw,
  UserPlus,
} from 'lucide-react'

import AppAvatar from '@/components/app-avatar'
import { cn } from '@/lib/utils'
import { Activity } from '@/types'

const subjectIcons = {
  task: ListTodo,
  project: Folder,
  event: Calendar,
  item: Clock,
}

const typeMeta: Record<string, { icon: typeof Plus; className: string }> = {
  created: { icon: Plus, className: 'border-sky-200 bg-sky-50 text-sky-600 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-400' },
  status_changed: { icon: RefreshCw, className: 'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400' },
  assigned: { icon: UserPlus, className: 'border-violet-200 bg-violet-50 text-violet-600 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-400' },
  moved: { icon: ArrowRightLeft, className: 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300' },
  completed: { icon: Check, className: 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' },
  commented: { icon: MessageSquare, className: 'border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400' },
  liked: { icon: Heart, className: 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-400' },
  branch_created: { icon: GitBranch, className: 'border-teal-200 bg-teal-50 text-teal-600 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-400' },
  title_changed: { icon: Pencil, className: 'border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-400' },
  due_date_changed: { icon: CalendarClock, className: 'border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-400' },
  file_uploaded: { icon: Paperclip, className: 'border-cyan-200 bg-cyan-50 text-cyan-600 dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-400' },
  dependency_changed: { icon: Link2, className: 'border-purple-200 bg-purple-50 text-purple-600 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-400' },
  subtask_added: { icon: ListTree, className: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-600 dark:border-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-400' },
}

function dayLabel(date: Date) {
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'EEEE, MMM d')
}

export function groupActivities(activities: Activity[]) {
  const groups: { key: string; label: string; items: Activity[] }[] = []

  activities.forEach((activity) => {
    const date = new Date(activity.created_at)
    const key = format(date, 'yyyy-MM-dd')
    const current = groups[groups.length - 1]

    if (current?.key === key) {
      current.items.push(activity)
      return
    }

    groups.push({ key, label: dayLabel(date), items: [activity] })
  })

  return groups
}

interface ActivityTimelineProps {
  activities: Activity[]
  emptyTitle?: string
  emptyDescription?: string
  className?: string
  highlightedId?: string | null
}

export function ActivityTimeline({
  activities,
  emptyTitle = 'No activity yet',
  emptyDescription = 'Creates, updates, and comments show up here.',
  className = '',
  highlightedId,
}: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center gap-1 py-8 text-center ${className}`}>
        <History className="h-4 w-4 text-muted-foreground" />
        <p className="text-[13px] font-medium">{emptyTitle}</p>
        <p className="text-[12px] text-muted-foreground">{emptyDescription}</p>
      </div>
    )
  }

  const groups = groupActivities(activities)

  return (
    <div className={className}>
      {groups.map((group) => (
        <section key={group.key} className="mb-3 last:mb-0">
          <p className="mb-2 text-[11px] font-medium text-muted-foreground">{group.label}</p>
          <ol className="relative ml-2.5 space-y-2.5 border-l border-border pl-5">
            {group.items.map((activity) => {
              const subjectType = activity.subject?.type ?? 'item'
              const SubjectIcon = subjectIcons[subjectType] ?? Clock
              const type = typeMeta[activity.type] ?? {
                icon: Pencil,
                className: 'border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300',
              }
              const TypeIcon = type.icon
              const isHighlighted = highlightedId === activity.id

              return (
                <li key={activity.id} className="relative">
                  <span
                    className={cn(
                      'absolute top-2.5 -left-[28px] flex size-4 items-center justify-center rounded-full border',
                      type.className,
                      isHighlighted && 'ring-2 ring-current'
                    )}
                  >
                    <TypeIcon className="size-2.5" />
                  </span>
                  <div
                    className={cn(
                      'rounded-md border border-border bg-card p-2.5 shadow-sm',
                      isHighlighted && 'border-foreground/30 bg-muted/40'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <AppAvatar
                        src={activity.user?.avatar ?? activity.user?.profile_picture?.url}
                        name={activity.user?.name}
                        size="xs"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] leading-5">
                          <span className="font-medium">{activity.user?.name ?? 'Someone'}</span>{' '}
                          <span className="text-muted-foreground">{activity.description}</span>
                        </p>
                        {activity.subject?.name && (
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            {activity.subject.url ? (
                              <Link
                                href={activity.subject.url}
                                className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
                              >
                                <SubjectIcon className="h-3 w-3" />
                                <span className="max-w-[200px] truncate">{activity.subject.name}</span>
                              </Link>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground">
                                <SubjectIcon className="h-3 w-3" />
                                <span className="max-w-[200px] truncate">{activity.subject.name}</span>
                              </span>
                            )}
                            {activity.subject.project && activity.subject.type !== 'project' && (
                              <Link
                                href={`/projects/${activity.subject.project.slug}`}
                                className="text-[11px] text-muted-foreground hover:text-foreground hover:underline"
                              >
                                {activity.subject.project.name}
                              </Link>
                            )}
                          </div>
                        )}
                        <time
                          dateTime={activity.created_at}
                          className="mt-1 block text-[11px] text-muted-foreground"
                        >
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </time>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </section>
      ))}
    </div>
  )
}
