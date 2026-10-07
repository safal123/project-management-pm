import { memo } from 'react'
import { Task } from '@/types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import AppAvatar from '@/components/app-avatar'
import { CircularProgressChip } from './project-progress'

interface TaskCardDragPreviewProps {
  task: Task
  /** When true, adds floating effect (rotate, shadow) for DragOverlay */
  floating?: boolean
  className?: string
}

export const TaskCardDragPreview = memo(function TaskCardDragPreview({
  task,
  floating = false,
  className,
}: TaskCardDragPreviewProps) {
  return (
    <div
      className={cn(
        'w-[336px]',
        floating && 'rotate-1'
      )}
    >
      <div
        className={cn(
          'rounded-md border border-neutral-200/90 bg-white px-2.5 py-2 shadow-md dark:border-white/10 dark:bg-neutral-800',
          task.priority === 'high' && 'border-l-2 border-l-neutral-800 dark:border-l-neutral-200',
          className
        )}
      >
        <p className="truncate text-[13px] font-medium">{task.title}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            {task.status && (
              <Badge variant="secondary" className="text-[10px] capitalize">
                {task.status.replace('_', ' ')}
              </Badge>
            )}
            {task.priority && (
              <Badge variant="outline" className="text-[10px] capitalize">
                {task.priority}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <AppAvatar
              src={task.assigned_to?.profile_picture?.url}
              name={task.assigned_to?.name}
              size="xs"
            />
            <CircularProgressChip percent={task.progress ?? 0} />
          </div>
        </div>
      </div>
    </div>
  )
})
