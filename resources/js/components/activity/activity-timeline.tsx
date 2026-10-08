import { Link } from '@inertiajs/react'
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'
import { Calendar, Clock, Folder, History, ListTodo } from 'lucide-react'

import AppAvatar from '@/components/app-avatar'
import { cn } from '@/lib/utils'
import { Activity } from '@/types'

const subjectIcons = {
  task: ListTodo,
  project: Folder,
  event: Calendar,
  item: Clock,
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
          <ol className="relative ml-2 space-y-2.5 border-l border-border pl-4">
            {group.items.map((activity) => {
              const subjectType = activity.subject?.type ?? 'item'
              const SubjectIcon = subjectIcons[subjectType] ?? Clock
              const isHighlighted = highlightedId === activity.id

              return (
                <li key={activity.id} className="relative">
                  <span
                    className={cn(
                      'absolute top-3.5 -left-[21px] size-2 rounded-full border border-background',
                      isHighlighted ? 'bg-foreground' : 'bg-muted-foreground/50'
                    )}
                  />
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
