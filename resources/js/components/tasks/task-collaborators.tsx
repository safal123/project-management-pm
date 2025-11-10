import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { SharedData, Task } from '@/types';

interface TaskCollaboratorsProps {
  task: Task;
  className?: string;
}

export default function TaskCollaborators({ task, className = '' }: TaskCollaboratorsProps) {
  const { auth } = usePage<SharedData>().props;

  const handleAddCollaborator = () => {
    // TODO: Implement add collaborator functionality
    console.log('Add collaborator for task:', task.id);
  };

  const handleLeaveTask = () => {
    // TODO: Implement leave task functionality
    console.log('Leave task:', task.id);
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Collaborators</span>
        <div className="flex -space-x-2">
          <Avatar className="h-6 w-6 border-2 border-background">
            <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
            <AvatarFallback className="text-xs">
              {auth.user.name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {task.assigned_to && task.assigned_to.id !== auth.user.id && (
            <Avatar className="h-6 w-6 border-2 border-background">
              <AvatarImage src={task.assigned_to.avatar} alt={task.assigned_to.name} />
              <AvatarFallback className="text-xs">
                {task.assigned_to.name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full"
            onClick={handleAddCollaborator}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-sm text-muted-foreground hover:text-destructive"
        onClick={handleLeaveTask}
      >
        Leave task
      </Button>
    </div>
  );
}

