import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { History, LoaderCircle } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity } from '@/types';

interface ActivityFeedProps {
  subjectType: 'task' | 'project' | 'event';
  subjectId: string;
  className?: string;
}

export default function ActivityFeed({ subjectType, subjectId, className = '' }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get<{ data: Activity[] }>(route('activities.index'), {
        params: {
          subject_type: subjectType,
          subject_id: subjectId,
        },
      });
      setActivities(data.data);
    } catch (error) {
      console.error('Failed to load activity', error);
    } finally {
      setIsLoading(false);
    }
  }, [subjectType, subjectId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  if (isLoading) {
    return (
      <div className={`flex h-full items-center justify-center text-muted-foreground ${className}`}>
        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className={`flex h-full flex-col items-center justify-center gap-1 text-center ${className}`}>
        <History className="h-4 w-4 text-muted-foreground" />
        <p className="text-[13px] font-medium">No activity yet</p>
        <p className="text-[12px] text-muted-foreground">Creates, moves, and comments show up here.</p>
      </div>
    );
  }

  return (
    <ScrollArea className={`h-full pr-2 ${className}`}>
      <div className="space-y-3 pb-1">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-2">
            <Avatar className="h-6 w-6 flex-shrink-0">
              <AvatarImage src={activity.user?.avatar} alt={activity.user?.name} />
              <AvatarFallback className="text-[10px]">
                {activity.user?.name?.slice(0, 2).toUpperCase() ?? '?'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 text-[13px]">
              <span className="font-medium">{activity.user?.name ?? 'Someone'}</span>{' '}
              <span className="text-muted-foreground">{activity.description}</span>
              <div className="text-[11px] text-muted-foreground">
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
