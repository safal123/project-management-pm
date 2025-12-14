import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
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
import TaskSubtask from '../tasks/task-subtask';
import TaskCommentsSection from '../tasks/task-comments-section';
import AppTextEditor from '../app-text-editor';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';
import AppImagePreview from '../app-image-preview';
import AppFileUpload from '../app-file-upload';

interface TaskDetailSheetProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailSheet({ task, open, onOpenChange }: TaskDetailSheetProps) {
  const { project } = usePage<SharedData & { project: Project }>().props;
  const [fullScreen, setFullScreen] = useState(false);

  if (!task) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={true}>
      <SheetContent
        className={cn(
          "[&>button]:hidden p-0 flex flex-col overflow-hidden space-y-0 w-full sm:max-w-4xl",
          fullScreen && "rounded-none border-none bg-background !p-0",
        )}
        style={fullScreen ? {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          maxWidth: 'none',
          transform: 'none',
        } : undefined}
      >
        <SheetTitle className="sr-only">{task.title}</SheetTitle>
        <SheetDescription className="sr-only">
          Task details and information for {task.title}
        </SheetDescription>
        <div className="flex-shrink-0 bg-background border-b px-4 pt-6 pr-8 py-4 flex items-center justify-between">
          <MarkTaskAsComplete task={task} />
          <TaskActions
            task={task}
            onOpenChange={onOpenChange}
            setFullScreen={setFullScreen}
            fullScreen={fullScreen}
          />
        </div>
        <div className="mt-[-16px] px-4 bg-primary/10 border-b border-border py-4 flex items-center  gap-2 text-sm text-muted-foreground">
          <span>This task is visible to everyone in {project.name}.</span>
          <Info className="h-4 w-4" />
        </div>

        <div
          className="flex-1 overflow-y-auto px-6 space-y-6 gap-4"
        >
          <EditableTaskTitle task={task} />
          <TaskAssignee task={task} />
          <div className="flex items-center gap-2">
            <Label className="text-sm w-24">Due Date</Label>
            <TaskDueDate task={task} />
          </div>
          <TaskProject task={task} project={project} />
          <TaskDependencies task={task} />
          <TaskFields task={task} />
          <AppTextEditor task={task} />
          {/* Attachments */}
          <div className="border bg-amber-100/10 dark:bg-primary/10 p-4 rounded-md">
            <Label className="w-24 text-sm">
              <p>Attachements {task.media && task.media.length > 0 && `(${task.media.length})`}</p>
            </Label>
            <div className="flex items-center gap-2 flex-wrap mt-2">
              {task.media && task.media.length > 0 &&
                task.media.map((media) => (
                  <AppImagePreview
                    key={media.id}
                    url={media.url}
                    filename={media.original_filename}
                    createdAt={media.created_at}
                    mediaId={media.id}
                  />
                ))
              }
              <AppFileUpload
                workspaceId={task.workspace_id}
                mediableId={task.id}
                mediableType="task"
                showPlaceholder
              />
            </div>
          </div>
          <TaskSubtask task={task} />
        </div>
        <TaskCommentsSection task={task} />
      </SheetContent>
    </Sheet >
  );
}




