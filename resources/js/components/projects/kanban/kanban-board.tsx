import { useState, useRef, useEffect } from 'react'
import { SharedData, Task } from '@/types'
import { router, usePage } from '@inertiajs/react'
import { AddKanbanItem } from './add-kanban-item'
import { KanbanColumn } from './kanban-column'
import { useKanban } from '@/hooks/use-kanban'
import { DragDropProvider, DragOverlay } from '@dnd-kit/react'
import { move } from '@dnd-kit/helpers'
import { toast } from 'sonner'
import { TaskCardDragPreview } from './task-card-drag-preview'

type GroupedTasks = Record<string, Task[]>

export const KanbanBoard = () => {
  const { tasks } = usePage<SharedData & { tasks: Task[] }>().props
  const { parentTasks, groupTasksByColumn } = useKanban(tasks.data)

  const [columns, setColumns] = useState<GroupedTasks>(() => groupTasksByColumn())
  const snapshotRef = useRef<GroupedTasks | null>(null)
  const columnsRef = useRef(columns)
  columnsRef.current = columns
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  useEffect(() => {
    setColumns(groupTasksByColumn())
  }, [tasks, groupTasksByColumn])

  return (
    <DragDropProvider
      onDragStart={(event) => {
        snapshotRef.current = columnsRef.current
        const task = event?.operation?.source?.data as Task | undefined
        setActiveTask(task ?? null)
      }}
      onDragOver={(event) => {
        setColumns((prev) => move(prev, event) as GroupedTasks)
      }}
      onDragEnd={(event) => {
        setActiveTask(null)
        const snapshot = snapshotRef.current
        snapshotRef.current = null

        if (event.canceled) {
          if (snapshot) setColumns(snapshot)
          return
        }

        const current = columnsRef.current
        if (!snapshot) return

        const draggedTask = event?.operation?.source?.data as Task | undefined
        if (!draggedTask) return

        let targetColumnId: string | null = null
        for (const [columnId, columnTasks] of Object.entries(current)) {
          if (columnTasks.some((t) => t.id === draggedTask.id)) {
            targetColumnId = columnId
            break
          }
        }

        if (!targetColumnId) return

        const changedColumnIds = Object.keys(current).filter(
          (columnId) => snapshot[columnId] !== current[columnId]
        )

        if (changedColumnIds.length === 0) return

        const allTaskIds = changedColumnIds.flatMap(
          (columnId) => current[columnId].map((t) => t.id)
        )

        const columnChanged = targetColumnId !== draggedTask.parent_task_id

        router.post(
          route('tasks.reorder'),
          {
            taskIds: allTaskIds,
            moved_task_id: columnChanged ? draggedTask.id : undefined,
            parent_task_id: columnChanged ? targetColumnId : undefined,
          },
          {
            preserveScroll: true,
            only: ['tasks'],
            onError: () => {
              toast.error('Failed to move task')
              if (snapshot) setColumns(snapshot)
            },
          }
        )
      }}
    >
      <div className="h-[calc(100vh-148px)] overflow-y-auto bg-muted/30 px-4 py-3 dark:bg-black/20 lg:px-6">
        <div className="flex gap-3">
          {parentTasks.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              columns={parentTasks}
              tasks={columns[column.id] || []}
            />
          ))}
          <AddKanbanItem type="column" />
        </div>
      </div>
      <DragOverlay>
        {activeTask && <TaskCardDragPreview task={activeTask} floating />}
      </DragOverlay>
    </DragDropProvider>
  )
}
