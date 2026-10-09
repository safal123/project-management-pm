import { useEffect, useMemo, useState } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { formatDistanceToNow } from 'date-fns'
import { ArrowDown, ArrowUp, ArrowUpDown, Clock, Search, X } from 'lucide-react'

import AppAvatar from '@/components/app-avatar'
import AppEmpty from '@/components/app-empty'
import AppLayout from '@/layouts/app-layout'
import { ActivityDetailModal } from '@/components/modals/activity-detail-modal'
import { AppTable, DataTablePaginationRow, DataTableToolbar, type AppTableColumn } from '@/components/app-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { type Activity, type BreadcrumbItem, type PaginatedData, type SharedData } from '@/types'

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Activities', href: '/activity' }]

const TYPE_LABELS: Record<string, string> = {
  created: 'Created',
  status_changed: 'Status changed',
  assigned: 'Assigned',
  moved: 'Moved',
  completed: 'Completed',
  commented: 'Commented',
  liked: 'Liked',
  branch_created: 'Branch created',
  title_changed: 'Title changed',
  due_date_changed: 'Due date changed',
  file_uploaded: 'File uploaded',
  dependency_changed: 'Dependency changed',
  subtask_added: 'Subtask added',
}

const SUBJECT_LABELS: Record<string, string> = {
  task: 'Task',
  project: 'Project',
  event: 'Event',
}

interface ActivityFilters {
  q: string
  type: string
  subject: string
  project_id: string
  user_id: string
  sort: 'created_at' | 'type' | 'user'
  direction: 'asc' | 'desc'
}

interface FilterOptions {
  types: string[]
  subjects: string[]
  projects: { id: string; name: string }[]
  users: { id: string; name: string }[]
}

const DEFAULT_FILTERS: ActivityFilters = {
  q: '',
  type: '',
  subject: '',
  project_id: '',
  user_id: '',
  sort: 'created_at',
  direction: 'desc',
}

function cleanParams(filters: ActivityFilters, page?: number) {
  return Object.fromEntries(
    Object.entries({ ...filters, page }).filter(([, value]) => value !== '' && value !== undefined)
  )
}

