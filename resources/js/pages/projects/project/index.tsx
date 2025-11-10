import AppLayout from '@/layouts/app-layout';
import { Project, SharedData, Task, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, User, FileText, LayoutDashboard, Kanban, ListTodo } from 'lucide-react';
import KanbanBoard from '@/components/projects/kanban';
import KanbanV2 from '@/components/projects/kanban-v2';

export default function ProjectShow() {
  const { project, tasks } = usePage<SharedData & { project: Project; tasks: Task[] }>().props;

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

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={project.name} />

      <div className="h-full flex flex-col">
        {/* Tabs */}
        <Tabs defaultValue="board" className="flex-1 flex flex-col">
          <div className="px-12 pt-8 pb-4">
            <TabsList>
              <TabsTrigger value="board" className="gap-2">
                <Kanban className="h-4 w-4" />
                Board
              </TabsTrigger>
              <TabsTrigger value="overview" className="gap-2">
                <ListTodo className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Board Tab */}
          {/* <TabsContent value="board" className="flex-1 overflow-hidden">
            <div className="h-[calc(100vh-250px)] px-12 overflow-hidden">
              <div className="h-full overflow-x-auto overflow-y-hidden">
                <KanbanBoard tasks={tasks} project={project} />
              </div>
            </div>
          </TabsContent> */}
          <TabsContent value="board" className="flex-1 overflow-hidden">
            {/* <KanbanBoard tasks={tasks} project={project} /> */}
            <KanbanV2 />
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 px-12">
            {/* Project Info Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Project ID</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-mono">{project.id}</div>
                  <p className="text-xs text-muted-foreground mt-1">Unique identifier</p>
                </CardContent>
              </Card>

              <Card>
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

              <Card>
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
                  <div>
                    <label className="text-sm font-medium">Project Name</label>
                    <p className="text-sm text-muted-foreground mt-1">{project.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Slug</label>
                    <p className="text-sm text-muted-foreground mt-1 font-mono">{project.slug}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {project.description || 'No description provided'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activity</CardTitle>
                  <CardDescription>Recent activity in this project</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No activity yet</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Activity tracking coming soon
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 px-12">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                  <ListTodo className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground mt-1">No tasks created</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <Kanban className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground mt-1">Active tasks</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <ListTodo className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground mt-1">Finished tasks</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1</div>
                  <p className="text-xs text-muted-foreground mt-1">Project members</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Project Analytics</CardTitle>
                <CardDescription>Visual insights and metrics for your project</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16">
                  <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                    <LayoutDashboard className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Track your project progress with charts, graphs, and detailed analytics.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

