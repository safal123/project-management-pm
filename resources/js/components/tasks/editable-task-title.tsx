import { useCallback, useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

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
  childTasksCount = 0,
  variant = 'default',
}: EditableTaskTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(task.title);
  }, [task.title]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const textClass = cn(
    'rounded-md font-medium leading-tight transition-colors',
    variant === 'default' ? 'text-[15px]' : 'text-[13px]'
  );

  const cancelEditing = useCallback(() => {
    setTitle(task.title);
    setIsEditing(false);
  }, [task.title]);

  const saveTitle = useCallback(() => {
    if (isSubmitting) return;

    const nextTitle = title.trim();

    if (!nextTitle || nextTitle === task.title) {
      cancelEditing();
      return;
    }

    setIsSubmitting(true);

    router.patch(
      `/tasks/${task.id}`,
      { title: nextTitle },
      {
        preserveScroll: true,
        preserveState: true,
        only: ['tasks', 'paginatedTasks'],

        onSuccess: () => {
          toast.success('Task title updated');
          setIsEditing(false);
        },

        onError: () => {
          toast.error('Failed to update task title');
          setTitle(task.title);
        },

        onFinish: () => {
          setIsSubmitting(false);
        },
      }
    );
  }, [cancelEditing, isSubmitting, task.id, task.title, title]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case 'Enter':
          saveTitle();
          break;

        case 'Escape':
          cancelEditing();
          break;
      }
    },
    [saveTitle, cancelEditing]
  );

  return (
    <div className={cn('flex-1', className)}>
      {isEditing ? (
        <input
          id={`task-title-${task.id}`}
          ref={inputRef}
          disabled={isSubmitting}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={handleKeyDown}
          className={cn(
            textClass,
            'w-full px-1.5 py-1 focus:outline-none',
            variant === 'small' && 'px-1 py-0.5'
          )}
        />
      ) : (
        <h2
          role="button"
          tabIndex={0}
          className={cn(
            textClass,
            'cursor-pointer px-1.5 py-1 hover:bg-muted/50',
            variant === 'small' && 'px-1 py-0.5'
          )}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setIsEditing(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsEditing(true);
            }
          }}
        >
          {title}

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
