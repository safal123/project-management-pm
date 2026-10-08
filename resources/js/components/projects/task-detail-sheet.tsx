import { useEffect, useMemo, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppTooltip from '@/components/app-tooltip';
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
import { FIELD_LABEL } from '../tasks/field-styles';

function unwrapTasks(tasks?: Task[] | { data?: Task[] }) {
  if (!tasks) return []
  return Array.isArray(tasks) ? tasks : (tasks.data ?? [])
}

interface TaskDetailSheetProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nested?: boolean;
}

export function TaskDetailSheet({ task, open, onOpenChange, nested = false }: TaskDetailSheetProps) {
  const { project, tasks } = usePage<SharedData & { project: Project; tasks?: Task[] | { data?: Task[] } }>().props;
  const [fullScreen, setFullScreen] = useState(false);
  const [childTask, setChildTask] = useState<Task | null>(null);

  const allTasks = unwrapTasks(tasks)
  const liveTask = useMemo(
    () => (task ? allTasks.find((item) => item.id === task.id) ?? task : null),
    [allTasks, task]
  )
  const parentTask = liveTask
    ? allTasks.find((item) => item.id === liveTask.parent_task_id)
    : null

  useEffect(() => {
    if (!open) {
      setChildTask(null)
    }
  }, [open])

  if (!liveTask) return null;

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange} modal={true}>
      <SheetContent
        overlayClassName={nested ? 'z-[60]' : undefined}
        className={cn(
          '[&>button]:hidden flex w-full flex-col gap-0 space-y-0 overflow-hidden bg-background p-0 text-[13px] sm:max-w-3xl',
          nested && 'z-[70]',
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
        <SheetTitle className="sr-only">{liveTask.title}</SheetTitle>
        <SheetDescription className="sr-only">
          Task details and information for {liveTask.title}
        </SheetDescription>
        <div className="flex h-11 shrink-0 items-center justify-between border-b bg-muted/20 px-3">
          <div className="flex items-center gap-1.5">
            <MarkTaskAsComplete task={liveTask} />
            {nested && parentTask && (
              <AppTooltip content={`Back to ${parentTask.title}`}>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onOpenChange(false)}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span className="sr-only">Back to parent task</span>
                </Button>
              </AppTooltip>
            )}
          </div>
          <TaskActions
            task={liveTask}
            onOpenChange={onOpenChange}
            setFullScreen={setFullScreen}
            fullScreen={fullScreen}
          />
        </div>
        <div className="flex items-center gap-1.5 border-b bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5 shrink-0" />
          <span>
            {nested && parentTask
              ? `Subtask of ${parentTask.title}`
              : `Visible to everyone in ${project.name}.`}
          </span>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
          <EditableTaskTitle task={liveTask} />
          <TaskAssignee task={liveTask} />
          <Separator />
          <div className="flex items-center gap-3">
            <Label className="w-24 shrink-0 text-[13px] font-normal text-muted-foreground">Due date</Label>
            <TaskDueDate task={liveTask} variant="field" />
          </div>
          <TaskProject task={liveTask} project={project} />
          <TaskDependencies task={liveTask} />
          <TaskFields task={liveTask} />
          <AppTextEditor task={liveTask} />
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <Label className={FIELD_LABEL}>Attachments</Label>
              <span className="text-[11px] text-muted-foreground">
                {liveTask.media?.length ? `${liveTask.media.length} file${liveTask.media.length === 1 ? '' : 's'}` : 'None'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {liveTask.media?.map((media) => (
                <AppImagePreview
                  key={media.id}
                  url={media.url}
                  filename={media.original_filename}
                  createdAt={media.created_at}
                  mediaId={media.id}
                  filesize={media.filesize}
                  filetype={media.filetype}
                />
              ))}
              <AppFileUpload
                workspaceId={liveTask.workspace_id}
                mediableId={liveTask.id}
                mediableType="task"
                variant="tile"
              />
            </div>
          </div>
          <TaskSubtask task={liveTask} onOpenSubtask={setChildTask} />
        </div>
        <TaskCommentsSection task={liveTask} />
      </SheetContent>
    </Sheet>
    <TaskDetailSheet
      task={childTask}
      open={!!childTask}
      onOpenChange={(next) => {
        if (!next) setChildTask(null)
      }}
      nested
    />
    </>
  );
}
