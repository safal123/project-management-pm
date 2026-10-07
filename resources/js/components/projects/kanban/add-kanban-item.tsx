import { useState } from 'react'
import { router, usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Plus, Loader2 } from 'lucide-react'
import { Project, SharedData, Task } from '@/types'
import { cn } from '@/lib/utils'

interface AddColumnProps {
  type: 'column'
}

interface AddTaskProps {
  type: 'task'
  column: Task
  variant?: 'button' | 'dropdown'
  className?: string
}

type AddKanbanItemProps = AddColumnProps | AddTaskProps

export function AddKanbanItem(props: AddKanbanItemProps) {
  const [isAdding, setIsAdding] = useState(false)

  const { project } = usePage<SharedData & { project: Project }>().props

  const add = () => {
    setIsAdding(true)
    const isColumn = props.type === 'column'
    const payload = {
      title: isColumn ? 'New Section' : 'New Task',
      description: isColumn
        ? 'New Section Description'
        : 'New Task Description',
      project_id: isColumn ? project.id : props.column.project_id,
      parent_task_id: isColumn ? null : props.column.id,
      workspace_id: isColumn
        ? project.workspace_id
        : props.column.workspace_id,
    }

    router.post(route('tasks.store'), payload, {
      preserveScroll: true,
      only: ['tasks', 'paginatedTasks'],
      onSuccess: () => {
        toast.success(isColumn ? 'New column created' : 'New task added')
      },
      onError: () =>
        toast.error(
          isColumn ? 'Failed to create new column' : 'Failed to add new task'
        ),
      onFinish: () => setIsAdding(false),
    })
  }

  if (props.type === 'task' && props.variant === 'dropdown') {
    return (
      <DropdownMenuItem
        onClick={add}
        disabled={isAdding}
        className="mb-1 cursor-pointer text-[13px] font-medium"
      >
        {isAdding ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Plus className="mr-2 h-3.5 w-3.5" />}
        Add task
      </DropdownMenuItem>
    )
  }

  const isColumn = props.type === 'column'

  return (
    <div className={cn(isColumn && 'w-[360px] shrink-0')}>
      <Button
        onClick={add}
        disabled={isAdding}
        variant="outline"
        className="h-8 w-full gap-1.5 border-dashed border-neutral-300 bg-transparent text-[13px] text-muted-foreground hover:border-neutral-400 hover:bg-white/60 hover:text-foreground dark:border-white/15 dark:hover:bg-white/5"
      >
        {isAdding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
        <span>{isAdding ? 'Adding…' : isColumn ? 'Add column' : 'Add task'}</span>
      </Button>
    </div>
  )
}
