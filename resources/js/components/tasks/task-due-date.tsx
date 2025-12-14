import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { Task } from '@/types';
import { router } from '@inertiajs/react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as DatePicker } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { formatDueDate } from '@/utils/task'

interface TaskDueDateProps {
  task: Task;
}

export default function TaskDueDate({ task }: TaskDueDateProps) {

  const handleDateSelect = (date: Date | undefined) => {
    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    router.patch(
      route('tasks.update', { task: task.id }),
      { due_date: date ? formatDate(date) : null },
      {
        preserveScroll: true,
        only: ['tasks'],
      }
    );
  };

  return (
    <Popover modal={true}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="border border-border rounded-md flex items-center gap-2 h-fit p-1.75 w-fit justify-start hover:bg-accent"
        >
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {task.due_date ? (
              <p>
                {formatDueDate(task.due_date)?.text}
              </p>
            ) : (
              <Badge variant="outline" className="text-xs">NA</Badge>
            )}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 m-1 border border-border rounded-lg z-[9999]"
        align="start"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <DatePicker
          mode="single"
          selected={task.due_date ? new Date(task.due_date) : undefined}
          onSelect={handleDateSelect}
          className="w-full rounded-lg gap-2"
        />
      </PopoverContent>
    </Popover>
  );
}

