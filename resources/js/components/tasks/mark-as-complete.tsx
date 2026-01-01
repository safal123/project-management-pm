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
          {isLoading ? <LoaderCircle className="h-6 w-6 animate-spin border rounded-full border-primary w-fit" /> : (
            <Check
              onClick={handleToggleComplete}
              className={cn("h-6 w-6 bg-primary/10 rounded-full p-1 cursor-pointer",
                task.status === "done" ?
                  "text-green-500 border border-green-500 bg-green-500/10" :
                  "text-gray-500 bg-gray-500/10",
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
      className="gap-2"
    >
      {isLoading && <LoaderCircle className="h-4 w-4 animate-spin" />}
      {isCompleted ? <Check className="h-4 w-4" /> : <CircleX className="h-4 w-4" />}
      {isCompleted ? 'Completed' : 'Mark complete'}
    </Button>
  )
}

export default MarkTaskAsComplete
