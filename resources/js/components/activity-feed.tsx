import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { History, LoaderCircle } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import AppEmpty from '@/components/app-empty';
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
      <div className={`flex items-center justify-center py-6 text-muted-foreground ${className}`}>
        <LoaderCircle className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className={className}>
        <AppEmpty
          title="No activity yet"
          description="Actions like creating, moving, commenting, and liking will show up here."
          icon={<History />}
        />
      </div>
    );
  }

  return (
    <ScrollArea className={`h-64 pr-3 -mr-3 ${className}`}>
      <div className="space-y-4 pb-1">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <Avatar className="h-6 w-6 flex-shrink-0">
              <AvatarImage src={activity.user?.avatar} alt={activity.user?.name} />
              <AvatarFallback className="text-xs">
                {activity.user?.name?.slice(0, 2).toUpperCase() ?? '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-sm">
              <span className="font-medium">{activity.user?.name ?? 'Someone'}</span>{' '}
              <span className="text-muted-foreground">{activity.description}</span>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
