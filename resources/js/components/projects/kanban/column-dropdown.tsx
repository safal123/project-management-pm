import React from 'react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react'
import { router } from '@inertiajs/react'
import { Task } from '@/types'
import { Separator } from '@/components/ui/separator'

interface ColumnDropdownProps {
  column: Task
  columns: Task[]
}

const ColumnDropwn = ({ column, columns }: ColumnDropdownProps) => {
  const handleDeleteColumn = (columnId: string) => {
    router.delete(route('tasks.destroy', { task: columnId }), {
      preserveScroll: true,
    })
  }

  const handleMoveColumn = (columnId: string, direction: 'left' | 'right' | 'first' | 'last') => {
    if (direction === 'left' && isFirstColumn(columnId)) return;
    if (direction === 'right' && isLastColumn(columnId)) return;
    if (direction === 'first' && isFirstColumn(columnId)) return;
    if (direction === 'last' && isLastColumn(columnId)) return;

    router.post(route('tasks.move'), {
      task_id: columnId,
      direction,
    }, {
      preserveScroll: true,
      only: ['tasks'],
    });
  };

  const handleAddNewTask = (columnId: string) => {
    router.post(route('tasks.store'), {
      title: 'New Task',
      description: 'New Task Description',
      project_id: column.project_id,
      parent_task_id: columnId,
      workspace_id: column.workspace_id,
    }, {
      preserveScroll: true,
      only: ['tasks'],
    })
  }

  const isFirstColumn = (columnId: string) => {
    return columns.findIndex((c) => c.id === columnId) === 0;
  };

  const isLastColumn = (columnId: string) => {
    return columns.findIndex((c) => c.id === columnId) === columns.length - 1;
  };

  return (
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
        <DropdownMenuContent align="end" className="w-48">
          {/* Add new task */}
          <DropdownMenuItem
            onClick={() => handleAddNewTask(column.id)}
            className="font-medium cursor-pointer bg-primary/10 mb-1 hover:bg-primary/20 dark:hover:bg-primary/20"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Task
          </DropdownMenuItem>
          <Separator />
          <DropdownMenuItem
            onClick={() => handleMoveColumn(column.id, 'left')}
            disabled={isFirstColumn(column.id)}
            className="cursor-pointer mt-1"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Move Left
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleMoveColumn(column.id, 'right')}
            disabled={isLastColumn(column.id)}
            className="cursor-pointer"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Move Right
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleMoveColumn(column.id, 'first')}
            disabled={isFirstColumn(column.id)}
            className="cursor-pointer"
          >
            <ArrowUp className="h-4 w-4 mr-2" />
            Move to First
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleMoveColumn(column.id, 'last')}
            disabled={isLastColumn(column.id)}
            className="cursor-pointer"
          >
            <ArrowDown className="h-4 w-4 mr-2" />
            Move to Last
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handleDeleteColumn(column.id)}
            className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Column
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default ColumnDropwn
