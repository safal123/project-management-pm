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
import { ArrowRight, ListTodo } from 'lucide-react';
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
    <Card className="gap-3 py-3.5 shadow-sm">
      <CardHeader className="px-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <CardTitle className="text-[13px] font-medium">Recent activity</CardTitle>
            <CardDescription className="text-xs">
              Latest task updates across projects
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px]" asChild>
            <Link href="/projects">
              View all
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4">
        {hasTasks ? (
          <Table className="text-[13px]">
            <TableHeader>
              <TableRow>
                <TableHead className="h-8 px-2 text-[11px]">Task</TableHead>
                <TableHead className="h-8 px-2 text-[11px]">Project</TableHead>
                <TableHead className="h-8 px-2 text-[11px]">Status</TableHead>
                <TableHead className="h-8 px-2 text-[11px]">Assigned</TableHead>
                <TableHead className="h-8 px-2 text-right text-[11px]">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="px-2 py-2">
                    <Link
                      href={`/projects/${task.project?.slug}/tasks`}
                      className="font-medium hover:underline"
                    >
                      {task.title}
                    </Link>
                  </TableCell>
                  <TableCell className="px-2 py-2">
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
                  <TableCell className="px-2 py-2">
                    <Badge
                      variant="secondary"
                      className={cn(
                        'px-1.5 py-0 text-[11px] capitalize',
                        STATUS_BADGE_COLORS[task.status || 'todo']
                      )}
                    >
                      {(task.status || 'todo').replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-2 py-2">
                    {task.assigned_to ? (
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-5 w-5">
                          <AvatarImage
                            src={task.assigned_to.avatar}
                            alt={task.assigned_to.name}
                          />
                          <AvatarFallback className="text-[10px]">
                            {task.assigned_to.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[13px]">
                          {task.assigned_to.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-2 py-2 text-right text-muted-foreground">
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
            description="Create a project and add tasks to see recent activity."
            icon={<ListTodo />}
          />
        )}
      </CardContent>
    </Card>
  );
}
