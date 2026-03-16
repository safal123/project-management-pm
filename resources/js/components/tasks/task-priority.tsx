import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, Loader2 } from 'lucide-react';
import { TASK_PRIORITY, type TaskPriority } from '@/constants/task';
import { router } from '@inertiajs/react';
import { Task } from '@/types';
import { PRIORITY_BADGE_COLORS } from '@/utils/task-colors';

interface TaskPriorityProps {
  task: Task;
}

export default function TaskPriority({ task }: TaskPriorityProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePriorityChange = (priority: TaskPriority) => {
    setIsUpdating(true);
    router.patch(
      `/tasks/${task.id}`,
      { priority },
      {
        preserveScroll: true,
        onFinish: () => {
          setIsUpdating(false);
        },
      }
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isUpdating}
          className={`w-fit p-0 px-3 py-1 rounded-md text-xs font-medium hover:opacity-80 ${PRIORITY_BADGE_COLORS[task.priority?.toLowerCase() ?? 'medium'] ?? PRIORITY_BADGE_COLORS.medium}`}
        >
          {task.priority || 'Medium'}
          {isUpdating ? (
            <Loader2 className="h-3 w-3 ml-1 animate-spin" />
          ) : (
            <ChevronDown className="h-3 w-3 ml-1" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => handlePriorityChange(TASK_PRIORITY.LOW)}>Low</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handlePriorityChange(TASK_PRIORITY.MEDIUM)}>Medium</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handlePriorityChange(TASK_PRIORITY.HIGH)}>High</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
