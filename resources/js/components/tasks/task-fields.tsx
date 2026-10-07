import { Label } from '@/components/ui/label'
import { Task } from '@/types'
import TaskPriority from './task-priority'
import TaskStatus from './task-status'
import TaskBranch from './task-branch'
import { FIELD_LABEL } from './field-styles'

interface TaskFieldsProps {
  task: Task
  className?: string
}

export default function TaskFields({ task, className = '' }: TaskFieldsProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-3">
        <Label className={FIELD_LABEL}>Priority</Label>
        <TaskPriority task={task} variant="field" />
      </div>
      <div className="flex items-center gap-3">
        <Label className={FIELD_LABEL}>Status</Label>
        <TaskStatus task={task} variant="field" />
      </div>
      <TaskBranch task={task} />
    </div>
  )
}
