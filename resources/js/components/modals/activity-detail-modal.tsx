import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from '@inertiajs/react'
import { format, formatDistanceToNow } from 'date-fns'
import { ArrowUpRight, Clock, LoaderCircle } from 'lucide-react'

import { ActivityTimeline } from '@/components/activity/activity-timeline'
import AppAvatar from '@/components/app-avatar'
import { BaseModal } from '@/components/modals/base-modal'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Activity } from '@/types'

function timelineQuery(activity: Activity) {
  const projectId =
    activity.subject?.type === 'project' ? activity.subject.id : activity.subject?.project?.id

  if (projectId) {
    return { scope: 'project' as const, projectId }
  }

  return { scope: 'workspace' as const }
}

interface ActivityDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activity: Activity | null
}

export function ActivityDetailModal({ open, onOpenChange, activity }: ActivityDetailModalProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const query = activity ? timelineQuery(activity) : null

  useEffect(() => {
    if (!open || !query) return

    let cancelled = false
    setIsLoading(true)

    axios
      .get<{ data: Activity[] }>(route('activities.index'), {
        params:
          query.scope === 'workspace'
            ? { scope: 'workspace' }
            : { scope: 'project', project_id: query.projectId },
      })
      .then(({ data }) => {
        if (!cancelled) setActivities(data.data ?? [])
      })
      .catch(() => {
        if (!cancelled) setActivities([])
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, query?.scope, query && 'projectId' in query ? query.projectId : null])

  const href = activity?.subject?.url
  const timelineLabel =
    query?.scope === 'project' && activity?.subject?.project
      ? `Timeline · ${activity.subject.project.name}`
      : activity?.subject?.type === 'project' && activity.subject.name
        ? `Timeline · ${activity.subject.name}`
        : 'Timeline'

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      icon={<Clock />}
      title="Activity details"
      description={activity ? format(new Date(activity.created_at), 'MMM d, yyyy · h:mm a') : undefined}
      className="sm:max-w-xl"
      footer={
        href ? (
          <Button asChild variant="outline">
            <Link href={href}>
              Open {activity?.subject?.type ?? 'item'}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        ) : undefined
      }
    >
      {activity && (
        <div className="space-y-4">
          <div className="rounded-md border border-border bg-card p-3 shadow-sm">
            <div className="flex items-start gap-2.5">
              <AppAvatar
                src={activity.user?.avatar ?? activity.user?.profile_picture?.url}
                name={activity.user?.name}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium">{activity.user?.name ?? 'Someone'}</p>
                <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">
                  {activity.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                  {activity.subject?.name && <span className="capitalize">{activity.subject.type}: {activity.subject.name}</span>}
                  {activity.subject?.project && activity.subject.type !== 'project' && (
                    <span>Project: {activity.subject.project.name}</span>
                  )}
                  <span>{formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {timelineLabel}
            </p>
            <ScrollArea className="h-[320px] pr-2">
              {isLoading ? (
                <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                </div>
              ) : (
                <ActivityTimeline activities={activities} highlightedId={activity.id} />
              )}
            </ScrollArea>
          </div>
        </div>
      )}
    </BaseModal>
  )
}
