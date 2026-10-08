import { useEffect, useMemo, useState } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { Search, Users } from 'lucide-react'

import AppAvatar from '@/components/app-avatar'
import AppEmpty from '@/components/app-empty'
import AppLayout from '@/layouts/app-layout'
import { AddWorkspaceMemberModal } from '@/components/modals/add-workspace-member-modal'
import { WorkspaceInviteModal } from '@/components/modals/workspace-invite-modal'
import { AppTable, DataTableToolbar, type AppTableColumn } from '@/components/app-table'
import { RoleBadge } from '@/components/role-badge'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatShortDate } from '@/utils/app-utils'
import { type BreadcrumbItem, type SharedData } from '@/types'

const breadcrumbs: BreadcrumbItem[] = [{ title: 'People', href: '/people' }]

interface PersonRow {
  id: string
  name: string
  email: string
  avatar?: string | null
  role: 'owner' | 'admin' | 'member'
  project_count: number
  activity_count: number
  joined_at?: string | null
  is_current_user: boolean
}

export default function PeopleIndex() {
  const { people, filters } = usePage<
    SharedData & { people: PersonRow[]; filters?: { q?: string } }
  >().props
  const [search, setSearch] = useState(filters?.q ?? '')

  useEffect(() => {
    setSearch(filters?.q ?? '')
  }, [filters?.q])

  useEffect(() => {
    if (search === (filters?.q ?? '')) return

    const timeout = window.setTimeout(() => {
      router.get(
        route('people.index'),
        search ? { q: search } : {},
        { preserveState: true, preserveScroll: true }
      )
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [search, filters?.q])

  const columns = useMemo<AppTableColumn<PersonRow>[]>(
    () => [
      {
        id: 'name',
        header: 'Person',
        headerClassName: 'min-w-[220px]',
        render: (person) => (
          <div className="flex items-center gap-2.5">
            <AppAvatar src={person.avatar} name={person.name} size="xs" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate font-medium">{person.name}</span>
                {person.is_current_user && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-medium">
                    You
                  </Badge>
                )}
              </div>
              <p className="truncate text-[12px] text-muted-foreground md:hidden">{person.email}</p>
            </div>
          </div>
        ),
      },
      {
        id: 'email',
        header: 'Email',
        headerClassName: 'hidden md:table-cell',
        cellClassName: 'hidden md:table-cell text-muted-foreground',
        render: (person) => <span className="truncate">{person.email}</span>,
      },
      {
        id: 'role',
        header: 'Role',
        headerClassName: 'w-[100px]',
        render: (person) => <RoleBadge role={person.role} />,
      },
      {
        id: 'projects',
        header: 'Projects',
        headerClassName: 'w-[90px]',
        cellClassName: 'tabular-nums text-muted-foreground',
        render: (person) => person.project_count,
      },
      {
        id: 'activity',
        header: 'Activity',
        headerClassName: 'w-[90px]',
        cellClassName: 'tabular-nums text-muted-foreground',
        render: (person) => person.activity_count,
      },
      {
        id: 'joined',
        header: 'Joined',
        headerClassName: 'w-[120px] hidden lg:table-cell',
        cellClassName: 'hidden lg:table-cell whitespace-nowrap text-muted-foreground',
        render: (person) => (person.joined_at ? formatShortDate(person.joined_at) : '—'),
      },
    ],
    []
  )

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="People" />

      <div className="px-4 py-4 lg:px-6">
        <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">People</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              Everyone with access to this workspace
            </p>
          </div>
          <div className="flex w-full items-center gap-1.5 sm:w-auto">
            <AddWorkspaceMemberModal />
            <WorkspaceInviteModal />
          </div>
        </div>

        <DataTableToolbar>
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or email"
              className="h-8 pl-8 text-[13px]"
            />
          </div>
        </DataTableToolbar>

        {people.length === 0 ? (
          <AppEmpty
            title={search ? 'No matching people' : 'No people yet'}
            description={
              search
                ? 'Try a different name or email.'
                : 'Invite teammates to this workspace to see them here.'
            }
            icon={<Users className="text-muted-foreground" />}
            action={!search ? <WorkspaceInviteModal /> : undefined}
          />
        ) : (
          <AppTable
            items={people}
            columns={columns}
            onRowClick={(person) => router.visit(route('people.show', person.id))}
            tableClassName="bg-background/10 shadow-sm rounded-md"
          />
        )}
      </div>
    </AppLayout>
  )
}
