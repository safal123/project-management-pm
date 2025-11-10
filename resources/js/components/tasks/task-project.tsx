import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, X } from 'lucide-react';
import { Task, Project } from '@/types';

interface TaskProjectProps {
  task: Task;
  project: Project;
  className?: string;
}

export default function TaskProject({ task, project, className = '' }: TaskProjectProps) {
  const handleStatusChange = (status: string) => {
    // TODO: Implement status update
    console.log('Status changed to:', status);
  };

  const handleRemoveProject = () => {
    // TODO: Implement project removal
    console.log('Remove project');
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Label className="w-24 text-sm text-muted-foreground">Project</Label>
      <div className="flex items-center gap-2 flex-1">
        <div className="h-2 w-2 rounded-full bg-cyan-500" />
        <span className="text-sm">{project.name}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 ml-auto"
          onClick={handleRemoveProject}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
