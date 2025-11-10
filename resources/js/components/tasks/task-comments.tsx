import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { usePage } from '@inertiajs/react';
import { SharedData, Task } from '@/types';

interface TaskCommentsProps {
  task: Task;
  className?: string;
}

export default function TaskComments({ task, className = '' }: TaskCommentsProps) {
  const { auth } = usePage<SharedData>().props;

  const handleAddComment = () => {
    // TODO: Implement add comment functionality
    console.log('Add comment for task:', task.id);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
          <AvatarFallback className="text-xs">
            {auth.user.name?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <Textarea
          placeholder="Add a comment"
          className="resize-none text-sm min-h-[60px] flex-1"
          rows={2}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAddComment();
            }
          }}
        />
      </div>
    </div>
  );
}
