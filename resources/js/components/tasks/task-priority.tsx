import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, Target } from 'lucide-react';
import { TASK_PRIORITY, type TaskPriority } from '@/constants/task';
import { router } from '@inertiajs/react';
import { Task } from '@/types';

interface TaskPriorityProps {
  task: Task;
  className?: string;
}

export function getPriorityColor(priority: string | null | undefined) {
  switch (priority?.toLowerCase()) {
    case 'low':
      return 'bg-green-500/10 text-green-700 dark:text-green-400';
    case 'medium':
      return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
    case 'high':
      return 'bg-red-500/10 text-red-700 dark:text-red-400';
    default:
      return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
  }
}

export default function TaskPriority({ task, className = '' }: TaskPriorityProps) {
  const handlePriorityChange = (priority: TaskPriority) => {
    router.patch(`/tasks/${task.id}`, { priority }, { preserveScroll: true });
  };

  return (
    <div className={`flex items-center gap-3 p-3 border rounded-lg ${className}`}>
      <Target className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1">
        <div className="text-xs text-muted-foreground mb-1">Priority</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`h-auto p-0 px-3 py-1 rounded-md text-xs font-medium hover:opacity-80 ${getPriorityColor(task.priority)}`}
            >
              {task.priority || 'Medium'}
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => handlePriorityChange(TASK_PRIORITY.LOW)}>Low</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePriorityChange(TASK_PRIORITY.MEDIUM)}>Medium</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePriorityChange(TASK_PRIORITY.HIGH)}>High</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
