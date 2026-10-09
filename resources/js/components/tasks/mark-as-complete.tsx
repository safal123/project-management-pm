import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Check, CircleX, LoaderCircle } from 'lucide-react'
import { Task } from '@/types'
import { router } from '@inertiajs/react'
import AppTooltip from '../app-tooltip'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface MarkTaskAsCompleteProps {
  task: Task
  type?: 'button' | 'icon'
}

const MarkTaskAsComplete = ({ task, type = 'button' }: MarkTaskAsCompleteProps) => {
  const isCompleted = task.status === 'done';
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleComplete = () => {
    setIsLoading(true);
    router.patch(`/tasks/${task.id}`,
      { status: isCompleted ? 'todo' : 'done' },
      {
        only: ['tasks'],
        preserveScroll: true,
        onSuccess: () => toast.success(`Task ${isCompleted ? 'marked as incomplete' : 'marked as complete'}.`),
        onError: () => toast.error('Failed to mark task as complete'),
        onFinish: () => setIsLoading(false),
      });
  };

  if (type === 'icon') {
    return (
      <AppTooltip
        content={task.status === "done" ? "Mark as incomplete" : "Mark as complete"}
      >
        <div className="flex items-center justify-center">
          {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" /> : (
            <Check
              onClick={handleToggleComplete}
              className={cn("h-4 w-4 cursor-pointer rounded-full p-0.5",
                task.status === "done" ?
                  "bg-muted text-foreground" :
                  "bg-muted/70 text-muted-foreground",
              )}
            />
          )}
        </div>
      </AppTooltip>
    )
  }

  return (
    <Button
      variant={isCompleted ? "default" : "outline"}
      size="sm"
      onClick={handleToggleComplete}
      className="h-6 gap-1 px-2 !text-[11px]"
    >
      {isLoading && <LoaderCircle className="h-3 w-3 animate-spin" />}
      {isCompleted ? <Check className="h-3 w-3" /> : <CircleX className="h-3 w-3" />}
      {isCompleted ? 'Completed' : 'Mark complete'}
    </Button>
  )
}

export default MarkTaskAsComplete
