import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ChevronDown, Loader2 } from 'lucide-react'
import { TASK_STATUS, type TaskStatus } from '@/constants/task'
import { router } from '@inertiajs/react'
import { Task } from '@/types'
import { formatHumanLabel, taskStatusSurfaceClasses } from '@/utils/app-utils'
import { FIELD_TRIGGER } from './field-styles'
import { cn } from '@/lib/utils'

const OPTIONS = [
  { value: TASK_STATUS.TODO, label: 'To do' },
  { value: TASK_STATUS.IN_PROGRESS, label: 'In progress' },
  { value: TASK_STATUS.DONE, label: 'Done' },
]

interface TaskStatusProps {
  task: Task
  variant?: 'field' | 'compact'
}

export default function TaskStatus({ task, variant = 'compact' }: TaskStatusProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = (status: TaskStatus) => {
    setIsUpdating(true)
    router.patch(
      `/tasks/${task.id}`,
      { status },
      {
        preserveScroll: true,
        only: ['tasks', 'paginatedTasks'],
        onFinish: () => setIsUpdating(false),
      }
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isUpdating}
          className={cn(
            variant === 'field' ? FIELD_TRIGGER : 'h-6 w-fit rounded-md border px-2 py-0 text-[11px] font-medium',
            taskStatusSurfaceClasses(task.status)
          )}
        >
          <span className="min-w-0 flex-1 truncate text-left">
            {formatHumanLabel(task.status, 'todo')}
          </span>
          {isUpdating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="z-[9999] w-44 text-[13px]">
        {OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            className="text-[13px]"
            onClick={() => handleStatusChange(option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
