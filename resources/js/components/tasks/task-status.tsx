import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { TASK_STATUS, type TaskStatus } from '@/constants/task';
import { router } from '@inertiajs/react';
import { Task } from '@/types';
import { getStatusColors } from '@/utils/task-colors';

interface TaskStatusProps {
  task: Task;
  className?: string;
}

export default function TaskStatus({ task }: TaskStatusProps) {
  const handleStatusChange = (status: TaskStatus) => {
    router.patch(`/tasks/${task.id}`, { status }, { preserveScroll: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`w-fit p-0 px-3 py-1 rounded-md text-xs font-medium hover:opacity-80 ${getStatusColors(task.status)}`}
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
  );
}
