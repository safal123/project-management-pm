import { Project } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, FileText, Clock } from 'lucide-react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface ProjectOverviewProps {
  project: Project;
}

export default function ProjectOverview({ project }: ProjectOverviewProps) {
  const handleDeleteProject = () => {
    if (confirm('Are you sure you want to delete this project?')) {
      router.delete(route('projects.destroy', { project: project.slug }), {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Project deleted successfully');
        },
        onError: () => {
          toast.error('Failed to delete project');
        },
      });
    }
  };

  return (
    <div className="space-y-6">
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
              {new Date(project.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(project.created_at).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}
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
              <Badge variant="secondary" className="w-fit font-mono">
                {project.slug}
              </Badge>
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
              <p className="text-xs text-muted-foreground">
                Once you delete a project, there is no going back. Please be certain.
              </p>
            </div>
            <Button onClick={handleDeleteProject} variant="destructive" size="sm">
              Delete Project
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
