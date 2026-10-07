import { memo } from 'react'
import { Task } from '@/types'
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
        'flex h-full max-h-[800px] w-[360px] shrink-0 flex-col rounded-lg border border-neutral-200 bg-neutral-100 transition-colors dark:border-white/10 dark:bg-neutral-950/80',
        isDropTarget && 'border-neutral-300 bg-neutral-200/90 dark:border-white/20 dark:bg-neutral-900'
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-1 px-2.5 py-2">
        <EditableTaskTitle task={column} variant="small" className="flex-1" childTasksCount={tasks.length} />
        <ColumnDropdown column={column} columns={columns} />
      </div>
      <div className="flex-1 overflow-y-auto px-1.5 pb-1.5">
        <div className="space-y-2">
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
      </div>
    </div>
  )
})
