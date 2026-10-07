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
import { Separator } from '../ui/separator';

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
          '[&>button]:hidden flex w-full flex-col gap-0 space-y-0 overflow-hidden bg-background p-0 text-[13px] sm:max-w-3xl',
          fullScreen && 'rounded-none border border-border',
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
        <div className="flex h-11 shrink-0 items-center justify-between border-b bg-muted/20 px-3">
          <MarkTaskAsComplete task={task} />
          <TaskActions
            task={task}
            onOpenChange={onOpenChange}
            setFullScreen={setFullScreen}
            fullScreen={fullScreen}
          />
        </div>
        <div className="flex items-center gap-1.5 border-b bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5 shrink-0" />
          <span>Visible to everyone in {project.name}.</span>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
          <EditableTaskTitle task={task} />
          <TaskAssignee task={task} />
          <Separator />
          <div className="flex items-center gap-3">
            <Label className="w-24 shrink-0 text-[13px] font-normal text-muted-foreground">Due date</Label>
            <TaskDueDate task={task} variant="field" />
          </div>
          <TaskProject task={task} project={project} />
          <TaskDependencies task={task} />
          <TaskFields task={task} />
          <AppTextEditor task={task} />
          <div className="rounded-md border bg-muted/20 p-2.5">
            <Label className="text-[13px] text-muted-foreground">
              Attachments {task.media && task.media.length > 0 && `(${task.media.length})`}
            </Label>
            <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-border pt-2.5">
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
    </Sheet>
  );
}
