import React from 'react'
import { Button } from '../ui/button'
import { Check, CircleX } from 'lucide-react'
import { Task } from '@/types'
import { router } from '@inertiajs/react'

const MarkTaskAsComplete = ({ task }: { task: Task }) => {
  const isCompleted = task.status === 'done';

  const handleToggleComplete = () => {
    router.patch(`/tasks/${task.id}`, { status: isCompleted ? 'todo' : 'done' }, { preserveScroll: true });
  };

  return (
    <Button
      variant={isCompleted ? "default" : "outline"}
      size="sm"
      onClick={handleToggleComplete}
      className="gap-2"
    >
      {isCompleted ? <Check className="h-4 w-4" /> : <CircleX className="h-4 w-4" />}
      {isCompleted ? 'Completed' : 'Mark complete'}
    </Button>
  )
}

export default MarkTaskAsComplete
