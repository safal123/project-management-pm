import { Project } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Github, ExternalLink } from 'lucide-react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { ConnectGitModal } from '@/components/modals/connect-git-modal';
import { formatDateTime } from '@/utils/app-utils';

interface ProjectSettingsProps {
  project: Project;
}

export default function ProjectSettings({ project }: ProjectSettingsProps) {
  const gitIntegration = project.git_integration;

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

  const handleDisconnectGit = () => {
    if (!confirm(`Disconnect ${gitIntegration?.repo_full_name}? Existing task branches will keep their links.`)) {
      return;
    }

    router.delete(route('git-integrations.destroy', { project: project.slug }), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Repository disconnected');
      },
      onError: () => {
        toast.error('Failed to disconnect repository');
      },
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* GitHub Integration */}
      <Card className="dark:bg-primary/5 dark:border-primary/20">
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>Connect external tools to this project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                <Github className="h-5 w-5" />
              </div>
              {gitIntegration ? (
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <a
                      href={gitIntegration.repo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium hover:underline flex items-center gap-1 truncate"
                    >
                      {gitIntegration.repo_full_name}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                    <Badge variant="outline" className="text-xs font-mono shrink-0">
                      {gitIntegration.default_branch}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    Connected by {gitIntegration.connected_by?.name ?? 'a member'} on{' '}
                    {formatDateTime(gitIntegration.connected_at)} · Token {gitIntegration.masked_token}
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">GitHub</p>
                  <p className="text-xs text-muted-foreground">
                    Connect a repository so tasks can spawn real branches
                  </p>
                </div>
              )}
            </div>
            {gitIntegration ? (
              <Button
                onClick={handleDisconnectGit}
                variant="outline"
                size="sm"
                className="gap-2 text-destructive hover:text-destructive shrink-0"
              >
                Disconnect
              </Button>
            ) : (
              <ConnectGitModal
                project={project}
                trigger={
                  <Button variant="outline" size="sm" className="gap-2 shrink-0">
                    <Github className="h-4 w-4" />
                    Connect GitHub
                  </Button>
                }
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/20 bg-destructive/5">
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
  );
}
