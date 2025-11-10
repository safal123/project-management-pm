import { Task } from '@/types'
import { getStatusColors } from '@/utils/task-colors'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TaskCard from './task-card'

const ColumnTaskContainer = ({ task }: { task: Task }) => {
  const statusColors = getStatusColors(task.status || 'todo').replace('bg-green-50/10 dark:bg-green-950/10', 'bg-background').replace('bg-blue-50/10 dark:bg-blue-950/10', 'bg-background').replace('bg-gray-50/10 dark:bg-gray-950/10', 'bg-background');
  const {
    attributes,
    listeners,
    setNodeRef,
    transition,
    transform,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task: task,
      title: task.title,
      columnId: task.id,
    },
  })

  const style = {
    transition: transition || undefined,
    transform: CSS.Transform.toString(transform),
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`min-h-[130px] rounded-lg border-2 border-dashed border-primary/50 bg-muted/20 py-12 mb-12`}
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-2 mb-4 rounded-lg hover:shadow-md transition-all cursor-pointer group border ${statusColors}`}
    >
      <TaskCard task={task} />
    </div>
  )
}

export default ColumnTaskContainer
