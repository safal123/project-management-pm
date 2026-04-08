import AppLayout from '@/layouts/app-layout';
import {
  Project,
  SharedData,
  Workspace,
  type BreadcrumbItem,
} from '@/types';
import { Head, usePage } from '@inertiajs/react';
import {
  DashboardStats,
  TaskStatusChart,
  TasksByProjectChart,
  RecentActivityTable,
  RecentProjects,
  OverallProgress,
} from '@/components/dashboard';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
];

interface DashboardStatsData {
  total_projects: number;
  total_tasks: number;
  tasks_todo: number;
  tasks_in_progress: number;
  tasks_done: number;
  overdue_tasks: number;
  total_workspaces: number;
}

interface RecentTask {
  id: string;
  title: string;
  status: string | null;
  priority: string | null;
  due_date: string | null;
  project: { id: string; name: string; slug: string } | null;
  assigned_to: { id: string; name: string; avatar?: string } | null;
  updated_at: string;
}

interface TasksByProject {
  name: string;
  total: number;
  slug: string;
}

export default function Dashboard() {
  const {
    projects,
    workspaces,
    auth,
    stats,
    tasksByStatus,
    tasksByProject,
    recentTasks,
  } = usePage<SharedData>().props as {
    projects: Project[];
    workspaces: Workspace[];
    stats: DashboardStatsData;
    tasksByStatus: { todo: number; in_progress: number; done: number };
    tasksByProject: TasksByProject[];
    recentTasks: RecentTask[];
  };

  const completionRate =
    stats?.total_tasks > 0
      ? Math.round((stats.tasks_done / stats.total_tasks) * 100)
      : 0;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />

      <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
            Welcome back, {auth.user.name}!
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Here's an overview of your workspace and projects
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8">
          <DashboardStats
            stats={stats ?? {}}
            completionRate={completionRate}
            activeWorkspaceName={auth.user.current_workspace?.name}
            projectsCount={projects?.length}
          // workspacesCount={workspaces?.length}
          />
        </div>

        {/* Charts Row */}
        <div className="mb-6 grid gap-4 sm:mb-8 sm:gap-6 lg:grid-cols-2">
          <TaskStatusChart tasksByStatus={tasksByStatus ?? { todo: 0, in_progress: 0, done: 0 }} />
          <TasksByProjectChart data={tasksByProject ?? []} />
        </div>

        {/* Table + Projects Row */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          <RecentActivityTable tasks={recentTasks ?? []} />
          <RecentProjects projects={projects ?? []} />
        </div>

        {/* Completion Progress */}
        <div className="mt-8">
          <OverallProgress
            tasksDone={stats?.tasks_done ?? 0}
            totalTasks={stats?.total_tasks ?? 0}
            completionRate={completionRate}
          />
        </div>
      </div>
    </AppLayout>
  );
}
