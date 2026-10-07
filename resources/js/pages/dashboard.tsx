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
  TaskActivityChart,
  RecentActivityTable,
} from '@/components/dashboard';
import type { TaskActivityPoint } from '@/components/dashboard/task-activity-chart';

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
    auth,
    stats,
    tasksByStatus,
    tasksByProject,
    taskActivity,
    recentTasks,
  } = usePage<SharedData>().props as {
    projects: Project[];
    workspaces: Workspace[];
    stats: DashboardStatsData;
    tasksByStatus: { todo: number; in_progress: number; done: number };
    tasksByProject: TasksByProject[];
    taskActivity: TaskActivityPoint[];
    recentTasks: RecentTask[];
  };

  const completionRate =
    stats?.total_tasks > 0
      ? Math.round((stats.tasks_done / stats.total_tasks) * 100)
      : 0;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />

      <div className="px-4 py-4 lg:px-6">
        <div className="mb-4">
          <h1 className="text-lg font-semibold tracking-tight">
            Welcome back, {auth.user.name}
          </h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Overview of your workspace and projects
          </p>
        </div>

        <div className="mb-4">
          <DashboardStats
            stats={stats ?? {}}
            completionRate={completionRate}
            activeWorkspaceName={auth.user.current_workspace?.name}
            projectsCount={projects?.length}
          />
        </div>

        <div className="mb-4">
          <TaskActivityChart data={taskActivity ?? []} />
        </div>

        <div className="mb-4 grid gap-3 lg:grid-cols-2">
          <TaskStatusChart tasksByStatus={tasksByStatus ?? { todo: 0, in_progress: 0, done: 0 }} />
          <TasksByProjectChart data={tasksByProject ?? []} />
        </div>

        <RecentActivityTable tasks={recentTasks ?? []} />
      </div>
    </AppLayout>
  );
}
