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

    if (props.type === 'column') {
      router.post(
        route('tasks.store'),
        {
          title: 'New Section',
          description: 'New Section Description',
          project_id: project.id,
          parent_task_id: null,
          workspace_id: project.workspace_id,
        },
        {
          preserveScroll: true,
          onSuccess: () => toast.success('New column created'),
          onError: () => toast.error('Failed to create new column'),
          onFinish: () => setIsAdding(false),
        }
      )
    } else {
      router.post(
        route('tasks.store'),
        {
          title: 'New Task',
          description: 'New Task Description',
          project_id: props.column.project_id,
          parent_task_id: props.column.id,
          workspace_id: props.column.workspace_id,
        },
        {
          preserveScroll: true,
          only: ['tasks'],
          onSuccess: () => toast.success('New task added'),
          onError: () => toast.error('Failed to add new task'),
          onFinish: () => setIsAdding(false),
        }
      )
    }
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

  if (props.type === 'column') {
    return (
      <div className="w-[350px] flex-shrink-0 pr-12">
        <Button
          onClick={add}
          disabled={isAdding}
          variant="outline"
          className="dark:bg-primary/5 dark:border-primary/20 text-primary w-full max-h-[120px] flex items-center justify-center gap-2 border-2 border-dashed hover:border-primary/50 hover:bg-accent/5 transition-colors"
        >
          {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
          <span className="text-sm font-medium">{isAdding ? 'Adding...' : 'Add Column'}</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="text-center text-sm">
      <Button
        onClick={add}
        size="sm"
        className={`w-full ${props.type === 'task' && props.className ? props.className : ''}`}
        disabled={isAdding}
      >
        <Plus className="h-4 w-4" />
        {isAdding && <Loader2 className="h-4 w-4 animate-spin" />}
        Add New Task
      </Button>
    </div>
  )
}
