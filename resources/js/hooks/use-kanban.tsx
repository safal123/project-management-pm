import { useCallback, useMemo } from 'react'
import { router } from '@inertiajs/react'
import { Task } from '@/types'

export const useKanban = (tasks: Task[]) => {
  const parentTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.parent_task_id === null)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [tasks]
  )

  const groupTasksByColumn = useCallback(() => {
    const grouped: Record<string, Task[]> = {}
    for (const column of parentTasks) {
      grouped[column.id] = tasks
        .filter((t) => t.parent_task_id === column.id)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    }
    return grouped
  }, [tasks, parentTasks])

  const deleteTask = useCallback((task: Task) => {
    router.delete(route('tasks.destroy', { task: task.id }), {
      preserveScroll: true,
      only: ['tasks', 'paginatedTasks'],
    })
  }, [])

  const moveTaskToColumn = useCallback((task: Task, columnId: string) => {
    router.patch(
      route('tasks.update', { task: task.id }),
      { parent_task_id: columnId },
      { preserveScroll: true, only: ['tasks', 'paginatedTasks'] }
    )
  }, [])

  const getAvailableColumns = useCallback(
    (task: Task) => parentTasks.filter((col) => col.id !== task.parent_task_id),
    [parentTasks]
  )

  return {
    parentTasks,
    groupTasksByColumn,
    deleteTask,
    moveTaskToColumn,
    getAvailableColumns,
  }
}
