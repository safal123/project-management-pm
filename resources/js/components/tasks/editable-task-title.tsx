import React, { useCallback, useState } from 'react';
import { router } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Task } from '@/types';

interface EditableTaskTitleProps {
  task: Task;
  className?: string;
  childTasksCount?: number;
  variant?: 'default' | 'small';
}

export default function EditableTaskTitle({
  task,
  className,
  variant = 'default',
  childTasksCount = 0,
}: EditableTaskTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(task.title);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const baseTextClass = cn(
    'leading-tight font-semibold rounded-lg transition-colors',
    variant === 'default' ? 'text-2xl' : 'text-sm'
  );

  const handleSubmit = useCallback(() => {
    const nextTitle = value.trim();

    if (!nextTitle || nextTitle === task.title) {
      setValue(task.title);
      setIsEditing(false);
      return;
    }

    setIsSubmitting(true);

    router.patch(
      `/tasks/${task.id}`,
      { title: nextTitle },
      {
        preserveScroll: true,
        preserveState: true,
        only: ['tasks'],
        onFinish: () => {
          setIsSubmitting(false);
          setIsEditing(false);
        },
      }
    );
  }, [value, task.id, task.title]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleSubmit();
      if (e.key === 'Escape') {
        setValue(task.title);
        setIsEditing(false);
      }
    },
    [handleSubmit, task.title]
  );

  return (
    <div className={cn('flex-1', className)}>
      {isEditing ? (
        <input
          autoFocus
          disabled={isSubmitting}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={handleKeyDown}
          className={cn(
            baseTextClass,
            'w-full px-3 py-3 -mx-3 focus:outline-none'
          )}
        />
      ) : (
        <h2
          role="button"
          tabIndex={0}
          className={cn(
            baseTextClass,
            'cursor-pointer px-3 py-3 -ml-3 hover:bg-muted/50'
          )}
          onClick={() => setIsEditing(true)}
        >
          {value}
          {childTasksCount > 0 && (
            <span className="ml-1 text-muted-foreground">
              ({childTasksCount})
            </span>
          )}
        </h2>
      )}
    </div>
  );
}
