import { Task } from '@/types'
import React, { useState } from 'react'
import { Button } from '../ui/button'
import {
  Share2,
  Maximize2,
  MoreHorizontal,
  Trash2,
  Link,
  ArrowRightToLine,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../ui/dropdown-menu'
import { router } from '@inertiajs/react'
import AppTooltip from '../app-tooltip'
import AppFileUpload from '../app-file-upload'

interface TaskActionsProps {
  task: Task
  onOpenChange: (open: boolean) => void
  setFullScreen: (fullScreen: boolean) => void
  fullScreen: boolean
}

const TaskActions = ({
  task,
  onOpenChange,
  setFullScreen,
  fullScreen,
}: TaskActionsProps) => {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      router.delete(`/tasks/${task.id}`)
      onOpenChange(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <AppTooltip content="Share task">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Share2 className="h-4 w-4" />
        </Button>
      </AppTooltip>

      <AppFileUpload workspaceId={task.workspace_id} mediableId={task.id} mediableType="task" />

      <AppTooltip content="Copy task link">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Link className="h-4 w-4" />
        </Button>
      </AppTooltip>

      <AppTooltip content="Open in full screen">
        <Button
          onClick={() => setFullScreen(!fullScreen)}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </AppTooltip>

      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <AppTooltip content="More actions" open={menuOpen ? false : undefined}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
        </AppTooltip>

        <DropdownMenuContent align="end" className="z-[9999]">
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AppTooltip content="Close">
        <Button
          onClick={() => onOpenChange(false)}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <ArrowRightToLine className="h-4 w-4" />
        </Button>
      </AppTooltip>
    </div>
  )
}

export default TaskActions
