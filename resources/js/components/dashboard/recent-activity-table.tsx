import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from '@inertiajs/react';
import { ArrowRight, BarChart, ListTodo } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import AppEmpty from '@/components/app-empty';
import { STATUS_BADGE_COLORS } from '@/utils/app-utils';

interface RecentTask {
  id: string;
  title: string;
  status: string | null;
  priority: string | null;
  due_date: string | null;
  project: { id: string; name: string; slug: string } | null;
  assigned_to: { id: string; name: string; avatar?: string } | null;
  updated_at: string;
}

interface RecentActivityTableProps {
  tasks: RecentTask[];
}

export function RecentActivityTable({ tasks }: RecentActivityTableProps) {
  const hasTasks = tasks?.length > 0;

  return (
    <Card className="lg:col-span-2 dark:bg-primary/5 dark:border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest task updates across projects
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/projects">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {hasTasks ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead className="text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <Link
                      href={`/projects/${task.project?.slug}/tasks`}
                      className="font-medium hover:underline"
                    >
                      {task.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {task.project ? (
                      <Link
                        href={`/projects/${task.project.slug}`}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {task.project.name}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        'capitalize',
                        STATUS_BADGE_COLORS[task.status || 'todo']
                      )}
                    >
                      {(task.status || 'todo').replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {task.assigned_to ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={task.assigned_to.avatar}
                            alt={task.assigned_to.name}
                          />
                          <AvatarFallback className="text-xs">
                            {task.assigned_to.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {task.assigned_to.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDistanceToNow(new Date(task.updated_at), {
                      addSuffix: true,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <AppEmpty
            title="No tasks yet"
            description="Create a project and add tasks to see the chart."
            icon={<ListTodo />}
          />
        )}
      </CardContent>
    </Card>
  );
}
