import React, { memo, useState } from 'react'
import { Task } from '@/types'
import { Button } from '@/components/ui/button'
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
import { getDueDateDisplay } from '@/utils/app-utils'
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
  const due = getDueDateDisplay(task.due_date)

  return (
    <>
      <div
        className={cn(
          'group relative rounded-md border border-neutral-200/90 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors dark:border-white/10 dark:bg-neutral-800',
          'hover:border-neutral-300 hover:shadow-sm dark:hover:border-white/20',
          task.priority === 'high' && 'border-l-2 border-l-neutral-800 dark:border-l-neutral-200',
          isTaskDetailOpen && 'border-neutral-400 ring-1 ring-neutral-300 dark:border-white/30 dark:ring-white/10',
          isDragging && 'opacity-50',
          task.status === 'done' && 'opacity-70'
        )}
      >
        <div className="flex items-start justify-between gap-1 px-2.5 pt-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <MarkTaskAsComplete task={task} type="icon" />
            <button
              type="button"
              className="min-w-0 truncate text-left text-[13px] font-medium leading-5 hover:text-foreground"
              onClick={openTaskDetailSheet}
            >
              {task.title}
            </button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
              >
                <MoreVerticalIcon className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger
                  disabled={availableColumns.length === 0}
                  className={availableColumns.length === 0 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                >
                  <ArrowRightIcon className="mr-2 h-4 w-4" />
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
                  e.preventDefault()
                  e.stopPropagation()
                  openTaskDetailSheet()
                }}
              >
                <Edit2Icon className="mr-2 h-4 w-4" />
                Edit task
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={deleteTask}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-col gap-2 px-2.5 pb-2 pt-1.5">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex min-w-0 items-center gap-1">
              <TaskDueDate task={task} />
              <TaskStatus task={task} />
            </div>
            <TaskPriority task={task} />
          </div>

          {task.media && task.media.length > 0 && (
            <div className="relative h-24 w-full overflow-hidden rounded-md bg-muted">
              <img
                onClick={() => openTaskDetailSheet()}
                src={task.media[0].url}
                alt={task.media[0].original_filename}
                className="h-full w-full cursor-pointer object-cover"
              />
              {task.media.length > 1 && (
                <div className="absolute bottom-1.5 right-1.5 rounded-md bg-background/90 px-1.5 py-0.5 text-[11px] font-medium backdrop-blur-sm">
                  +{task.media.length - 1} more
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <AppAvatar
              src={task.assigned_to?.profile_picture?.url}
              name={task.assigned_to?.name}
              size="sm"
            />
            <AppFileUpload
              workspaceId={task.workspace_id}
              mediableId={task.id}
              mediableType="task"
              className="h-6 w-6 text-muted-foreground"
            />
            <span className="inline-flex items-center gap-0.5 text-[11px]">
              <MessageSquare className="h-3.5 w-3.5" />
              {task.comments_count ?? 0}
            </span>
            <div className="ml-auto flex items-center gap-1.5">
              {due?.isOverdue && (
                <Badge className="bg-destructive px-1.5 py-0 text-[11px] text-destructive-foreground">
                  Overdue
                </Badge>
              )}
              {due?.isToday && !due.isOverdue && (
                <AppTooltip content="The task is due today" side="top">
                  <Badge variant="secondary" className="px-1.5 py-0 text-[11px]">
                    Today
                  </Badge>
                </AppTooltip>
              )}
              <CircularProgressChip percent={task.progress || 0} size={18} />
              <LikeButton
                likeableType="task"
                likeableId={task.id}
                isLiked={!!task.is_liked_by_user}
                likesCount={task.likes_count ?? 0}
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>
      <TaskDetailSheet
        task={task}
        open={isTaskDetailOpen}
        onOpenChange={setIsTaskDetailOpen}
      />
    </>
  )
})
