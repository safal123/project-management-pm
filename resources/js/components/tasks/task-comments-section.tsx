import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Task } from '@/types';
import TaskComments from './task-comments';
import TaskCollaborators from './task-collaborators';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskCommentsSectionProps {
  task: Task;
  className?: string;
}

export default function TaskCommentsSection({ task, className = '' }: TaskCommentsSectionProps) {
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const handleSortChange = (order: 'newest' | 'oldest') => {
    // TODO: Implement sort change functionality
    setSortOrder(order);
    console.log('Change sort order', order);
  };

  return (
    <div className={`flex-shrink-0 border-t bg-background ${className}`}>
      <Tabs defaultValue="comments" className="w-full">
        <div className="flex items-center justify-between px-6 py-3 border-b">
          <TabsList>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="activity">All activity</TabsTrigger>
          </TabsList>
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
        </div>

        <TabsContent value="comments" className="space-y-4 m-0 px-6 py-4">
          <TaskComments task={task} />
          <TaskCollaborators task={task} />
        </TabsContent>

        <TabsContent value="activity" className="px-6 py-4 m-0">
          <p className="text-sm text-muted-foreground text-center py-8">No activity yet</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

