import { useState } from 'react'
import { router, usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Plus, Loader2 } from 'lucide-react'
import { Project, SharedData, Task } from '@/types'

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
        className="font-medium cursor-pointer bg-primary/10 mb-1 hover:bg-primary/20 dark:hover:bg-primary/20"
      >
        {isAdding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
        Add New Task
      </DropdownMenuItem>
    )
  }

  return (
    <div className="max-w-[350px] w-fit flex-shrink-0 pr-12">
      <Button
        onClick={add}
        disabled={isAdding}
        variant="outline"
        className="dark:bg-black/40 dark:border-primary/20 text-primary w-full max-h-[120px] flex items-center justify-center gap-2 border-2 border-dashed hover:border-primary/50 hover:bg-accent/5 transition-colors"
      >
        {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
        <span className="text-sm font-medium">{isAdding ? 'Adding...' : 'Add Column'}</span>
      </Button>
    </div>
  )
}
