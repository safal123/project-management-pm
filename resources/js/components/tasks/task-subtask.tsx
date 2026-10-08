import { useMemo, useState } from 'react'
import { router, usePage } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, ChevronRight, Loader2, Plus } from 'lucide-react'
import { Project, SharedData, Task } from '@/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { FIELD_LABEL } from './field-styles'

function unwrapTasks(tasks?: Task[] | { data?: Task[] }) {
  if (!tasks) return []
  return Array.isArray(tasks) ? tasks : (tasks.data ?? [])
}

interface TaskSubtaskProps {
  task: Task
  className?: string
  onOpenSubtask?: (task: Task) => void
}

export default function TaskSubtask({ task, className = '', onOpenSubtask }: TaskSubtaskProps) {
  const { project, tasks } = usePage<SharedData & { project: Project; tasks?: Task[] | { data?: Task[] } }>().props
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [completingId, setCompletingId] = useState<string | null>(null)

  const subtasks = useMemo(
    () => unwrapTasks(tasks).filter((item) => item.parent_task_id === task.id),
    [tasks, task.id]
  )

  const createSubtask = () => {
    const nextTitle = title.trim()
    if (!nextTitle || saving) return

    setSaving(true)
    router.post(
      route('tasks.store'),
      {
        title: nextTitle,
        project_id: task.project_id ?? project.id,
        parent_task_id: task.id,
        workspace_id: task.workspace_id ?? project.workspace_id,
        status: 'todo',
      },
      {
        preserveScroll: true,
        only: ['tasks', 'paginatedTasks'],
        onSuccess: () => {
          toast.success('Subtask added')
          setTitle('')
          setAdding(false)
        },
        onError: () => toast.error('Failed to add subtask'),
        onFinish: () => setSaving(false),
      }
    )
  }

  const toggleComplete = (subtask: Task) => {
    setCompletingId(subtask.id)
    router.patch(
      `/tasks/${subtask.id}`,
      { status: subtask.status === 'done' ? 'todo' : 'done' },
      {
        preserveScroll: true,
        only: ['tasks', 'paginatedTasks'],
        onFinish: () => setCompletingId(null),
      }
    )
  }

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <Label className={FIELD_LABEL}>Subtasks</Label>
        <span className="text-[11px] text-muted-foreground">
          {subtasks.length ? `${subtasks.filter((item) => item.status === 'done').length}/${subtasks.length}` : 'None'}
        </span>
      </div>

      {subtasks.length > 0 && (
        <div className="mb-2 overflow-hidden rounded-md border border-border">
          {subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className="flex items-center gap-1.5 border-b border-border last:border-b-0"
            >
              <button
                type="button"
                className="flex h-8 w-8 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
                onClick={() => toggleComplete(subtask)}
              >
                {completingId === subtask.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check
                    className={cn(
                      'h-3.5 w-3.5 rounded-full p-0.5',
                      subtask.status === 'done' ? 'bg-muted text-foreground' : 'bg-muted/70 text-muted-foreground'
                    )}
                  />
                )}
              </button>
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center justify-between gap-2 py-1.5 pr-2 text-left"
                onClick={() => onOpenSubtask?.(subtask)}
              >
                <span
                  className={cn(
                    'truncate text-[13px]',
                    subtask.status === 'done' && 'text-muted-foreground line-through'
                  )}
                >
                  {subtask.title}
                </span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <div className="flex items-center gap-2">
          <Input
            autoFocus
            value={title}
            placeholder="Subtask title"
            className="h-8 text-[13px]"
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') createSubtask()
              if (event.key === 'Escape') {
                setAdding(false)
                setTitle('')
              }
            }}
          />
          <Button size="sm" className="h-8 px-2.5 text-[13px]" disabled={saving} onClick={createSubtask}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Add'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2.5 text-[13px]"
            onClick={() => {
              setAdding(false)
              setTitle('')
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 px-2.5 text-[13px]"
          onClick={() => setAdding(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add subtask
        </Button>
      )}
    </div>
  )
}
