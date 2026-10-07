import { useMemo, useState } from 'react'
import { router, usePage } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, GitBranch, Search, X } from 'lucide-react'
import { SharedData, Task } from '@/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { FIELD_LABEL, FIELD_MENU, FIELD_TRIGGER } from './field-styles'

function unwrapTasks(tasks?: Task[] | { data?: Task[] }) {
  if (!tasks) return []
  return Array.isArray(tasks) ? tasks : (tasks.data ?? [])
}

interface TaskDependenciesProps {
  task: Task
  className?: string
}

export default function TaskDependencies({ task, className = '' }: TaskDependenciesProps) {
  const { tasks } = usePage<SharedData & { tasks?: Task[] | { data?: Task[] } }>().props
  const [search, setSearch] = useState('')

  const candidates = useMemo(
    () =>
      unwrapTasks(tasks).filter(
        (item) =>
          item.id !== task.id &&
          item.parent_task_id !== null &&
          item.title.toLowerCase().includes(search.toLowerCase())
      ),
    [tasks, task.id, search]
  )

  const selected = task.depends_on ?? candidates.find((item) => item.id === task.depends_on_task_id)

  const save = (depends_on_task_id: string | null) => {
    router.patch(
      `/tasks/${task.id}`,
      { depends_on_task_id },
      {
        preserveScroll: true,
        only: ['tasks', 'paginatedTasks'],
        onSuccess: () => toast.success(depends_on_task_id ? 'Dependency added' : 'Dependency removed'),
        onError: () => toast.error('Failed to update dependency'),
      }
    )
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Label className={FIELD_LABEL}>Dependencies</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={FIELD_TRIGGER}>
            <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate text-left">
              {selected?.title ?? 'Add dependency'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className={FIELD_MENU}>
          <div className="border-b px-2 py-2">
            <div className="relative">
              <Search className="absolute top-2 left-2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search tasks"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-8 pl-7 text-[13px]"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {candidates.map((item) => (
              <DropdownMenuItem
                key={item.id}
                className="text-[13px]"
                onSelect={() => save(item.id)}
              >
                {item.title}
              </DropdownMenuItem>
            ))}
            {candidates.length === 0 && (
              <p className="px-2 py-3 text-center text-[12px] text-muted-foreground">No tasks found</p>
            )}
          </div>
          {selected && (
            <div className="border-t">
              <DropdownMenuItem className="text-[13px] text-destructive" onSelect={() => save(null)}>
                <X className="h-3.5 w-3.5" />
                Remove dependency
              </DropdownMenuItem>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
