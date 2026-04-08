import { memo } from 'react'
import { Task } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { taskPrioritySurfaceClasses } from '@/utils/app-utils'
import { cn } from '@/lib/utils'
import AppAvatar from '@/components/app-avatar'
import { CircularProgressChip } from './project-progress'

interface TaskCardDragPreviewProps {
  task: Task
  /** When true, adds floating effect (rotate, shadow) for DragOverlay */
  floating?: boolean
  className?: string
}

const truncate = (s: string, len: number) =>
  s.length > len ? s.slice(0, len).concat('...') : s

export const TaskCardDragPreview = memo(function TaskCardDragPreview({
  task,
  floating = false,
  className,
}: TaskCardDragPreviewProps) {
  return (
    <div
      className={cn(
        'w-[320px]',
        floating && 'rotate-2 shadow-lg'
      )}
    >
      <Card
        className={cn(
          'border-2 border-dashed border-primary/30 bg-card/95 backdrop-blur-sm py-2 gap-2',
          taskPrioritySurfaceClasses(task.priority),
          floating && 'shadow-md',
          className
        )}
      >
        <CardHeader className="px-4 py-2">
          <CardTitle className="text-sm font-medium">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate">{truncate(task.title, 36)}</span>
              <span className="text-xs text-muted-foreground shrink-0">#{task.order}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 px-4 pb-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
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
          <div className="flex items-center justify-between">
            <AppAvatar
              src={task.assigned_to?.profile_picture?.url}
              name={task.assigned_to?.name}
              size="xs"
            />
            <CircularProgressChip percent={task.progress ?? 0} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
})
