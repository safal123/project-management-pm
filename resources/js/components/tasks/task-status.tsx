import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { TASK_STATUS, type TaskStatus } from '@/constants/task';
import { router } from '@inertiajs/react';
import { Task } from '@/types';

interface TaskStatusProps {
  task: Task;
  className?: string;
}

export function getStatusColor(status: string | null | undefined) {
  switch (status?.toLowerCase()) {
    case 'todo':
      return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    case 'in_progress':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
    case 'done':
      return 'bg-green-500/10 text-green-700 dark:text-green-400';
    default:
      return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
  }
}

export default function TaskStatus({ task, className = '' }: TaskStatusProps) {
  const handleStatusChange = (status: TaskStatus) => {
    router.patch(`/tasks/${task.id}`, { status }, { preserveScroll: true });
  };

  return (
    <div className={`flex items-center gap-3 p-3 border rounded-lg ${className}`}>
      <AlertCircle className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1">
        <div className="text-xs text-muted-foreground mb-1">Status</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`h-auto p-0 px-3 py-1 rounded-md text-xs font-medium hover:opacity-80 ${getStatusColor(task.status)}`}
            >
              {task.status || 'To do'}
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => handleStatusChange(TASK_STATUS.TODO)}>To do</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange(TASK_STATUS.IN_PROGRESS)}>In progress</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange(TASK_STATUS.DONE)}>Done</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
