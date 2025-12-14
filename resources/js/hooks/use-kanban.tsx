import { useMemo, useState } from 'react'
import { router } from '@inertiajs/react'
import { Task } from '@/types'

/**
 * Hook for managing kanban board data and filtering
 */
export const useKanban = (tasks: Task[]) => {
  const parentTasks = useMemo(() => {
    return tasks
      .filter((task) => task.parent_task_id === null)
      .sort((a, b) => (a?.order || 0) - (b?.order || 0))
  }, [tasks])

  const getChildTasks = (columnId: string) => {
    return tasks
      .filter((task) => task.parent_task_id === columnId)
      .sort((a, b) => (b?.order || 0) - (a?.order || 0)) // Sort descending - newest first
  }

  return {
    parentTasks,
    getChildTasks,
  }
}

/**
 * Hook for managing individual kanban task actions and state
 */
export const useKanbanTask = (task: Task, columns: Task[]) => {
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false)

  const deleteTask = () => {
    router.delete(route('tasks.destroy', { task: task.id }), {
      preserveScroll: true,
      only: ['tasks'],
    })
  }

  const moveTaskToColumn = (columnId: string) => {
    router.patch(
      route('tasks.update', { task: task.id }),
      { parent_task_id: columnId },
      { preserveScroll: true, only: ['tasks'] }
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
