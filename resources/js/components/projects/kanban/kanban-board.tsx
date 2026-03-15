import { useState, useRef, useEffect } from 'react'
import { SharedData, Task } from '@/types'
import { router, usePage } from '@inertiajs/react'
import AddNewColumn from './add-new-column'
import { KanbanColumn } from './kanban-column'
import { useKanban } from '@/hooks/use-kanban'
import { DragDropProvider, DragOverlay } from '@dnd-kit/react'
import { move } from '@dnd-kit/helpers'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type GroupedTasks = Record<string, Task[]>

export const KanbanBoard = () => {
  const { tasks } = usePage<SharedData & { tasks: Task[] }>().props
  const { parentTasks, groupTasksByColumn } = useKanban(tasks)

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
      <div className="h-[calc(100vh-170px)] px-6 overflow-y-auto">
        <div className="flex gap-4">
          {parentTasks.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              columns={parentTasks}
              tasks={columns[column.id] || []}
            />
          ))}
          <AddNewColumn />
        </div>
      </div>
      <DragOverlay>
        {activeTask && (
          <div className="w-[320px] rotate-2">
            <Card className="border-2 border-dashed border-primary/30 bg-primary/5 py-2 gap-2 opacity-50 shadow-lg">
              <CardHeader className="px-4">
                <CardTitle className="text-sm font-medium text-muted-foreground truncate">
                  {activeTask.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 px-4 space-y-2 pb-3">
                <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
              </CardContent>
            </Card>
          </div>
        )}
      </DragOverlay>
    </DragDropProvider>
  )
}
