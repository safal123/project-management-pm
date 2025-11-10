import AppLayout from '@/layouts/app-layout';
import { Project, SharedData, Workspace, type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderKanban, Briefcase, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
];

export default function Dashboard() {
  const { projects, workspaces, auth } = usePage<SharedData>().props as { projects: Project[], workspaces: Workspace[] };
  const recentProjects = projects?.slice(0, 3) || [];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />

      <div className="px-12 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {auth.user.name}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's what's happening with your projects today
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active in workspace
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workspaces</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workspaces?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Available workspaces
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Workspace</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold line-clamp-1">
                {auth.user.current_workspace?.name || 'None'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Active workspace
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>Your latest projects at a glance</CardDescription>
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
            {recentProjects.length > 0 ? (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.slug}`}
                  >
                    <div className="flex items-center gap-4 p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FolderKanban className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium line-clamp-1">{project.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {project.description || 'No description'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span className="whitespace-nowrap">
                          {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                  <FolderKanban className="h-8 w-8 text-primary" />
                </div>
                <p className="text-muted-foreground mb-4">No projects yet</p>
                <Button size="sm" asChild>
                  <Link href="/projects">Create Your First Project</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
