import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Task } from '@/types';
import { router } from '@inertiajs/react';

interface TaskDueDateProps {
  task: Task;
  className?: string;
}

export default function TaskDueDate({ task, className = '' }: TaskDueDateProps) {
  const formatDueDate = (date: string | null | undefined) => {
    if (!date) return null;
    const dueDate = new Date(date);
    return dueDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  const handleRemoveDueDate = () => {
    router.patch(`/tasks/${task.id}`, { due_date: null }, { preserveScroll: true });
  };

  const handleAddDueDate = () => {
    // TODO: Implement date picker
    alert('Date picker not yet implemented!');
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Label className="w-24 text-sm text-muted-foreground">Due date</Label>
      {task.due_date ? (
        <div className="flex items-center gap-2 flex-1">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{formatDueDate(task.due_date)}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 ml-auto"
            onClick={handleRemoveDueDate}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddDueDate}
          className="justify-start -ml-2 text-muted-foreground hover:text-foreground"
        >
          Add due date
        </Button>
      )}
    </div>
  );
}

