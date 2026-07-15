import React, { memo, useState } from 'react'
import { Task } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Trash2,
  ArrowRightIcon,
  MoreVerticalIcon,
  Edit2Icon,
  MessageSquare,
} from 'lucide-react'
import { TaskDetailSheet } from '../task-detail-sheet'
import TaskDueDate from '@/components/tasks/task-due-date'
import TaskStatus from '@/components/tasks/task-status'
import TaskPriority from '@/components/tasks/task-priority'
import { taskPrioritySurfaceClasses, getDueDateDisplay } from '@/utils/app-utils'
import { cn } from '@/lib/utils'
import { useKanban } from '@/hooks/use-kanban'
import { CircularProgressChip } from '@/components/projects/kanban/project-progress'
import AppTooltip from '@/components/app-tooltip'
import { LikeButton } from '@/components/like-button'
import MarkTaskAsComplete from '@/components/tasks/mark-as-complete'
import AppAvatar from '@/components/app-avatar'
import AppFileUpload from '@/components/app-file-upload'
import { useSortable } from '@dnd-kit/react/sortable'
import { TaskCardDragPreview } from './task-card-drag-preview'

interface KanbanTaskProps {
  task: Task
  columns: Task[]
  index: number
  columnId: string
}

const KanbanTask = memo(({ task, columns, index, columnId }: KanbanTaskProps) => {
  const [element, setElement] = useState<Element | null>(null)
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false)
  const { isDragging } = useSortable({
    id: task.id,
    index,
    group: columnId,
    type: 'task',
    element,
    data: task,
  })
  const { deleteTask, moveTaskToColumn, getAvailableColumns } = useKanban(columns)
  const availableColumns = getAvailableColumns(task)

  if (isDragging) {
    return (
      <div ref={setElement}>
        <TaskCardDragPreview task={task} className="opacity-60" />
      </div>
    )
  }

  return (
    <div ref={setElement}>
      <TaskCard
        task={task}
        isDragging={isDragging}
        isTaskDetailOpen={isTaskDetailOpen}
        setIsTaskDetailOpen={setIsTaskDetailOpen}
        openTaskDetailSheet={() => setIsTaskDetailOpen(true)}
        availableColumns={availableColumns}
        moveTaskToColumn={(columnId) => moveTaskToColumn(task, columnId)}
        deleteTask={() => deleteTask(task)}
      />
    </div>
  )
})

export { KanbanTask }

export const TaskCard = memo(({
  task,
  isDragging,
  isTaskDetailOpen,
  openTaskDetailSheet,
  availableColumns,
  moveTaskToColumn,
  deleteTask,
  setIsTaskDetailOpen
}: { task: Task, isDragging: boolean, isTaskDetailOpen: boolean, openTaskDetailSheet: () => void, availableColumns: Task[], moveTaskToColumn: (columnId: string) => void, deleteTask: () => void, setIsTaskDetailOpen: (isOpen: boolean) => void }) => {
  return (
    <>
      <Card className={cn(
        'bg-card py-2 gap-2 dark:bg-black/40 dark:border-primary/20',
        taskPrioritySurfaceClasses(task.priority),
        isTaskDetailOpen && "bg-primary/10 rounded-md",
        isDragging && "opacity-50",

      )}>
        <CardHeader className="px-4 -pt-12">
          <CardTitle>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 -ml-2">
                <MarkTaskAsComplete task={task} type="icon" />
                <h1
                  className="font-medium cursor-pointer hover:text-primary transition-colors"
                  onClick={openTaskDetailSheet}
                >
                  {task.title.length > 30 ? task.title.slice(0, 30).concat('...') : task.title}
                  <span className="text-xs text-muted-foreground ml-4">
                    #{task.order}
                  </span>
                </h1>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <MoreVerticalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger
                      disabled={availableColumns.length === 0}
                      className={availableColumns.length === 0 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                    >
                      <ArrowRightIcon className="h-4 w-4 mr-2" />
                      Move to
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {availableColumns.map((column) => (
                        <DropdownMenuItem
                          key={column.id}
                          onClick={() => moveTaskToColumn(column.id)}
                        >
                          {column.title}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openTaskDetailSheet();
                    }}>
                    <Edit2Icon className="h-4 w-4 mr-2" />
                    Edit task
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={deleteTask}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className={cn("flex flex-col gap-2 p-0",
          task.status === "done" && "bg-primary/10 opacity-40",
        )}>
          <Separator />
          <div className="px-2 flex items-center justify-between mt-3">
            <div className="flex items-center gap-2 mr-2">
              <TaskDueDate task={task} />
              <TaskStatus task={task} />
            </div>
            <TaskPriority task={task} />
          </div>

          {task.media && task.media.length > 0 && (
            <div className="px-4 mt-3">
              <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted group">
                <img
                  onClick={() => openTaskDetailSheet()}
                  src={task.media[0].url}
                  alt={task.media[0].original_filename}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 border border-border rounded-lg"
                />
                {task.media.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-background/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-md">
                    +{task.media.length - 1} more
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />
          <div className="flex items-center gap-2 px-4">
            <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2">
              <AppAvatar
                src={task.assigned_to?.profile_picture?.url}
                name={task.assigned_to?.name}
                size="sm"
              />
            </div>
            <AppFileUpload
              workspaceId={task.workspace_id}
              mediableId={task.id}
              mediableType="task"
            />
            <MessageSquare className="h-4 w-4 text-muted-foreground hover:fill-primary" />
            <div className="flex items-center gap-2 ml-auto">
              <AppTooltip content="The task is due today" side="top">
                {task.due_date && getDueDateDisplay(task.due_date)?.isToday && (
                  <Badge className="text-xs">Due today</Badge>
                )}
              </AppTooltip>
              {task.due_date && getDueDateDisplay(task.due_date)?.isOverdue && (
                <Badge className="text-xs bg-destructive text-destructive-foreground">Overdue</Badge>
              )}
              <CircularProgressChip percent={task.progress || 0} />
              <LikeButton
                likeableType="task"
                likeableId={task.id}
                isLiked={!!task.is_liked_by_user}
                likesCount={task.likes_count ?? 0}
                size="md"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <TaskDetailSheet
        task={task}
        open={isTaskDetailOpen}
        onOpenChange={setIsTaskDetailOpen}
      />
    </>
  )
})
