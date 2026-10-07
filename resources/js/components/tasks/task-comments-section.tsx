import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChevronDown, ChevronUp, PanelBottomClose, PanelBottomOpen } from 'lucide-react'
import { Task } from '@/types'
import TaskComments from './task-comments'
import TaskCollaborators from './task-collaborators'
import ActivityFeed from '@/components/activity-feed'
import AppTooltip from '@/components/app-tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const TAB_TRIGGER_CLASS =
  'gap-1.5 rounded-none border-b-2 border-transparent px-2.5 pt-1 pb-2 text-[13px] text-muted-foreground shadow-none transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none'

const PANEL_CLASS = 'm-0 h-[220px] overflow-hidden px-3 py-2.5'

interface TaskCommentsSectionProps {
  task: Task
  className?: string
}

export default function TaskCommentsSection({ task, className = '' }: TaskCommentsSectionProps) {
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={`shrink-0 border-t bg-muted/20 ${className}`}>
      <Tabs defaultValue="comments" className="w-full">
        <div className="flex h-10 items-center justify-between border-b px-3">
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
          <div className="flex items-center gap-1">
            {!collapsed && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 px-2 text-[12px] text-muted-foreground">
                    {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
                    {sortOrder === 'newest' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-[9999] text-[13px]">
                  <DropdownMenuItem onClick={() => setSortOrder('newest')}>Newest</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder('oldest')}>Oldest</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <AppTooltip content={collapsed ? 'Expand panel' : 'Collapse panel'} side="top">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => setCollapsed((prev) => !prev)}
              >
                {collapsed ? <PanelBottomOpen className="h-3.5 w-3.5" /> : <PanelBottomClose className="h-3.5 w-3.5" />}
              </Button>
            </AppTooltip>
          </div>
        </div>

        {!collapsed && (
          <>
            <TabsContent value="comments" className={PANEL_CLASS}>
              <div className="flex h-full flex-col gap-2">
                <TaskComments task={task} className="min-h-0 flex-1" />
                <TaskCollaborators task={task} />
              </div>
            </TabsContent>
            <TabsContent value="activity" className={PANEL_CLASS}>
              <ActivityFeed subjectType="task" subjectId={task.id} className="h-full" />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}
