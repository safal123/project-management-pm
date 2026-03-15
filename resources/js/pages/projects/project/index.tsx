import AppLayout from '@/layouts/app-layout';
import { PaginatedData, Project, SharedData, Task, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Kanban, ListTodo, TableIcon } from 'lucide-react';
import { KanbanBoard } from '@/components/projects/kanban/kanban-board';
import { InviteMembersModal } from '@/components/projects/invite-members-modal';
import { MembersModal } from '@/components/projects/members-modal';
import { useState } from 'react';
import ProjectOverview from '@/components/projects/project-overview';
import ProjectDashboard from '@/components/projects/project-dashboard';
import TasksTable from '@/components/projects/tasks-table';

export default function ProjectShow() {
  const { project, tasks, paginatedTasks } = usePage<SharedData & { project: Project; tasks: Task[]; paginatedTasks?: PaginatedData<Task> }>().props;
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
                route('projects.tasks', { project: project.slug }),
                { tab: 'table' },
                { preserveState: true, preserveScroll: true, only: ['paginatedTasks'] }
              );
            }
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
              <TabsTrigger value="table" className="gap-2 data-[state=active]:bg-background">
                <TableIcon className="h-4 w-4" />
                Table
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <MembersModal />
              <InviteMembersModal />
            </div>
          </div>

          <TabsContent value="board" className="flex-1 overflow-hidden focus-visible:outline-none">
            <KanbanBoard />
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 px-6 py-6 focus-visible:outline-none overflow-y-auto">
            <ProjectOverview project={project} />
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 px-6 py-6 focus-visible:outline-none overflow-y-auto">
            <ProjectDashboard project={project} tasks={tasks} />
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

