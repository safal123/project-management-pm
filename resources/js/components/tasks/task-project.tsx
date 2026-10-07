import { Label } from '@/components/ui/label'
import { Project, Task } from '@/types'
import { FIELD_LABEL } from './field-styles'

interface TaskProjectProps {
  task: Task
  project: Project
  className?: string
}

export default function TaskProject({ project, className = '' }: TaskProjectProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Label className={FIELD_LABEL}>Project</Label>
      <div className="flex h-8 min-w-[180px] items-center gap-2 rounded-md border border-border px-2.5 text-[13px]">
        <span className="h-1.5 w-1.5 rounded-full bg-foreground/70" />
        <span className="truncate">{project.name}</span>
      </div>
    </div>
  )
}
