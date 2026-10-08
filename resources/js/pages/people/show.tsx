import { useEffect, useMemo, useState } from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'
import { Check, Copy, Folder, LoaderCircle, Mail, Pencil } from 'lucide-react'
import { toast } from 'sonner'

import AppAvatar from '@/components/app-avatar'
import AppEmpty from '@/components/app-empty'
import AppLayout from '@/layouts/app-layout'
import { ActivityDetailModal } from '@/components/modals/activity-detail-modal'
import { AppTable, type AppTableColumn } from '@/components/app-table'
import { RoleBadge, roleLabel } from '@/components/role-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatShortDate } from '@/utils/app-utils'
import { type Activity, type BreadcrumbItem, type SharedData } from '@/types'

interface PersonProfile {
  id: string
  name: string
  email: string
  avatar?: string | null
  role: 'owner' | 'admin' | 'member'
  joined_at?: string | null
  last_active_at?: string | null
  is_current_user: boolean
}

interface PersonProject {
  id: string
  name: string
  slug: string
  description?: string | null
  role?: string | null
}

interface ActivityPage {
  data: Activity[]
  meta: {
    current_page: number
    last_page: number
    has_more: boolean
  }
}

function relativeTime(value?: string | null) {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return formatDistanceToNow(date, { addSuffix: true })
}

export default function PeopleShow() {
  const { person, stats, projects, activities, can_manage_roles } = usePage<
    SharedData & {
      person: PersonProfile
      stats: { projects: number; tasks: number; activities: number }
      projects: PersonProject[]
      activities: ActivityPage
      can_manage_roles: boolean
    }
  >().props
  const [items, setItems] = useState<Activity[]>(activities?.data ?? [])
  const [page, setPage] = useState(activities?.meta.current_page ?? 1)
  const [hasMore, setHasMore] = useState(activities?.meta.has_more ?? false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

  useEffect(() => {
    setItems(activities?.data ?? [])
    setPage(activities?.meta.current_page ?? 1)
    setHasMore(activities?.meta.has_more ?? false)
  }, [person.id, activities])

  const loadMore = async () => {
    if (!hasMore || isLoadingMore) return

    setIsLoadingMore(true)
    try {
      const { data } = await axios.get<ActivityPage>(route('people.activities', person.id), {
        params: { page: page + 1 },
      })
      setItems((current) => [...current, ...(data.data ?? [])])
      setPage(data.meta.current_page)
      setHasMore(data.meta.has_more)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const copyEmail = async () => {
    await navigator.clipboard.writeText(person.email)
    setCopied(true)
    toast.success('Email copied')
    window.setTimeout(() => setCopied(false), 1500)
  }

  const updateRole = (role: string) => {
    if (role === person.role) return

    router.patch(
      route('people.update', person.id),
      { role },
      {
        preserveScroll: true,
        onSuccess: () => toast.success(`${person.name} is now a ${roleLabel(role)}`),
        onError: () => toast.error('Could not update role'),
      }
    )
  }

  const activityColumns = useMemo<AppTableColumn<Activity>[]>(
    () => [
      {
        id: 'activity',
        header: 'Activity',
        render: (activity) => (
          <span className="line-clamp-2 text-muted-foreground">{activity.description}</span>
        ),
      },
      {
        id: 'subject',
        header: 'On',
        headerClassName: 'w-[180px] hidden md:table-cell',
        cellClassName: 'hidden md:table-cell',
        render: (activity) =>
          activity.subject?.name ? (
            <span className="truncate">{activity.subject.name}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        id: 'project',
        header: 'Project',
        headerClassName: 'w-[160px] hidden lg:table-cell',
        cellClassName: 'hidden lg:table-cell text-muted-foreground',
        render: (activity) =>
          activity.subject?.type === 'project'
            ? activity.subject.name
            : activity.subject?.project?.name ?? '—',
      },
      {
        id: 'when',
        header: 'When',
        headerClassName: 'w-[130px] text-right',
        cellClassName: 'text-right text-muted-foreground whitespace-nowrap',
        render: (activity) => relativeTime(activity.created_at) ?? '—',
      },
    ],
    []
  )

  const projectColumns = useMemo<AppTableColumn<PersonProject>[]>(
    () => [
      {
        id: 'name',
        header: 'Project',
        render: (project) => (
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40">
              <Folder className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium">{project.name}</p>
              <p className="line-clamp-1 text-[12px] text-muted-foreground">
                {project.description || 'No description'}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: 'role',
        header: 'Role',
        headerClassName: 'w-[110px]',
        render: (project) => (
          <RoleBadge role={project.role} />
        ),
      },
    ],
    []
  )

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'People', href: '/people' },
    { title: person.name, href: route('people.show', person.id) },
  ]

  const lastActive = relativeTime(person.last_active_at)

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={person.name} />

      <div className="px-4 py-4 lg:px-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <AppAvatar src={person.avatar} name={person.name} size="lg" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h1 className="text-lg font-semibold tracking-tight">{person.name}</h1>
                {person.is_current_user && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-medium">
                    You
                  </Badge>
                )}
                <RoleBadge role={person.role} />
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[13px] text-muted-foreground">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{person.email}</span>
                <button
                  type="button"
                  onClick={copyEmail}
                  className="inline-flex items-center gap-1 text-[12px] hover:text-foreground"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                {person.joined_at ? `Joined ${formatShortDate(person.joined_at)}` : 'Joined date unavailable'}
                {lastActive ? ` · Last active ${lastActive}` : ' · No activity yet'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {can_manage_roles && (
              <Select value={person.role} onValueChange={updateRole}>
                <SelectTrigger className="h-8 w-[130px] text-[13px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            )}
            {person.is_current_user && (
              <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 px-2.5 text-[13px]">
                <Link href={route('profile.edit')}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit profile
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-2">
          {[
            { label: 'Projects', value: stats.projects },
            { label: 'Assigned tasks', value: stats.tasks },
            { label: 'Activities', value: stats.activities },
          ].map((stat) => (
            <div key={stat.label} className="rounded-md border border-border bg-card px-3 py-2 shadow-sm">
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
              <p className="text-[15px] font-semibold tabular-nums">{stat.value}</p>
            </div>
          ))}
        </div>

        <section className="mb-5">
          <h2 className="mb-2 text-[13px] font-medium">Projects</h2>
          {projects.length === 0 ? (
            <AppEmpty
              title="No projects"
              description={`${person.is_current_user ? 'You are' : `${person.name} is`} not on any projects in this workspace yet.`}
              icon={<Folder className="text-muted-foreground" />}
            />
          ) : (
            <AppTable
              items={projects}
              columns={projectColumns}
              onRowClick={(project) => router.visit(`/projects/${project.slug}`)}
              tableClassName="bg-background/10 shadow-sm rounded-md"
            />
          )}
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-[13px] font-medium">Activity</h2>
            <p className="text-[12px] text-muted-foreground">Click a row for details</p>
          </div>
          {items.length === 0 ? (
            <AppEmpty
              title="No activity yet"
              description="Work in this workspace will show up here."
            />
          ) : (
            <>
              <AppTable
                items={items}
                columns={activityColumns}
                onRowClick={setSelectedActivity}
                tableClassName="bg-background/10 shadow-sm rounded-md"
              />
              {hasMore && (
                <div className="mt-3 flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 text-[13px]"
                    onClick={loadMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? (
                      <>
                        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load more'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <ActivityDetailModal
        open={selectedActivity !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedActivity(null)
        }}
        activity={selectedActivity}
      />
    </AppLayout>
  )
}
