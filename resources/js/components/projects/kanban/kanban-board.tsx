import React from 'react'
import { SharedData, Task } from '@/types'
import { usePage } from '@inertiajs/react'
import AddNewColumn from './add-new-column'
import { KanbanColumn } from './kanban-column'
import { useKanban } from '@/hooks/use-kanban'

export const KanbanBoard = () => {
  const { tasks } = usePage<SharedData & { tasks: Task[] }>().props
  const { parentTasks } = useKanban(tasks)

  return (
    <div className="h-[calc(100vh-250px)] px-6 overflow-y-auto">
      <div className="flex gap-4">
        {parentTasks.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            columns={parentTasks}
            tasks={tasks}
          />
        ))}
        <AddNewColumn />
      </div>
    </div>
  )
}

