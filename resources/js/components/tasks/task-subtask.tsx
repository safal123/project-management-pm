import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Task } from '@/types';

interface TaskSubtaskProps {
  task: Task;
  className?: string;
}

export default function TaskSubtask({ task, className = '' }: TaskSubtaskProps) {
  const handleAddSubtask = () => {
    // TODO: Implement add subtask functionality
    console.log('Add subtask for task:', task.id);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={`gap-2 mb-6 ${className}`}
      onClick={handleAddSubtask}
    >
      <Plus className="h-4 w-4" />
      Add subtask
    </Button>
  );
}

