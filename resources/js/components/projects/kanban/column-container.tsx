import { Project, SharedData, Task } from '@/types'
import ColumnTaskContainer from './column-task-container'
import AddNewTask from './add-new-task'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Trash2 } from "lucide-react"
import { router, usePage } from '@inertiajs/react'
import EditableTaskTitle from '@/components/tasks/editable-task-title'
import { useMemo } from 'react'

const ColumnContainer = ({ column, tasks }: { column: any, tasks: Task[] }) => {
  const { project } = usePage<SharedData & { project: Project }>().props;

  const tasksIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transition,
    transform,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      title: column.title,
      columnId: column.id,
    },
  })

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      accepts: ['Task'],
    },
  })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex flex-col w-[350px] flex-shrink-0 bg-background rounded-lg border border-dashed border-primary/50 min-h-full"
      />
    )
  }

  const handleDeleteColumn = (columnId: string) => {
    router.delete(route('tasks.destroy', { task: columnId }), {
      preserveScroll: true,
    })
  }

  const combinedRef = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    setDroppableRef(node);
  };

  return (
    <div
      ref={combinedRef}
      style={style}
      className={`flex flex-col w-[350px] flex-shrink-0 bg-background rounded-lg ${isOver ? 'ring-2 ring-primary ring-offset-2' : ''}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab flex items-center justify-between bg-background rounded-t-lg p-4 border border-b-0 border-border"
      >
        <EditableTaskTitle task={column} variant="small" />
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                Edit Column
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Button
                  onClick={() => handleDeleteColumn(column.id)}
                  variant="destructive" size="sm" className="w-full">
                  <Trash2 className="h-4 w-4" /> Delete Column
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className={`mb-4 bg-muted/30 rounded-b-lg border border-t-0 border-border px-3 py-3 flex flex-col gap-2 max-h-[calc(100vh-250px)] overflow-y-auto ${isOver ? 'bg-primary/5' : ''}`}>
        {tasks.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">No tasks</p>
        ) : (
          <SortableContext items={tasksIds} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <ColumnTaskContainer key={task.id} task={task} />
            ))}
          </SortableContext>
        )}
      </div>
      <AddNewTask
        projectId={project.id}
        parentTaskId={column.id}
        workspaceId={project.workspace_id}
      />
    </div>
  )
}

export default ColumnContainer
