import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Task } from '@/types'
import TaskComments from './task-comments'
import TaskCollaborators from './task-collaborators'
import ActivityFeed from '@/components/activity-feed'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const TAB_TRIGGER_CLASS =
  'h-8 rounded-none border-b-2 border-transparent px-2.5 text-[12px] text-muted-foreground shadow-none hover:text-foreground data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none'

interface TaskCommentsSectionProps {
  task: Task
  className?: string
  open?: boolean
}

export default function TaskCommentsSection({ task, className = '', open = true }: TaskCommentsSectionProps) {
  const [tab, setTab] = useState('comments')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

  return (
    <div className={`flex min-h-0 flex-col bg-muted/20 ${className}`}>
      <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col">
        <div className="flex h-10 shrink-0 items-center justify-between border-b px-2.5">
          <TabsList className="h-auto gap-0.5 rounded-none bg-transparent p-0">
            <TabsTrigger value="comments" className={TAB_TRIGGER_CLASS}>
              Comments
              {!!task.comments_count && (
                <span className="text-muted-foreground">({task.comments_count})</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="activity" className={TAB_TRIGGER_CLASS}>
              Activity
            </TabsTrigger>
          </TabsList>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[11px] text-muted-foreground">
                {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
                {sortOrder === 'newest' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-[9999] text-[13px]">
              <DropdownMenuItem onClick={() => setSortOrder('newest')}>Newest</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder('oldest')}>Oldest</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <TabsContent value="comments" className="m-0 min-h-0 flex-1 overflow-hidden p-2.5">
          <div className="flex h-full flex-col gap-2">
            <TaskComments task={task} className="min-h-0 flex-1" />
            <TaskCollaborators task={task} />
          </div>
        </TabsContent>
        <TabsContent value="activity" forceMount className="m-0 min-h-0 flex-1 overflow-hidden p-2.5 data-[state=inactive]:hidden">
          <ActivityFeed
            subjectType="task"
            subjectId={task.id}
            active={open && tab === 'activity'}
            className="h-full"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
