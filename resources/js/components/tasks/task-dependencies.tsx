import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Task } from '@/types';

interface TaskDependenciesProps {
  task: Task;
  className?: string;
}

export default function TaskDependencies({ task, className = '' }: TaskDependenciesProps) {
  const handleAddDependencies = () => {
    // TODO: Implement add dependencies functionality
    console.log('Add dependencies for task:', task.id);
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Label className="w-24 text-sm text-muted-foreground">Dependencies</Label>
      <Button
        variant="outline"
        size="sm"
        className="justify-start -ml-1 text-muted-foreground hover:text-foreground"
        onClick={handleAddDependencies}
      >
        Add dependencies
      </Button>
    </div>
  );
}
