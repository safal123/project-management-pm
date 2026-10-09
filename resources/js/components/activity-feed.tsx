import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import { ActivityTimeline } from '@/components/activity/activity-timeline';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity } from '@/types';

interface ActivityFeedProps {
  subjectType: 'task' | 'project' | 'event';
  subjectId: string;
  className?: string;
  active?: boolean;
}

export default function ActivityFeed({
  subjectType,
  subjectId,
  className = '',
  active = true,
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
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
    setIsLoading(true);
    setActivities([]);
    fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    if (!active) return;
    fetchActivities();
  }, [active, fetchActivities]);

  useEffect(() => {
    return router.on('success', () => {
      fetchActivities();
    });
  }, [fetchActivities]);

  if (isLoading && activities.length === 0) {
    return (
      <div className={`flex h-full items-center justify-center text-muted-foreground ${className}`}>
        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
      </div>
    );
  }

  return (
    <ScrollArea className={`h-full pr-2 ${className}`}>
      <ActivityTimeline
        activities={activities}
        emptyDescription="Creates, moves, and comments show up here."
      />
    </ScrollArea>
  );
}
