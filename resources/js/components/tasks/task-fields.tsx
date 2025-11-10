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
      <Label className="text-sm font-medium mb-3 block">Fields</Label>
      <div className="grid grid-cols-2 gap-4">
        <TaskPriority task={task} />
        <TaskStatus task={task} />
      </div>
    </div>
  );
}
