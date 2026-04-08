import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ArrowRight, Calendar, FolderKanban } from 'lucide-react';
import AppEmpty from '@/components/app-empty';
import { ProjectModal } from '@/components/modals/project-modal';
import type { Project } from '@/types';

interface RecentProjectsProps {
  projects: Project[];
}

export function RecentProjects({ projects }: RecentProjectsProps) {
  const recentProjects = projects?.slice(0, 4) || [];
  const hasProjects = recentProjects.length > 0;

  return (
    <Card className="dark:bg-primary/5 dark:border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Your latest projects</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/projects">
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {hasProjects ? (
          <div className="flex flex-col gap-3">
            {recentProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:border-primary/50 hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <FolderKanban className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{project.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {project.description || 'No description'}
                  </p>
                </div>
                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        ) : (
          <AppEmpty
            title="No projects yet"
            description="Create your first project to get started"
            icon={<FolderKanban className="text-primary" />}
            action={<ProjectModal />}
          />
        )}
      </CardContent>
    </Card>
  );
}
