import { useMemo, useState } from 'react'
import { router, usePage } from '@inertiajs/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronDown, LoaderCircle, Search, UserCheck, X } from 'lucide-react'
import { Project, SharedData, Task } from '@/types'
import { toast } from 'sonner'
import AppAvatar from '@/components/app-avatar'
import { cn } from '@/lib/utils'
import { FIELD_LABEL, FIELD_MENU, FIELD_TRIGGER } from './field-styles'

interface Props {
  task: Task
  className?: string
}

export default function TaskAssignee({ task, className }: Props) {
  const { auth, project } = usePage<SharedData & { project: Project }>().props
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const members = useMemo(() => project.users ?? [], [project.users])
  const filteredMembers = useMemo(
    () =>
      members.filter(
        (user) =>
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
      ),
    [members, search]
  )

  const assign = (assigned_to: string | null) => {
    setLoading(true)
    router.patch(
      `/tasks/${task.id}`,
      { assigned_to },
      {
        preserveScroll: true,
        only: ['tasks', 'paginatedTasks'],
        onSuccess: () => toast.success(assigned_to ? 'Assignee updated' : 'Assignee removed'),
        onError: () => toast.error('Failed to update assignee'),
        onFinish: () => setLoading(false),
      }
    )
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Label className={FIELD_LABEL}>Assignee</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={FIELD_TRIGGER}>
            {loading ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            ) : task.assigned_to ? (
              <AppAvatar
                src={task.assigned_to.profile_picture?.url}
                name={task.assigned_to.name}
                size="xs"
              />
            ) : null}
            <span className="min-w-0 flex-1 truncate text-left">
              {task.assigned_to?.name ?? 'Add assignee'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className={FIELD_MENU}>
          <div className="border-b px-2 py-2">
            <div className="relative">
              <Search className="absolute top-2 left-2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search members"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-8 pl-7 text-[13px]"
              />
            </div>
          </div>
          {task.assigned_to?.id !== auth.user.id && (
            <DropdownMenuItem className="text-[13px]" onSelect={() => assign(auth.user.id)}>
              <UserCheck className="h-3.5 w-3.5" />
              Assign to me
            </DropdownMenuItem>
          )}
          <div className="max-h-48 overflow-y-auto py-1">
            {filteredMembers.map((user) => (
              <DropdownMenuItem
                key={user.id}
                className="text-[13px]"
                onSelect={() => assign(user.id)}
              >
                <AppAvatar src={user.profile_picture?.url} name={user.name} size="xs" />
                <span className="min-w-0 truncate">{user.name}</span>
              </DropdownMenuItem>
            ))}
            {filteredMembers.length === 0 && (
              <p className="px-2 py-3 text-center text-[12px] text-muted-foreground">No members found</p>
            )}
          </div>
          {task.assigned_to && (
            <div className="border-t">
              <DropdownMenuItem className="text-[13px] text-destructive" onSelect={() => assign(null)}>
                <X className="h-3.5 w-3.5" />
                Unassign
              </DropdownMenuItem>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
