import { useEffect, useMemo, useState } from 'react'
import { ProjectModal } from '@/components/modals/project-modal'
import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem, Project, SharedData } from '@/types'
import { Head, Link, usePage } from '@inertiajs/react'
import { AppTable, type AppTableColumn } from '@/components/app-table'
import { FolderKanban, Calendar, FolderCodeIcon } from 'lucide-react'
import Can from '@/components/can'
import AppEmpty from '@/components/app-empty'
import { formatShortDate } from '@/utils/app-utils'

function ProjectRowActions({ row }: { row: Project; index: number }) {
  return (
    <Can permission="project.update">
      <div className="inline-flex justify-end" onClick={(e) => e.stopPropagation()}>
        <ProjectModal project={row} triggerVariant="ghost" />
      </div>
    </Can>
  )
}

const Projects = () => {
  const { projects } = usePage<SharedData & { projects: Project[] }>().props
  const [createModalOpen, setCreateModalOpen] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('create') === '1') {
      setCreateModalOpen(true)
      window.history.replaceState({}, '', '/projects')
    }
  }, [])
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Projects',
      href: '/projects',
    },
  ]

  const projectColumns = useMemo<AppTableColumn<Project>[]>(
    () => [
      {
        id: 'name',
        header: 'Name',
        headerClassName: 'min-w-[200px]',
        cellClassName: 'font-medium',
        render: (project) => (
          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex items-center gap-2 hover:underline"
          >
            <span className="rounded-md bg-muted p-1 text-foreground md:hidden">
              <FolderKanban className="h-3.5 w-3.5" />
            </span>
            <span className="line-clamp-1">{project.name}</span>
          </Link>
        ),
      },
      {
        id: 'description',
        header: 'Description',
        headerClassName: 'hidden md:table-cell',
        cellClassName: 'hidden max-w-md text-muted-foreground md:table-cell',
        render: (project) => (
          <span className="line-clamp-2">{project.description || '—'}</span>
        ),
      },
      {
        id: 'created',
        header: 'Created',
        headerClassName: 'w-[140px] whitespace-nowrap',
        cellClassName: 'whitespace-nowrap text-muted-foreground',
        render: (project) => (
          <span className="inline-flex items-center gap-1.5 text-[13px]">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            {formatShortDate(project.created_at)}
          </span>
        ),
      },
    ],
    []
  )

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Projects" />

      <div className="px-4 py-4 lg:px-6">
        <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Projects</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              Manage and organize your projects in one place
            </p>
          </div>
          <Can permission="project.create">
            <ProjectModal
              triggerClassName="h-8 w-full px-3 text-[13px] md:w-fit"
              open={createModalOpen}
              onOpenChange={setCreateModalOpen}
            />
          </Can>
        </div>

        {projects && projects.length > 0 ? (
          <AppTable
            items={projects}
            columns={projectColumns}
            action={ProjectRowActions}
            tableClassName="bg-background/10 shadow-sm rounded-md"
          />
        ) : (
          <AppEmpty
            title="No projects yet."
            description="Get started by creating your first project to organize your work and collaborate with your team."
            icon={<FolderCodeIcon className="text-primary" />}
            action={
              <Can permission="project.create">
                <ProjectModal />
              </Can>
            }
          />
        )}
      </div>
    </AppLayout>
  )
}

export default Projects
