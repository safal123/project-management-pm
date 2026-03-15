import { useCallback, useMemo, useState } from 'react'
import { router } from '@inertiajs/react'
import { Task } from '@/types'

export const useKanban = (tasks: Task[]) => {
  const parentTasks = useMemo(() => {
    return tasks
      .filter((task) => task.parent_task_id === null)
      .sort((a, b) => (a?.order || 0) - (b?.order || 0))
  }, [tasks])

  const groupTasksByColumn = useCallback(() => {
    const grouped: Record<string, Task[]> = {}
    for (const column of parentTasks) {
      grouped[column.id] = tasks
        .filter((task) => task.parent_task_id === column.id)
        .sort((a, b) => (a?.order || 0) - (b?.order || 0))
    }
    return grouped
  }, [tasks, parentTasks])

  return {
    parentTasks,
    groupTasksByColumn,
  }
}

export const useKanbanTask = (task: Task, columns: Task[]) => {
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false)

  const deleteTask = () => {
    router.delete(route('tasks.destroy', { task: task.id }), {
      preserveScroll: true,
      only: ['tasks', 'paginatedTasks'],
    })
  }

  const moveTaskToColumn = (columnId: string) => {
    router.patch(
      route('tasks.update', { task: task.id }),
      { parent_task_id: columnId },
      { preserveScroll: true, only: ['tasks', 'paginatedTasks'] }
    )
  }

  const openTaskDetailSheet = () => {
    setIsTaskDetailOpen(true)
  }

  const availableColumns = columns.filter((col) => col.id !== task.parent_task_id)

  return {
    isTaskDetailOpen,
    setIsTaskDetailOpen,
    deleteTask,
    moveTaskToColumn,
    openTaskDetailSheet,
    availableColumns,
  }
}
