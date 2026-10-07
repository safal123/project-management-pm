import { useState } from 'react'
import { router, usePage } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Plus } from 'lucide-react'
import { Project, SharedData, Task } from '@/types'
import { toast } from 'sonner'

interface TaskSubtaskProps {
  task: Task
  className?: string
}

export default function TaskSubtask({ task, className = '' }: TaskSubtaskProps) {
  const { project } = usePage<SharedData & { project: Project }>().props
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)

  const createSubtask = () => {
    const nextTitle = title.trim()
    if (!nextTitle || saving) return

    setSaving(true)
    router.post(
      route('tasks.store'),
      {
        title: nextTitle,
        project_id: task.project_id ?? project.id,
        parent_task_id: task.parent_task_id ?? task.id,
        workspace_id: task.workspace_id ?? project.workspace_id,
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

  if (!adding) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={`h-8 gap-1.5 px-2.5 text-[13px] ${className}`}
        onClick={() => setAdding(true)}
      >
        <Plus className="h-3.5 w-3.5" />
        Add subtask
      </Button>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
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
  )
}
