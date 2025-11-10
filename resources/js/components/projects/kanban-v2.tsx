import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { Button } from '../ui/button'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createPortal } from 'react-dom'
import { EditIcon, PlusIcon, TrashIcon } from 'lucide-react'
import { router, usePage } from '@inertiajs/react'
import { Project, SharedData, Task } from '@/types'

interface ColumnType {
  id: string
  title: string
  order: number
}

interface TaskType {
  id: string
  title: string
  description: string
  columnId: string
  order: number
}

const KanbanV2 = () => {
  const { tasks: initialTasks, project } = usePage<SharedData & { tasks: Task[], project: Project }>().props

  // Separate parent and child tasks (memoized and ordered)
  const parentTasks = useMemo(
    () => initialTasks.filter((t) => t.parent_task_id === null).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [initialTasks]
  )
  const childTasks = useMemo(
    () => initialTasks.filter((t) => t.parent_task_id !== null).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [initialTasks]
  )

  // Columns = parent tasks
  const [columns, setColumns] = useState<ColumnType[]>(
    parentTasks.map((t) => ({ id: t.id, title: t.title, order: t.order || 0 }))
  )

  // Tasks = child tasks
  const [tasks, setTasks] = useState<TaskType[]>(
    childTasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      columnId: t.parent_task_id!,
      order: t.order || 0,
    }))
  )

  const [activeColumn, setActiveColumn] = useState<ColumnType | null>(null)
  const [activeTask, setActiveTask] = useState<TaskType | null>(null)
  const [dragStartColumnId, setDragStartColumnId] = useState<string | null>(null)

  const columnsIds = useMemo(() => columns.map((c) => c.id), [columns])
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  // Sync local state with server props (avoid loops by comparing keys)
  useEffect(() => {
    const nextColumns = parentTasks.map((t) => ({ id: t.id, title: t.title, order: t.order || 0 }))
    const nextTasks = childTasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      columnId: t.parent_task_id!,
      order: t.order || 0,
    }))
    const currentColKey = columns.map((c) => `${c.id}:${c.title}:${c.order}`).join('|')
    const nextColKey = nextColumns.map((c) => `${c.id}:${c.title}:${c.order}`).join('|')
    const currentTaskKey = tasks.map((t) => `${t.id}:${t.columnId}:${t.order}:${t.title}`).join('|')
    const nextTaskKey = nextTasks.map((t) => `${t.id}:${t.columnId}:${t.order}:${t.title}`).join('|')
    if (currentColKey !== nextColKey) setColumns(nextColumns)
    if (currentTaskKey !== nextTaskKey) setTasks(nextTasks)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTasks, parentTasks, childTasks])

  const addColumn = () => {
    router.post(route('tasks.store'), {
      title: 'New Section',
      description: 'New Section Description',
      project_id: project.id,
      parent_task_id: null,
      workspace_id: project.workspace_id,
    }, {
      preserveScroll: true,
      replace: true,
      only: ['tasks', 'project'],
    })
  }

  const deleteColumn = (columnId: string) => {
    router.delete(route('tasks.destroy', { task: columnId }), {
      preserveScroll: true,
    })
  }

  const addTask = (columnId: string) => {
    router.post(route('tasks.store'), {
      title: 'New Task',
      description: 'New Task Description',
      project_id: project.id,
      parent_task_id: columnId,
      workspace_id: project.workspace_id,
    }, {
      preserveScroll: true,
      replace: true,
      only: ['tasks', 'project'],
    })
  }

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
  }

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current
    if (data?.type === 'Column') {
      setActiveColumn(data.column as ColumnType)
    }
    if (data?.type === 'Task') {
      setActiveTask(data.task as TaskType)
      // Capture the original column ID before any drag updates
      const taskData = tasks.find((t) => t.id === event.active.id)
      if (taskData) {
        setDragStartColumnId(taskData.columnId)
      }
    }
  }, [tasks])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)
    setActiveColumn(null)

    if (!over) {
      setDragStartColumnId(null)
      return
    }

    const activeType = active.data.current?.type
    const overId = over.id as string
    const activeId = active.id as string

    if (activeType === 'Column') {
      if (activeId === overId) return
      const oldIndex = columns.findIndex((c) => c.id === activeId)
      const newIndex = columns.findIndex((c) => c.id === overId)
      const reorderedColumns = arrayMove([...columns], oldIndex, newIndex)
      const newOrder = reorderedColumns.map((c) => c.id)
      setColumns(reorderedColumns)

      router.post(route('tasks.reorder'), {
        taskIds: newOrder,
        orderType: 'column',
        sourceColumnId: activeId,
        targetColumnId: overId,
      }, {
        preserveScroll: true,
        replace: true,
        only: ['tasks', 'project'],
      });
      return;
    }
    if (activeType === 'Task') {
      const activeTaskData = tasks.find((t) => t.id === activeId)
      if (!activeTaskData) {
        setDragStartColumnId(null)
        return
      }

      const overType = over.data.current?.type
      let targetColumnId: string | null = null
      let insertIndex: number | null = null

      if (overType === 'Task') {
        // Dropped on another task - insert at that position
        const overTaskData = tasks.find((t) => t.id === overId)
        if (overTaskData) {
          targetColumnId = overTaskData.columnId
          const targetColumnTasks = tasks.filter((t) => t.columnId === overTaskData.columnId && t.id !== activeId)
          insertIndex = targetColumnTasks.findIndex((t) => t.id === overId)
        }
      } else if (overType === 'Column') {
        // Dropped on column - add at end
        targetColumnId = overId
      } else {
        // Fallback: if we're over something whose id matches a column, treat it as a column
        const col = columns.find((c) => c.id === overId)
        if (col) targetColumnId = col.id
      }

      if (!targetColumnId) {
        setDragStartColumnId(null)
        return
      }

      // Use the original column ID captured at drag start, not the current one
      const sourceColumnId = dragStartColumnId || activeTaskData.columnId

      // Build correct task order for target column
      let targetTasks: string[]
      if (insertIndex !== null && insertIndex >= 0) {
        // Insert at specific position
        const targetColumnTasks = tasks.filter((t) => t.columnId === targetColumnId && t.id !== activeId).map((t) => t.id)
        targetTasks = [
          ...targetColumnTasks.slice(0, insertIndex),
          activeId,
          ...targetColumnTasks.slice(insertIndex)
        ]
      } else {
        // Add at end of target column
        targetTasks = [
          ...tasks.filter((t) => t.columnId === targetColumnId && t.id !== activeId).map((t) => t.id),
          activeId
        ]
      }

      const isCrossColumn = sourceColumnId !== targetColumnId

      // Build request data - only include parent_task_id when crossing columns
      const requestData: {
        taskIds: string[]
        sourceColumnId: string
        targetColumnId: string
        moved_task_id: string
        parent_task_id?: string
      } = {
        taskIds: targetTasks,
        sourceColumnId,
        targetColumnId,
        moved_task_id: activeId,
      }

      if (isCrossColumn) {
        requestData.parent_task_id = targetColumnId
      }

      console.log('=== Task Drop Debug ===')
      console.log('Source Column:', sourceColumnId)
      console.log('Target Column:', targetColumnId)
      console.log('Is Cross Column?', isCrossColumn)
      console.log('Moved Task ID:', activeId)
      console.log('Request Data:', JSON.stringify(requestData, null, 2))
      console.log('======================')

      // Persist in one request; include parent_task_id only when column actually changes
      router.post(route('tasks.reorder'), requestData, {
        preserveScroll: true,
        replace: true,
        only: ['tasks', 'project'],
        onError: (errors) => {
          console.error('Reorder failed:', errors)
          setDragStartColumnId(null)
        },
        onSuccess: () => {
          console.log('✓ Reorder successful')
          setDragStartColumnId(null)
        },
      })
    }
  }, [columns, tasks, dragStartColumnId])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeType = active.data.current?.type
    const overType = over.data.current?.type
    if (activeType !== 'Task') return

    const activeId = active.id as string
    const overId = over.id as string

    setTasks((prev) => {
      const oldIndex = prev.findIndex((t) => t.id === activeId)
      if (oldIndex === -1) return prev
      const updated = [...prev]
      const activeTask = { ...updated[oldIndex] }

      // Case 1: dropped on another task
      if (overType === 'Task') {
        const newIndex = updated.findIndex((t) => t.id === overId)
        if (newIndex === -1) return prev
        activeTask.columnId = updated[newIndex].columnId
        updated.splice(oldIndex, 1)
        updated.splice(newIndex, 0, activeTask)
        return updated
      }

      // Case 2: dropped on column
      if (overType === 'Column' || typeof overId === 'string') {
        activeTask.columnId = overId
        updated.splice(oldIndex, 1)
        updated.push(activeTask)
        return updated
      }

      return prev
    })
  }, [])

  return (
    <div className="w-full h-full flex items-start justify-start overflow-x-auto px-8 py-6">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="flex gap-4 max-h-[calc(100vh-220px)]">
          <SortableContext items={columnsIds}>
            {columns.map((column) => (
              <ColumnContainer
                key={column.id}
                column={column}
                deleteColumn={deleteColumn}
                addTask={addTask}
                tasks={tasks.filter((t) => t.columnId === column.id)}
                deleteTask={deleteTask}
              />
            ))}
          </SortableContext>

          <div className="flex items-center justify-center w-[350px] h-[60px] border border-dashed border-primary/50 rounded-lg bg-card/30">
            <Button size="sm" onClick={addColumn}>
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Column
            </Button>
          </div>
        </div>

        {createPortal(
          <DragOverlay>
            {activeTask
              ? (
                <div className="mb-1 p-2 border border-primary/50 rounded-lg bg-card shadow-2xl rotate-1 opacity-95 scale-105 transition-transform">
                  <div className="flex items-center justify-between">
                    {activeTask.title}
                    <div className="flex items-center gap-1 ml-auto">
                      <Button size="icon" variant="ghost">
                        <EditIcon className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost">
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
              : activeColumn
                ? (
                  <div className="flex flex-col w-[350px] h-[500px] bg-card rounded-lg border-2 border-dashed border-primary/50 opacity-80" />
                )
                : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  )
}

export default KanbanV2


const ColumnContainer = ({
  column,
  deleteColumn,
  addTask,
  tasks,
  deleteTask,
}: {
  column: ColumnType
  deleteColumn: (id: string) => void
  addTask: (columnId: string) => void
  tasks: TaskType[]
  deleteTask: (taskId: string) => void
}) => {
  const tasksIds = useMemo(() => tasks.map((t) => t.id), [tasks])
  const { attributes, setNodeRef, listeners, transition, transform, isDragging } = useSortable({
    id: column.id,
    data: { type: 'Column', column },
  })
  // Make the column content area droppable for Task drags (enables dropping into empty columns)
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: column.id,
    data: { type: 'Column' },
  })

  const style = {
    transition: transition || undefined,
    transform: CSS.Transform.toString(transform),
  }

  if (isDragging)
    return <div ref={setNodeRef} style={style} className="w-[350px] h-[500px] border-2 border-dashed border-primary/50 rounded-lg bg-muted/30" />

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex flex-col w-[350px] h-[500px] bg-card rounded-lg border border-primary/50 shadow-sm"
    >
      <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card rounded-t-lg">
        <span className="text-sm font-medium truncate">{column.title}</span>
        <Button size="sm" variant="ghost" onClick={() => deleteColumn(column.id)}>
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
      <div ref={setDroppableRef} className="flex-1 overflow-y-auto p-2 space-y-2">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} deleteTask={deleteTask} />
          ))}
        </SortableContext>
      </div>
      <div className="flex items-center justify-start py-2 pl-2 border-t border-primary/50 rounded-b-lg bg-card">
        <Button size="sm" onClick={() => addTask(column.id)}>
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Task
        </Button>
      </div>
    </div>
  )
}


const TaskCard = ({ task, deleteTask }: { task: TaskType; deleteTask: (taskId: string) => void }) => {
  const { attributes, setNodeRef, listeners, transition, transform, isDragging } = useSortable({
    id: task.id,
    data: { type: 'Task', task },
  })

  const style = {
    transition: transition || undefined,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-2 border border-primary/50 rounded-lg hover:shadow-md transition-all cursor-pointer bg-card"
    >
      <div className="flex items-center justify-between">
        {task.title}
        <div className="flex items-center gap-1 ml-auto">
          <Button size="icon" variant="ghost">
            <EditIcon className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => deleteTask(task.id)}>
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
