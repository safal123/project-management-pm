import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ChevronDown, Loader2 } from 'lucide-react'
import { TASK_PRIORITY, type TaskPriority } from '@/constants/task'
import { router } from '@inertiajs/react'
import { Task } from '@/types'
import { formatHumanLabel, PRIORITY_BADGE_COLORS } from '@/utils/app-utils'
import { FIELD_TRIGGER } from './field-styles'
import { cn } from '@/lib/utils'

const OPTIONS = [
  { value: TASK_PRIORITY.LOW, label: 'Low' },
  { value: TASK_PRIORITY.MEDIUM, label: 'Medium' },
  { value: TASK_PRIORITY.HIGH, label: 'High' },
]

interface TaskPriorityProps {
  task: Task
  variant?: 'field' | 'compact'
}

export default function TaskPriority({ task, variant = 'compact' }: TaskPriorityProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handlePriorityChange = (priority: TaskPriority) => {
    if (task.priority === priority) return
    setIsUpdating(true)
    router.patch(
      `/tasks/${task.id}`,
      { priority },
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
            variant === 'field' ? FIELD_TRIGGER : 'h-6 w-fit rounded-md px-2 py-0 text-[11px] font-medium',
            PRIORITY_BADGE_COLORS[task.priority?.toLowerCase() ?? 'medium'] ?? PRIORITY_BADGE_COLORS.medium
          )}
        >
          <span className="min-w-0 flex-1 truncate text-left">
            {formatHumanLabel(task.priority, 'medium')}
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
            onClick={() => handlePriorityChange(option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
