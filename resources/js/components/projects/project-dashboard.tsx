import { Project, Task } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  ListTodo,
  Kanban,
  CheckCircle2,
  Users as UsersIcon,
  AlertCircle,
  Clock,
  BarChart3,
  Calendar,
} from 'lucide-react';
import AppAvatar from '@/components/app-avatar';
import { Link } from '@inertiajs/react';
import { useMemo } from 'react';
import AppEmpty from '@/components/app-empty';
import { AppStatCard } from '@/components/app-stat-card';

interface ProjectDashboardProps {
  project: Project;
  tasks: Task[]
}

export default function ProjectDashboard({ project, tasks }: ProjectDashboardProps) {
  const stats = useMemo(() => {
    const parentTasks = tasks.filter((t) => t.parent_task_id === null);
    const subTasks = tasks.filter((t) => t.parent_task_id !== null);
    const totalTasks = subTasks.length;

    const lastColumnId = parentTasks[parentTasks.length - 1]?.id;
    const completedTasks = subTasks.filter((t) => t.parent_task_id === lastColumnId).length;

    const inProgressTasks = subTasks.length - completedTasks;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const priorityCounts = {
      High: subTasks.filter((t) => t.priority === 'High').length,
      Medium: subTasks.filter((t) => t.priority === 'Medium' || t.priority === 'Med').length,
      Low: subTasks.filter((t) => t.priority === 'Low').length,
    };

    const upcomingTasks = subTasks
      .filter((t) => t.due_date && new Date(t.due_date) >= new Date())
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
      .slice(0, 5);

    const teamCount = project.users?.length || 1;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      progressPercentage,
      priorityCounts,
      upcomingTasks,
      teamCount,
      parentTasks,
      subTasks,
    };
  }, [tasks, project.users]);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <AppStatCard
          title="In Progress"
          value={stats.inProgressTasks}
          description="Pending review"
          icon={Kanban}
          iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />

        <AppStatCard
          title="Completed"
          value={stats.completedTasks}
          description="Completed tasks"
          icon={CheckCircle2}
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />

        <AppStatCard
          title="Team Size"
          value={stats.teamCount}
          description="Active contributors"
          icon={UsersIcon}
          iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />

        <AppStatCard
          title="Total Tasks"
          value={stats.totalTasks}
          description="Total tasks"
          icon={ListTodo}
          iconClassName="bg-muted text-muted-foreground"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Overall Progress */}
        <Card className="lg:col-span-4 dark:bg-primary/5 dark:border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Project Performance</CardTitle>
                <CardDescription>Task distribution across your board</CardDescription>
              </div>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-8 pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Overall Progress</span>
                <span className="text-primary font-bold">{stats.progressPercentage}%</span>
              </div>
              <Progress value={stats.progressPercentage} className="h-3" />
            </div>

            <div className="grid gap-6">
              {stats.parentTasks.map((column) => {
                const count = stats.subTasks.filter((t) => t.parent_task_id === column.id).length;
                const percentage = stats.totalTasks > 0 ? (count / stats.totalTasks) * 100 : 0;
                return (
                  <div key={column.id} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-muted-foreground uppercase">{column.name}</span>
                      <span className="font-medium">{count} tasks</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={percentage} className="flex-1 h-1.5" />
                      <span className="text-[10px] font-mono w-8 text-right text-muted-foreground">
                        {Math.round(percentage)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Priority & Team */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="dark:bg-primary/5 dark:border-primary/20">
            <CardHeader>
              <CardTitle>Priority Overview</CardTitle>
              <CardDescription>Urgency levels of current tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="flex items-center justify-between p-3 rounded-lg border border-destructive/10 bg-destructive/5">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium">High Priority</span>
                </div>
                <Badge variant="destructive">{stats.priorityCounts.High}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-amber-500/10 bg-amber-500/5">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">Medium Priority</span>
                </div>
                <Badge className="bg-amber-500 hover:bg-amber-600">{stats.priorityCounts.Medium}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-emerald-500/10 bg-emerald-500/5">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium">Low Priority</span>
                </div>
                <Badge className="bg-emerald-500 hover:bg-emerald-600">{stats.priorityCounts.Low}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-primary/5 dark:border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle>Team Members</CardTitle>
              <CardDescription>{project.users?.length || 1} people working on this</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.users?.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AppAvatar src={user.profile_picture?.url} name={user.name} size="sm" />
                      <div className="grid gap-0.5">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] h-5">
                      Member
                    </Badge>
                  </div>
                ))}
                {!project.users?.length && (
                  <div className="flex items-center gap-3">
                    <AppAvatar name="Project Owner" size="sm" />
                    <p className="text-sm text-muted-foreground">Owner (You)</p>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                className="w-full mt-4 text-primary text-xs h-8 hover:bg-primary/5"
                asChild
              >
                <Link
                  href="#members"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    (document.querySelector('[data-invite-trigger]') as HTMLElement)?.click();
                  }}
                >
                  + Add Team Member
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <Card className="dark:bg-primary/5 dark:border-primary/20">
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
          <CardDescription>Tasks that need immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.upcomingTasks.length > 0 ? (
            <div className="divide-y">
              {stats.upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between py-4 group">
                  <div className="grid gap-1">
                    <p className="text-sm font-semibold group-hover:text-primary transition-colors cursor-pointer">
                      {task.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] h-4.5">
                        {task.priority}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Due {new Date(task.due_date!).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8">
                    View Task
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <AppEmpty title="No upcoming deadlines found" description="No upcoming deadlines found" icon={<Calendar />} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
