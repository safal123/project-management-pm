import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { usePage } from '@inertiajs/react'
import { SharedData, Task } from '@/types'

interface TaskCollaboratorsProps {
  task: Task
  className?: string
}

export default function TaskCollaborators({ task, className = '' }: TaskCollaboratorsProps) {
  const { auth } = usePage<SharedData>().props

  return (
    <div className={`flex shrink-0 items-center justify-between ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-[12px] text-muted-foreground">Collaborators</span>
        <div className="flex -space-x-1.5">
          <Avatar className="h-6 w-6 border border-background">
            <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
            <AvatarFallback className="text-[10px]">
              {auth.user.name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {task.assigned_to && task.assigned_to.id !== auth.user.id && (
            <Avatar className="h-6 w-6 border border-background">
              <AvatarImage src={task.assigned_to.avatar} alt={task.assigned_to.name} />
              <AvatarFallback className="text-[10px]">
                {task.assigned_to.name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <Button variant="outline" size="sm" className="h-7 px-2 text-[12px] text-muted-foreground">
        Leave task
      </Button>
    </div>
  )
}
