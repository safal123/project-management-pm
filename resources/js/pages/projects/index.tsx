import { ProjectModal } from '@/components/modals/project-modal';
import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem, Project, SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderKanban, Calendar, FolderCodeIcon } from 'lucide-react';
import Can from '@/components/can';
import AppEmpty from '@/components/app-empty';

const Projects = () => {
  const { projects } = usePage<SharedData & { projects: Project[] }>().props;
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Projects',
      href: '/projects',
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Projects" />

      <div className="px-12 py-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground mt-2">
              Manage and organize your projects in one place
            </p>
          </div>
          <Can permission="project.create">
            <ProjectModal triggerClassName="w-full md:w-fit" />
          </Can>
        </div>

        {/* Projects Grid */}
        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.slug}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-border hover:border-primary/50 h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FolderKanban className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      {/* Edit Button */}
                      <Can permission="project.update">
                        <div onClick={(e) => e.preventDefault()}>
                          <ProjectModal project={project} triggerVariant="ghost" />
                        </div>
                      </Can>
                    </div>
                    <CardTitle className="mt-4 line-clamp-1">{project.name}</CardTitle>
                    <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                      {project.description || 'No description provided'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Created {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <AppEmpty
            title="No projects yet."
            description="Get started by creating your first project to organize your work and collaborate with your team."
            icon={<FolderCodeIcon className='text-primary' />}
            action={<ProjectModal />}
          />
        )}
      </div>
    </AppLayout >
  )
}

export default Projects
