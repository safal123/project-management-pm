import React, { useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';
import { Task } from '@/types';

interface TaskDescriptionProps {
  task: Task;
  className?: string;
}

export default function TaskDescription({ task, className = '' }: TaskDescriptionProps) {
  const [description, setDescription] = useState(task.description || '');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDescription(task.description || '');
  }, [task.description]);

  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    if (description !== task.description) {
      saveTimeoutRef.current = setTimeout(() => {
        router.patch(`/tasks/${task.id}`, { description }, { preserveScroll: true });
      }, 1000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [description, task.id, task.description]);

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium">Description</Label>
      <Textarea
        placeholder="What is this task about?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={8}
        className="resize-none text-sm mt-2"
      />
    </div>
  );
}
