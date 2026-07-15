import { memo } from 'react'
import { Task } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import EditableTaskTitle from '@/components/tasks/editable-task-title'
import ColumnDropdown from './column-dropdown'
import { KanbanTask } from './kanban-task'
import { AddKanbanItem } from './add-kanban-item'
import { useDroppable } from '@dnd-kit/react'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
  column: Task
  columns: Task[]
  tasks: Task[]
}

export const KanbanColumn = memo(({ column, columns, tasks }: KanbanColumnProps) => {
  const { ref, isDropTarget } = useDroppable({
    id: column.id,
    type: 'column',
    accept: 'task',
  })

  return (
    <div
      ref={ref}
      className={cn(
        'w-[370px] h-full shrink-0 rounded-lg transition-colors',
        isDropTarget && 'bg-primary/10'
      )}
    >
      <Card className="max-h-[800px] flex flex-col bg-card">
        <CardHeader className="flex-shrink-0 -my-6 pt-2 border-b">
          <CardTitle className="flex items-center justify-between mb-2">
            <EditableTaskTitle task={column} variant="small" className="flex-1" childTasksCount={tasks.length} />
            <ColumnDropdown column={column} columns={columns} />
          </CardTitle>
        </CardHeader>
        <Separator className="bg-border flex-shrink-0" />
        <CardContent className="p-0 flex-1 overflow-y-auto -mt-6">
          <div className="space-y-2 p-2">
            {tasks.map((task, index) => (
              <KanbanTask
                key={task.id}
                task={task}
                columns={columns}
                index={index}
                columnId={column.id}
              />
            ))}
            <AddKanbanItem type="task" column={column} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
})
