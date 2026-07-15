import { AppStatCard } from '@/components/app-stat-card';
import {
  FolderKanban,
  Briefcase,
  CheckCircle2,
  Clock,
  AlertCircle,
  ListTodo,
} from 'lucide-react';

export interface DashboardStatsData {
  total_projects?: number;
  total_tasks?: number;
  tasks_todo?: number;
  tasks_in_progress?: number;
  tasks_done?: number;
  overdue_tasks?: number;
  total_workspaces?: number;
}

interface DashboardStatsProps {
  stats?: DashboardStatsData | null;
  completionRate: number;
  activeWorkspaceName?: string;
  projectsCount?: number;
  workspacesCount?: number;
}

export function DashboardStats({
  stats,
  completionRate,
  activeWorkspaceName = 'None',
  projectsCount,
  workspacesCount,
}: DashboardStatsProps) {
  const s = stats ?? {};
  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-3">
      <AppStatCard
        title="Total Projects"
        value={s.total_projects ?? projectsCount ?? 0}
        trendPositive={true}
        description="Active projects"
        icon={FolderKanban}
        iconClassName="bg-primary/10 text-primary"
      />
      <AppStatCard
        title="Total Tasks"
        value={s.total_tasks ?? 0}
        description="Across all projects"
        icon={ListTodo}
        iconClassName="bg-muted text-muted-foreground"
      />
      <AppStatCard
        title="Completed"
        value={s.tasks_done ?? 0}
        description={`${completionRate}% completion rate`}
        icon={CheckCircle2}
        iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      />
      {/* <AppStatCard
        title="In Progress"
        value={s.tasks_in_progress ?? 0}
        description="Active work"
        icon={Clock}
        iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
      />
      <AppStatCard
        title="Overdue"
        value={s.overdue_tasks ?? 0}
        description="Needs attention"
        icon={AlertCircle}
        iconClassName="bg-destructive/10 text-destructive"
      /> */}
      {/* <AppStatCard
        title="Workspaces"
        value={s.total_workspaces ?? workspacesCount ?? 0}
        description={`${activeWorkspaceName} active`}
        icon={Briefcase}
        iconClassName="bg-muted text-muted-foreground"
      /> */}
    </div>
  );
}
