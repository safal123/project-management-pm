import React, { useState } from 'react';
import { Task } from '@/types';
import { router } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface EditableTaskTitleProps {
  task: Task;
  className?: string;
  childTasksCount?: number;
  variant?: 'default' | 'small';
}

export default function EditableTaskTitle({ task, className = '', variant = 'default', childTasksCount = 0 }: EditableTaskTitleProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateTitle = async () => {
    const trimmed = title.trim();
    if (!trimmed || trimmed === task.title) {
      setIsEditingTitle(false);
      return;
    }

    setIsSaving(true);

    router.patch(
      `/tasks/${task.id}`,
      { title: trimmed },
      {
        preserveScroll: true,
        preserveState: true,
        only: ['tasks'],
        onSuccess: () => setIsSaving(false),
        onFinish: () => setIsEditingTitle(false),
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleUpdateTitle();
    else if (e.key === 'Escape') setIsEditingTitle(false);
  };

  return (
    <div className={cn(className, 'flex-1')}>
      {isEditingTitle ? (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleUpdateTitle}
          onKeyDown={handleKeyDown}
          autoFocus
          disabled={isSaving}
          className={cn(
            'w-full text-2xl leading-tight font-semibold bg-transparent border border-border outline-none focus:ring-0 px-3 py-3 -mx-3 rounded-lg hover:bg-muted/50 transition-all duration-100',
            variant === 'small' && 'text-sm'
          )}
          style={{ boxShadow: 'none' }}
        />
      ) : (
        <div className="flex items-center gap-2 -ml-1">
          <h2
            className={cn(
              'text-2xl leading-tight font-semibold cursor-pointer hover:bg-muted/50 rounded-lg p-3 -mx-3 transition-colors',
              variant === 'small' && 'text-sm'
            )}
            onClick={() => setIsEditingTitle(true)}
          >
            {title} {childTasksCount > 0 && `(${childTasksCount})`}
          </h2>
        </div>
      )}
    </div>
  );
}