function SortableHeader({
  label,
  column,
  filters,
  className,
}: {
  label: string
  column: ActivityFilters['sort']
  filters: ActivityFilters
  className?: string
}) {
  const isActive = filters.sort === column
  const Icon = !isActive ? ArrowUpDown : filters.direction === 'asc' ? ArrowUp : ArrowDown

  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1 hover:text-foreground ${className ?? ''}`}
      onClick={() => {
        const direction = isActive && filters.direction === 'desc' ? 'asc' : 'desc'
        router.get(
          route('activity.index'),
          cleanParams({ ...filters, sort: column, direction }),
          { preserveState: true, preserveScroll: true }
        )
      }}
    >
      {label}
      <Icon className={`h-3 w-3 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`} />
    </button>
  )
}

export default function ActivityIndex() {
  const { activities, filters: rawFilters, filterOptions } = usePage<
    SharedData & {
      activities: PaginatedData<Activity>
      filters?: Partial<ActivityFilters>
      filterOptions?: FilterOptions
    }
  >().props
  const filters: ActivityFilters = { ...DEFAULT_FILTERS, ...rawFilters }
  const options: FilterOptions = filterOptions ?? { types: [], subjects: [], projects: [], users: [] }
  const items = activities?.data ?? []
  const meta = activities?.meta
  const [selected, setSelected] = useState<Activity | null>(null)
  const [search, setSearch] = useState(filters.q)
  const hasActiveFilters = Boolean(filters.q || filters.type || filters.subject || filters.project_id || filters.user_id)

  useEffect(() => {
    setSearch(filters.q)
  }, [filters.q])

  useEffect(() => {
    if (search === filters.q) return

    const timeout = window.setTimeout(() => {
      router.get(
        route('activity.index'),
        cleanParams({ ...filters, q: search }),
        { preserveState: true, preserveScroll: true }
      )
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [search, filters.q, filters.type, filters.subject, filters.project_id, filters.user_id, filters.sort, filters.direction])

  const applyFilter = (key: keyof ActivityFilters, value: string) => {
    router.get(route('activity.index'), cleanParams({ ...filters, [key]: value }), {
      preserveState: true,
      preserveScroll: true,
    })
  }

  const clearFilters = () => {
    setSearch('')
    router.get(route('activity.index'), cleanParams({ ...DEFAULT_FILTERS }), {
      preserveState: true,
      preserveScroll: true,
    })
  }

  const columns = useMemo<AppTableColumn<Activity>[]>(
    () => [
      {
        id: 'user',
        header: <SortableHeader label="Person" column="user" filters={filters} />,
        headerClassName: 'w-[180px]',
        render: (activity) => (
          <div className="flex items-center gap-2">
            <AppAvatar
              src={activity.user?.avatar ?? activity.user?.profile_picture?.url}
              name={activity.user?.name}
              size="xs"
            />
            <span className="truncate font-medium">{activity.user?.name ?? 'Someone'}</span>
          </div>
        ),
      },
      {
        id: 'activity',
        header: <SortableHeader label="Activity" column="type" filters={filters} />,
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
        header: <SortableHeader label="When" column="created_at" filters={filters} className="ml-auto" />,
        headerClassName: 'w-[130px] text-right',
        cellClassName: 'text-right text-muted-foreground whitespace-nowrap',
        render: (activity) => formatDistanceToNow(new Date(activity.created_at), { addSuffix: true }),
      },
    ],
    [filters]
  )

  const goToPage = (page: number) => {
    if (!meta || page < 1 || page > meta.last_page || page === meta.current_page) return

    router.get(route('activity.index'), cleanParams(filters, page), {
      preserveScroll: true,
      preserveState: true,
    })
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Activities" />

      <div className="px-4 py-4 lg:px-6">
        <div className="mb-4">
          <h1 className="text-lg font-semibold tracking-tight">Activities</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Click a row to see details and the related timeline
          </p>
        </div>

        <DataTableToolbar>
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search person or type"
              className="h-8 pl-8 text-[13px]"
            />
          </div>
          <Select value={filters.type || 'all'} onValueChange={(value) => applyFilter('type', value === 'all' ? '' : value)}>
            <SelectTrigger className="h-8 w-[150px] text-[13px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {options.types.map((type) => (
                <SelectItem key={type} value={type}>
                  {TYPE_LABELS[type] ?? type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.subject || 'all'}
            onValueChange={(value) => applyFilter('subject', value === 'all' ? '' : value)}
          >
            <SelectTrigger className="h-8 w-[130px] text-[13px]">
              <SelectValue placeholder="On" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All items</SelectItem>
              {options.subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {SUBJECT_LABELS[subject] ?? subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.project_id || 'all'}
            onValueChange={(value) => applyFilter('project_id', value === 'all' ? '' : value)}
          >
            <SelectTrigger className="h-8 w-[160px] text-[13px]">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {options.projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.user_id || 'all'}
            onValueChange={(value) => applyFilter('user_id', value === 'all' ? '' : value)}
          >
            <SelectTrigger className="h-8 w-[150px] text-[13px]">
              <SelectValue placeholder="Person" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All people</SelectItem>
              {options.users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-[13px]" onClick={clearFilters}>
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </DataTableToolbar>

        {items.length === 0 ? (
          <AppEmpty
            title={hasActiveFilters ? 'No matching activity' : 'No activity yet'}
            description={
              hasActiveFilters
                ? 'Try another search or clear the filters to see more results.'
                : 'Creates, updates, comments, and events in this workspace will show up here.'
            }
            icon={<Clock className="text-muted-foreground" />}
            action={
              hasActiveFilters ? (
                <Button type="button" variant="outline" size="sm" className="h-8 text-[13px]" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <AppTable
            items={items}
            columns={columns}
            onRowClick={(activity) => setSelected(activity)}
            tableClassName="bg-background/10 shadow-sm rounded-md"
            getRowClassName={(activity) => (selected?.id === activity.id ? 'bg-muted/60' : undefined)}
          />
        )}

        {meta && meta.last_page > 1 && (
          <DataTablePaginationRow>
            <p className="text-[13px] text-muted-foreground">
              Showing {meta.from}–{meta.to} of {meta.total}
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-[12px]"
                disabled={meta.current_page <= 1}
                onClick={() => goToPage(meta.current_page - 1)}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-[12px]"
                disabled={meta.current_page >= meta.last_page}
                onClick={() => goToPage(meta.current_page + 1)}
              >
                Next
              </Button>
            </div>
          </DataTablePaginationRow>
        )}
      </div>

      <ActivityDetailModal
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
        activity={selected}
      />
    </AppLayout>
  )
}
