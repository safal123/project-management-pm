import React from 'react'
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
  PaperclipIcon,
  Trash2,
  ArrowRightIcon,
  MoreVerticalIcon,
  Edit2Icon,
  MessageSquare,
  ThumbsUp,
} from 'lucide-react'
import { TaskDetailSheet } from '../task-detail-sheet'
import TaskDueDate from '@/components/tasks/task-due-date'
import TaskStatus from '@/components/tasks/task-status'
import TaskPriority from '@/components/tasks/task-priority'
import { getPriorityColors } from '@/utils/task-colors'
import { formatDueDate } from '@/utils/task'
import { cn } from '@/lib/utils'
import { useKanbanTask } from '@/hooks/use-kanban'
import { CircularProgressChip } from '@/components/projects/kanban/project-progress'
import AppTooltip from '@/components/app-tooltip'
import MarkTaskAsComplete from '@/components/tasks/mark-as-complete'
import AppAvatar from '@/components/app-avatar'

interface KanbanTaskProps {
  task: Task
  columns: Task[]
}

export const KanbanTask = ({ task, columns }: KanbanTaskProps) => {
  const {
    isTaskDetailOpen,
    setIsTaskDetailOpen,
    deleteTask,
    moveTaskToColumn,
    openTaskDetailSheet,
    availableColumns,
  } = useKanbanTask(task, columns)

  return (
    <>
      <Card className={cn(
        'bg-background py-2 gap-2',
        getPriorityColors(task.priority),
        isTaskDetailOpen && "bg-primary/10 rounded-md",
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
                    <DropdownMenuSubTrigger>
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
                    onClick={deleteTask}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete task
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openTaskDetailSheet();
                    }}>
                    <Edit2Icon className="h-4 w-4 mr-2" />
                    Edit task
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
          <div className="px-4 flex items-center justify-between mt-3">
            <TaskDueDate task={task} />
            <TaskStatus task={task} />
            <TaskPriority task={task} />
          </div>
          <div className="flex items-center justify-between px-4 mt-3">
            <div className="flex items-center gap-2">
              <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2">
                <AppAvatar
                  src={task.assigned_to?.profile_picture?.url}
                  name={task.assigned_to?.name}
                  size="sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AppTooltip content="The task is due today" side="top">
                {task.due_date && formatDueDate(task.due_date)?.isToday && (
                  <Badge className="text-xs">Due today</Badge>
                )}
              </AppTooltip>
              {task.due_date && formatDueDate(task.due_date)?.isOverdue && (
                <Badge className="text-xs bg-destructive text-destructive-foreground">Overdue</Badge>
              )}
              <CircularProgressChip percent={task.progress || 0} />
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-2 px-4">
            <AppTooltip content={`${task.media && task.media.length > 0 ? task.media.length : 0} attachments`} side="top">
              <PaperclipIcon
                className={cn("h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer",
                  task.media && task.media.length > 0 && "text-primary")}
              />
            </AppTooltip>
            <MessageSquare className="h-4 w-4 text-muted-foreground hover:fill-primary" />
            <ThumbsUp className="h-4 ml-auto w-4 text-muted-foreground hover:text-primary cursor-pointer" />
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
}

