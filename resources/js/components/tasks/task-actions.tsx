import { Task } from '@/types'
import React from 'react'
import { Button } from '../ui/button'
import { Paperclip, Share2, Copy, Maximize2, MoreHorizontal, Trash2, Link } from 'lucide-react'
import { DropdownMenu, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu'
import { router } from '@inertiajs/react'

const TaskActions = ({ task, onOpenChange }: { task: Task, onOpenChange: (open: boolean) => void }) => {
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      router.delete(`/tasks/${task.id}`);
      onOpenChange(false);
    }
  };
  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Share2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Paperclip className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Copy className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Link className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Maximize2 className="h-4 w-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default TaskActions

