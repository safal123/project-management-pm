import React from 'react';
import { Label } from '@/components/ui/label';
import { Task } from '@/types';
import TaskPriority from './task-priority';
import TaskStatus from './task-status';

interface TaskFieldsProps {
  task: Task;
  className?: string;
}

export default function TaskFields({ task, className = '' }: TaskFieldsProps) {
  return (
    <div className={className}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Label className="text-sm w-24">Priority</Label>
          <TaskPriority task={task} />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm mb-3 block w-24">Status</Label>
          <TaskStatus task={task} />
        </div>
      </div>
    </div>
  );
}
