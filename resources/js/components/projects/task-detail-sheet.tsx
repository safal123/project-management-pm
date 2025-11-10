import React from 'react';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import { Info } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { SharedData, Task, Project } from '@/types';
import MarkTaskAsComplete from '../tasks/mark-as-complete';
import TaskActions from '../tasks/task-actions';
import EditableTaskTitle from '../tasks/editable-task-title';
import TaskAssignee from '../tasks/task-assignee';
import TaskDueDate from '../tasks/task-due-date';
import TaskProject from '../tasks/task-project';
import TaskFields from '../tasks/task-fields';
import TaskDependencies from '../tasks/task-dependencies';
import TaskDescription from '../tasks/task-description';
import TaskSubtask from '../tasks/task-subtask';
import TaskCommentsSection from '../tasks/task-comments-section';

interface TaskDetailSheetProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailSheet({ task, open, onOpenChange }: TaskDetailSheetProps) {
  const { project } = usePage<SharedData & { project: Project }>().props;

  if (!task) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-4xl p-0 flex flex-col overflow-hidden space-y-0">
        <div className="flex-shrink-0 bg-background border-b px-4 pt-6 pr-8 py-4 flex items-center justify-between">
          <MarkTaskAsComplete task={task} />
          <TaskActions task={task} onOpenChange={onOpenChange} />
        </div>
        <div className="mt-[-16px] px-4 bg-primary/10 border-b border-border py-4 flex items-center  gap-2 text-sm text-muted-foreground">
          <span>This task is visible to everyone in {project.name}.</span>
          <Info className="h-4 w-4" />
        </div>

        <div className="flex-1 overflow-y-auto px-6 space-y-6">
          <EditableTaskTitle task={task} />
          <TaskAssignee task={task} />
          <TaskDueDate task={task} />
          <TaskProject task={task} project={project} />
          <TaskDependencies task={task} />
          <TaskFields task={task} />
          <TaskDescription task={task} />
          <TaskSubtask task={task} />
        </div>
        <TaskCommentsSection task={task} />
      </SheetContent>
    </Sheet>
  );
}

