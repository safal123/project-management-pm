import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const SHEET_WIDTH_KEY = 'task-sheet-width'
const TABS_WIDTH_KEY = 'task-sheet-tabs-width'
const DEFAULT_SHEET_WIDTH = 1100
const MIN_SHEET_WIDTH = 760
const MAX_SHEET_WIDTH = 1440
const DEFAULT_TABS_WIDTH = 400
const MIN_TABS_WIDTH = 300
const MAX_TABS_WIDTH = 560

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function readStoredWidth(key: string, fallback: number) {
  if (typeof window === 'undefined') return fallback
  const stored = Number(window.localStorage.getItem(key))
  return Number.isFinite(stored) && stored > 0 ? stored : fallback
}

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
  const [sheetWidth, setSheetWidth] = useState(() => readStoredWidth(SHEET_WIDTH_KEY, DEFAULT_SHEET_WIDTH));
  const [tabsWidth, setTabsWidth] = useState(() => readStoredWidth(TABS_WIDTH_KEY, DEFAULT_TABS_WIDTH));
  const dragRef = useRef<{
    target: 'sheet' | 'tabs'
    startX: number
    startWidth: number
  } | null>(null)
  const sheetWidthRef = useRef(sheetWidth)
  const tabsWidthRef = useRef(tabsWidth)
  sheetWidthRef.current = sheetWidth
  tabsWidthRef.current = tabsWidth

  const persistWidth = useCallback((key: string, value: number) => {
    window.localStorage.setItem(key, String(value))
  }, [])

  const startResize = useCallback((target: 'sheet' | 'tabs', event: React.MouseEvent) => {
    event.preventDefault()
    dragRef.current = {
      target,
      startX: event.clientX,
      startWidth: target === 'sheet' ? sheetWidthRef.current : tabsWidthRef.current,
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      if (!dragRef.current) return
      const delta = dragRef.current.startX - event.clientX
      if (dragRef.current.target === 'sheet') {
        const next = clamp(dragRef.current.startWidth + delta, MIN_SHEET_WIDTH, Math.min(MAX_SHEET_WIDTH, window.innerWidth - 24))
        sheetWidthRef.current = next
        setSheetWidth(next)
      } else {
        const next = clamp(dragRef.current.startWidth + delta, MIN_TABS_WIDTH, MAX_TABS_WIDTH)
        tabsWidthRef.current = next
        setTabsWidth(next)
      }
    }

    const onUp = () => {
      if (!dragRef.current) return
      persistWidth(
        dragRef.current.target === 'sheet' ? SHEET_WIDTH_KEY : TABS_WIDTH_KEY,
        dragRef.current.target === 'sheet' ? sheetWidthRef.current : tabsWidthRef.current
      )
      dragRef.current = null
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [persistWidth])

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
          '[&>button]:hidden flex w-full flex-col gap-0 space-y-0 overflow-hidden bg-background p-0 text-[13px] sm:max-w-none',
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
        } : {
          width: sheetWidth,
          maxWidth: '96vw',
        }}
      >
        {!fullScreen && (
          <button
            type="button"
            aria-label="Resize task panel"
            className="absolute inset-y-0 left-0 z-20 w-1.5 cursor-col-resize hover:bg-foreground/15"
            onMouseDown={(event) => startResize('sheet', event)}
          />
        )}
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
              : (
                <span className="text-amber-600 dark:text-amber-400">
                  Visible to everyone in {project.name}.
                </span>
              )}
          </span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
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
            <TaskSubtask task={liveTask} onOpenSubtask={setChildTask} />
            <AppTextEditor task={liveTask} />
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <Label className={FIELD_LABEL}>Attachments</Label>
                <span className="text-[11px] text-muted-foreground">
                  {liveTask.media?.length ? `${liveTask.media.length} file${liveTask.media.length === 1 ? '' : 's'}` : 'None'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {liveTask.media?.map((media) => (
                  <AppImagePreview
                    key={media.id}
                    url={media.url}
                    filename={media.original_filename}
                    createdAt={media.created_at}
                    mediaId={media.id}
                    filesize={media.filesize}
                    filetype={media.filetype}
                    variant="thumbnail"
                  />
                ))}
                <AppFileUpload
                  workspaceId={liveTask.workspace_id}
                  mediableId={liveTask.id}
                  mediableType="task"
                  variant="thumbnail"
                />
              </div>
            </div>
          </div>
          <div
            className="relative h-[280px] w-full border-t md:h-auto md:w-(--tabs-width) md:shrink-0 md:border-t-0 md:border-l"
            style={{ '--tabs-width': `${tabsWidth}px` } as React.CSSProperties}
          >
            <button
              type="button"
              aria-label="Resize comments panel"
              className="absolute inset-y-0 left-0 z-10 hidden w-1.5 cursor-col-resize hover:bg-foreground/15 md:block"
              onMouseDown={(event) => startResize('tabs', event)}
            />
            <TaskCommentsSection task={liveTask} open={open} className="h-full w-full" />
          </div>
        </div>
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
