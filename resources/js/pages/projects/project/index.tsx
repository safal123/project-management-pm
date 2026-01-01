import AppLayout from '@/layouts/app-layout';
import { Project, SharedData, Task, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, User, FileText, LayoutDashboard, Kanban, ListTodo } from 'lucide-react';
import { KanbanBoard } from '@/components/projects/kanban/kanban-board';
import { InviteMembersModal } from '@/components/projects/invite-members-modal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ProjectShow() {
  const { project } = usePage<SharedData & { project: Project; tasks: Task[] }>().props;

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

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={project.name} />

      <div className="h-full flex flex-col">
        {/* Tabs */}
        <Tabs defaultValue="board" className="flex-1 flex flex-col">
          <div className="p-6 flex items-center justify-between border-b dark:bg-primary/5">
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
            <InviteMembersModal />
          </div>

          <TabsContent value="board" className="flex-1 overflow-hidden">
            <KanbanBoard />
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 px-6">
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
              {/* Danger Zone */}
              <Card className="dark:border-red-900 border-red-300">
                <CardHeader>
                  <CardTitle>Danger Zone</CardTitle>
                  <CardDescription>Dangerous actions that can be taken in this project</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => handleDeleteProject()} variant="destructive">Delete Project</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 px-6">
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

