import AppLayout from '@/layouts/app-layout';
import { Project, SharedData, Task, type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, User, FileText, LayoutDashboard, Kanban, ListTodo, CheckCircle2, AlertCircle, Clock, Users as UsersIcon, TrendingUp, BarChart3 } from 'lucide-react';
import { KanbanBoard } from '@/components/projects/kanban/kanban-board';
import { InviteMembersModal } from '@/components/projects/invite-members-modal';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import AppAvatar from '@/components/app-avatar';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';

export default function ProjectShow() {
  const { project, tasks } = usePage<SharedData & { project: Project; tasks: Task[] }>().props;
  const url = usePage().url;
  const params = new URLSearchParams(url.split('?')[1]);
  const activeTab = params.get('tab') ?? 'board';
  const [currentTab, setCurrentTab] = useState(activeTab);

  // Dashboard calculations
  const stats = useMemo(() => {
    const parentTasks = tasks.filter(t => t.parent_task_id === null);
    const subTasks = tasks.filter(t => t.parent_task_id !== null);
    const totalTasks = subTasks.length;

    // Assume last column is 'Done' if there's no explicit status
    const lastColumnId = parentTasks[parentTasks.length - 1]?.id;
    const completedTasks = subTasks.filter(t => t.parent_task_id === lastColumnId).length;

    const inProgressTasks = subTasks.length - completedTasks;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const priorityCounts = {
      High: subTasks.filter(t => t.priority === 'High').length,
      Medium: subTasks.filter(t => t.priority === 'Medium' || t.priority === 'Med').length,
      Low: subTasks.filter(t => t.priority === 'Low').length,
    };

    const upcomingTasks = subTasks
      .filter(t => t.due_date && new Date(t.due_date) >= new Date())
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
      .slice(0, 5);

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      progressPercentage,
      priorityCounts,
      upcomingTasks,
      parentTasks,
      subTasks,
      teamCount: project.users?.length || 1
    };
  }, [tasks, project]);

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Projects',
      href: '/projects',
    },
    {
      title: project.name,
      href: `/projects/${project.slug}`,
    },
  ];

  const handleDeleteProject = () => {
    if (confirm('Are you sure you want to delete this project?')) {
      router.delete(route('projects.destroy', { project: project.slug }), {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Project deleted successfully')
        },
        onError: () => {
          toast.error('Failed to delete project')
        },
      })
    }
  }

  function setParam(key: string, value: string) {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.replaceState({}, '', url);
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={project.name} />

      <div className="h-full flex flex-col">
        <Tabs
          value={currentTab}
          onValueChange={(value) => {
            setCurrentTab(value);
            setParam('tab', value);
          }}
          className="flex-1 flex flex-col">
          <div className="p-6 flex items-center justify-between border-b bg-background/50 backdrop-blur-md sticky top-0 z-20">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="board" className="gap-2 data-[state=active]:bg-background">
                <Kanban className="h-4 w-4" />
                Board
              </TabsTrigger>
              <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-background">
                <ListTodo className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="gap-2 data-[state=active]:bg-background">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
            </TabsList>
            <InviteMembersModal />
          </div>

          <TabsContent value="board" className="flex-1 overflow-hidden focus-visible:outline-none">
            <KanbanBoard />
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 px-6 py-6 focus-visible:outline-none overflow-y-auto">
            {/* Project Info Cards */}
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="overflow-hidden border-primary/10 bg-gradient-to-br from-background to-primary/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Project ID</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-mono text-primary font-bold">{project.id}</div>
                  <p className="text-xs text-muted-foreground mt-1">Unique identifier</p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-primary/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Created</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-medium">
                    {new Date(project.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(project.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-primary/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Created By</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-medium">User #{project.created_by}</div>
                  <p className="text-xs text-muted-foreground mt-1">Project owner</p>
                </CardContent>
              </Card>
            </div>

            {/* Project Details */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                  <CardDescription>Basic information about this project</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-1">
                    <label className="text-sm font-semibold">Project Name</label>
                    <p className="text-sm text-muted-foreground">{project.name}</p>
                  </div>
                  <div className="grid gap-1">
                    <label className="text-sm font-semibold">Slug</label>
                    <Badge variant="secondary" className="w-fit font-mono">{project.slug}</Badge>
                  </div>
                  <div className="grid gap-1">
                    <label className="text-sm font-semibold">Description</label>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {project.description || 'No description provided'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest changes in the project</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="p-3 bg-muted rounded-full w-fit mx-auto mb-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Start by adding some tasks to the board
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 border-destructive/20 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>Actions that cannot be undone</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Delete this project</p>
                    <p className="text-xs text-muted-foreground">Once you delete a project, there is no going back. Please be certain.</p>
                  </div>
                  <Button onClick={() => handleDeleteProject()} variant="destructive" size="sm">
                    Delete Project
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 px-6 py-6 focus-visible:outline-none overflow-y-auto">
            {/* Summary Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="relative overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Tasks</CardTitle>
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <ListTodo className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalTasks}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    <span>Active workspace</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">In Progress</CardTitle>
                  <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                    <Kanban className="h-4 w-4 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.inProgressTasks}</div>
                  <p className="text-xs text-muted-foreground mt-1">Pending review</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Completed</CardTitle>
                  <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-600">{stats.completedTasks}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stats.progressPercentage}% completion rate</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Team Size</CardTitle>
                  <div className="p-2 bg-amber-500/10 rounded-lg group-hover:bg-amber-500/20 transition-colors">
                    <UsersIcon className="h-4 w-4 text-amber-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.teamCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">Active contributors</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-7">
              {/* Overall Progress */}
              <Card className="lg:col-span-4">
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
                      const count = stats.subTasks.filter(t => t.parent_task_id === column.id).length;
                      const percentage = stats.totalTasks > 0 ? (count / stats.totalTasks) * 100 : 0;
                      return (
                        <div key={column.id} className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-muted-foreground uppercase">{column.name}</span>
                            <span className="font-medium">{count} tasks</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Progress value={percentage} className="flex-1 h-1.5" />
                            <span className="text-[10px] font-mono w-8 text-right text-muted-foreground">{Math.round(percentage)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Priority & Team */}
              <div className="lg:col-span-3 space-y-6">
                <Card>
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

                <Card>
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
                          <Badge variant="outline" className="text-[10px] h-5">Member</Badge>
                        </div>
                      ))}
                      {!project.users?.length && (
                        <div className="flex items-center gap-3">
                          <AppAvatar name="Project Owner" size="sm" />
                          <p className="text-sm text-muted-foreground">Owner (You)</p>
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" className="w-full mt-4 text-primary text-xs h-8 hover:bg-primary/5" asChild>
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
            <Card>
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
                          <p className="text-sm font-semibold group-hover:text-primary transition-colors cursor-pointer">{task.name}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px] h-4.5">{task.priority}</Badge>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Due {new Date(task.due_date!).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8">View Task</Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Calendar className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No upcoming deadlines found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

