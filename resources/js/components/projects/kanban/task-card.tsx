import { Task } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'
import React from 'react'
import { getPriorityColors } from '@/utils/task-colors'
import { formatDueDate } from '@/utils/task'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const TaskCard = ({ task }: { task: Task }) => {
  return (
    <div className="space-y-1.5 p-2 bg-background rounded-lg">
      <h4 className="text-sm font-medium text-foreground leading-tight line-clamp-2 break-words">
        {task.title}
      </h4>

      {task.description && (
        <div className="py-2">
          <p className="text-xs text-muted-foreground line-clamp-3 break-words">
            {task.description}
          </p>
        </div>
      )}
      <div className="flex items-center gap-2 mt-2 -ml-1">
        <Badge variant="outline" className="text-xs">
          {task.status ? task.status : 'NA'}
        </Badge>
        <Badge variant="outline" className={`text-xs ${getPriorityColors}`}>
          {task.priority || 'NA'}
        </Badge>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          {task.due_date ? formatDueDate(task.due_date)?.text : <Badge variant="outline" className="text-xs">No due date</Badge>}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <Avatar className="h-4 w-4">
          <AvatarImage src={task.assigned_to?.avatar} alt={task.assigned_to?.name} />
          <AvatarFallback className="text-xs">
            {task.assigned_to?.name?.slice(0, 2).toUpperCase() || 'NA'}
          </AvatarFallback>
        </Avatar>
        <span className="text-xs text-muted-foreground">
          {task.assigned_to?.name ? task.assigned_to?.name : <Badge variant="outline" className="text-xs">Unassigned</Badge>}
        </span>
      </div>
    </div>
  )
}

export default TaskCard
