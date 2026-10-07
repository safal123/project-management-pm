import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown, ChevronUp, PanelBottomClose, PanelBottomOpen } from 'lucide-react';
import { Task } from '@/types';
import TaskComments from './task-comments';
import TaskCollaborators from './task-collaborators';
import ActivityFeed from '@/components/activity-feed';
import AppTooltip from '@/components/app-tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const TAB_TRIGGER_CLASS =
  'gap-2 rounded-none border-b-2 border-transparent px-3 pt-1 pb-3 text-muted-foreground shadow-none transition-colors data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none hover:text-foreground';

interface TaskCommentsSectionProps {
  task: Task;
  className?: string;
}

export default function TaskCommentsSection({ task, className = '' }: TaskCommentsSectionProps) {
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [collapsed, setCollapsed] = useState(false);

  const handleSortChange = (order: 'newest' | 'oldest') => {
    // TODO: Implement sort change functionality
    setSortOrder(order);
    console.log('Change sort order', order);
  };

  return (
    <div className={`flex-shrink-0 border-t bg-white dark:bg-background ${className}`}>
      <Tabs defaultValue="comments" className="w-full">
        <div className="flex items-center justify-between px-6 border-b">
          <TabsList className="h-auto gap-1 rounded-none bg-transparent p-0">
            <TabsTrigger value="comments" className={TAB_TRIGGER_CLASS}>
              Comments
              {!!task.comments_count && (
                <span className="ml-1 text-muted-foreground">({task.comments_count})</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="activity" className={TAB_TRIGGER_CLASS}>
              All activity
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2 py-2">
            {!collapsed && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-muted-foreground"
                    onClick={() => handleSortChange('newest')}
                  >
                    {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
                    {sortOrder === 'newest' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => handleSortChange('newest')}>Newest</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange('oldest')}>Oldest</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <AppTooltip content={collapsed ? 'Expand panel' : 'Collapse panel'} side="top">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setCollapsed((prev) => !prev)}
              >
                {collapsed ? (
                  <PanelBottomOpen className="h-4 w-4" />
                ) : (
                  <PanelBottomClose className="h-4 w-4" />
                )}
              </Button>
            </AppTooltip>
          </div>
        </div>

        {!collapsed && (
          <>
            <TabsContent value="comments" className="space-y-4 m-0 px-6 py-4 dark:bg-primary/5">
              <TaskComments task={task} />
              <TaskCollaborators task={task} />
            </TabsContent>

            <TabsContent value="activity" className="px-6 py-4 m-0">
              <ActivityFeed subjectType="task" subjectId={task.id} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

