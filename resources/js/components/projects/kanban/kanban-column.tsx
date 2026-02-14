import React, { useMemo, useState } from 'react'
import { Task } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import EditableTaskTitle from '@/components/tasks/editable-task-title'
import ColumnDropdown from './column-dropdown'
import { KanbanTask } from './kanban-task'
import { Button } from '@/components/ui/button'
import { Loader2, Plus } from 'lucide-react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'

interface KanbanColumnProps {
  column: Task
  columns: Task[]
  tasks: Task[]
}

export const KanbanColumn = ({ column, columns, tasks }: KanbanColumnProps) => {
  const [isAddingNewTask, setIsAddingNewTask] = useState(false);
  const childTasks = useMemo(() => {
    return tasks
      .filter((task) => task.parent_task_id === column.id)
      .sort((a, b) => (b?.order || 0) - (a?.order || 0))
  }, [tasks, column.id])

  const handleAddNewTask = (columnId: string) => {
    setIsAddingNewTask(true);
    router.post(route('tasks.store'), {
      title: 'New Task',
      description: 'New Task Description',
      project_id: column.project_id,
      parent_task_id: columnId,
      workspace_id: column.workspace_id,
    }, {
      preserveScroll: true,
      only: ['tasks'],
      onSuccess: () => {
        toast.success('New task added');
      },
      onError: () => {
        toast.error('Failed to add new task');
      },
      onFinish: () => {
        setIsAddingNewTask(false);
      },
    })
  }


  return (
    <div className="w-[350px] h-full shrink-0">
      <Card className="h-[700px] flex flex-col bg-card">
        <CardHeader className="flex-shrink-0 -my-6 pt-2 border-b">
          <CardTitle className="flex items-center justify-between mb-2">
            <EditableTaskTitle task={column} variant="small" className="flex-1" childTasksCount={childTasks.length} />
            <ColumnDropdown column={column} columns={columns} />
          </CardTitle>
        </CardHeader>
        <Separator className="bg-border flex-shrink-0" />
        <CardContent className="p-0 flex-1 overflow-y-auto -mt-6">
          <div className="space-y-2 p-2">
            {childTasks.map((task) => (
              <KanbanTask key={task.id} task={task} columns={columns} />
            ))}
            <div className="text-center text-sm text-muted-foreground">
              <Button
                onClick={() => handleAddNewTask(column.id)}
                variant="outline" size="sm" className="w-full text-primary">
                <Plus className="h-4 w-4" />
                {isAddingNewTask && <Loader2 className="h-4 w-4 animate-spin" />}
                Add New Task
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

