import AppLayout from '@/layouts/app-layout';
import { PaginatedData, Project, SharedData, Task, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Kanban, Settings, TableIcon } from 'lucide-react';
import { KanbanBoard } from '@/components/projects/kanban/kanban-board';
import { InviteMembersModal } from '@/components/modals/invite-members-modal';
import { MembersModal } from '@/components/modals/members-modal';
import { useState } from 'react';
import ProjectSettings from '@/components/projects/project-settings';
import ProjectDashboard from '@/components/projects/project-dashboard';
import TasksTable from '@/components/projects/tasks-table';
import Can from '@/components/can';

export default function ProjectShow() {
  const { project, tasks, paginatedTasks } = usePage<SharedData & { project: Project; tasks: any; paginatedTasks?: PaginatedData<Task> }>().props;
  const url = usePage().url;
  const params = new URLSearchParams(url.split('?')[1]);
  const activeTab = params.get('tab') ?? 'board';
  const [currentTab, setCurrentTab] = useState(activeTab);

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
            if (value === 'table' && !paginatedTasks) {
              router.get(
                route('projects.show', { project: project.slug }),
                { tab: 'table' },
                { preserveState: true, preserveScroll: true, only: ['paginatedTasks'] }
              );
            }
          }}
          className="flex-1 flex flex-col">
          <div className="px-6 pt-4 flex items-center justify-between border-b sticky top-0 z-20 bg-background">
            <TabsList className="h-auto gap-1 rounded-none bg-transparent p-0">
              <TabsTrigger
                value="board"
                className="gap-2 rounded-none border-b-2 border-transparent px-3 pt-1 pb-4 text-muted-foreground shadow-none transition-colors data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none hover:text-foreground"
              >
                <Kanban className="h-4 w-4" />
                Board
              </TabsTrigger>
              <TabsTrigger
                value="table"
                className="gap-2 rounded-none border-b-2 border-transparent px-3 pt-1 pb-4 text-muted-foreground shadow-none transition-colors data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none hover:text-foreground"
              >
                <TableIcon className="h-4 w-4" />
                Table
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="gap-2 rounded-none border-b-2 border-transparent px-3 pt-1 pb-4 text-muted-foreground shadow-none transition-colors data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger
                value="dashboard"
                className="gap-2 rounded-none border-b-2 border-transparent px-3 pt-1 pb-4 text-muted-foreground shadow-none transition-colors data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none hover:text-foreground"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2 pb-4">
              <Can permission="project.view_members">
                <MembersModal />
              </Can>
              <Can permission="project.invite_members">
                <InviteMembersModal />
              </Can>
            </div>
          </div>

          <TabsContent value="board" className="flex-1 overflow-hidden focus-visible:outline-none">
            <KanbanBoard />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 px-6 py-6 focus-visible:outline-none overflow-y-auto">
            <ProjectSettings project={project} />
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 px-6 py-6 focus-visible:outline-none overflow-y-auto">
            <ProjectDashboard project={project} tasks={tasks.data} />
          </TabsContent>

          {/* Table Tab */}
          <TabsContent value="table" className="space-y-6 px-6 py-6 focus-visible:outline-none overflow-y-auto">
            <TasksTable paginatedTasks={paginatedTasks ?? null} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

