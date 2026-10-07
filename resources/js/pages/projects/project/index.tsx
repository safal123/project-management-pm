import AppLayout from '@/layouts/app-layout';
import { PaginatedData, Project, SharedData, Task, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Kanban, Settings, TableIcon, CalendarDays } from 'lucide-react';
import { KanbanBoard } from '@/components/projects/kanban/kanban-board';
import { InviteMembersModal } from '@/components/modals/invite-members-modal';
import { MembersModal } from '@/components/modals/members-modal';
import { useState } from 'react';
import ProjectSettings from '@/components/projects/project-settings';
import TasksTable from '@/components/projects/tasks-table';
import { CalendarPage } from '@/components/calendar/calendar-page';
import Can from '@/components/can';

const tabTriggerClass =
  'gap-1.5 rounded-none border-b-2 border-transparent px-2.5 pt-1 pb-2 text-[13px] text-muted-foreground shadow-none transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none';

export default function ProjectShow() {
  const { project, paginatedTasks } = usePage<SharedData & { project: Project; tasks: any; paginatedTasks?: PaginatedData<Task> }>().props;
  const url = usePage().url;
  const params = new URLSearchParams(url.split('?')[1]);
  const requestedTab = params.get('tab') ?? 'board';
  const activeTab = requestedTab === 'dashboard' ? 'board' : requestedTab;
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
    const next = new URL(window.location.href);
    next.searchParams.set(key, value);
    window.history.replaceState({}, '', next);
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={project.name} />

      <div className="flex h-full flex-col">
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
            if (value === 'calendar') {
              router.get(
                route('projects.show', { project: project.slug }),
                { tab: 'calendar' },
                {
                  preserveState: true,
                  preserveScroll: true,
                  only: ['calendarEvents', 'tableEvents', 'dueDateCards', 'filters', 'members', 'tasks'],
                }
              );
            }
          }}
          className="flex flex-1 flex-col"
        >
          <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-background px-4 pt-2 lg:px-6">
            <TabsList className="h-auto gap-0.5 rounded-none bg-transparent p-0">
              <TabsTrigger value="board" className={tabTriggerClass}>
                <Kanban className="h-3.5 w-3.5" />
                Board
              </TabsTrigger>
              <TabsTrigger value="table" className={tabTriggerClass}>
                <TableIcon className="h-3.5 w-3.5" />
                Table
              </TabsTrigger>
              <TabsTrigger value="calendar" className={tabTriggerClass}>
                <CalendarDays className="h-3.5 w-3.5" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="settings" className={tabTriggerClass}>
                <Settings className="h-3.5 w-3.5" />
                Settings
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-1.5 pb-2">
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

          <TabsContent value="table" className="space-y-4 overflow-y-auto px-4 py-4 focus-visible:outline-none lg:px-6">
            <TasksTable paginatedTasks={paginatedTasks ?? null} />
          </TabsContent>

          <TabsContent value="calendar" className="mt-0 flex-1 overflow-hidden focus-visible:outline-none">
            <CalendarPage />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 overflow-y-auto px-4 py-4 focus-visible:outline-none lg:px-6">
            <ProjectSettings project={project} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
