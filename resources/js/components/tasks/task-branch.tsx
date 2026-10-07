import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { GitBranch, GitPullRequest, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Task, Project, SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FIELD_LABEL } from './field-styles';

interface TaskBranchProps {
  task: Task;
}

export default function TaskBranch({ task }: TaskBranchProps) {
  const { project } = usePage<SharedData & { project: Project }>().props;
  const gitIntegration = project?.git_integration;

  const [editing, setEditing] = useState(false);
  const [branchName, setBranchName] = useState(`task/${task.slug}`);
  const [creating, setCreating] = useState(false);

  if (!gitIntegration) return null;

  const handleCreateBranch = () => {
    setCreating(true);
    router.post(
      route('tasks.branch.store', { task: task.id }),
      { branch_name: branchName },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Branch created successfully');
          setEditing(false);
        },
        onError: (errors) => {
          toast.error(errors?.branch_name || 'Failed to create branch');
        },
        onFinish: () => setCreating(false),
      }
    );
  };

  if (task.branch_name) {
    const compareUrl = `${gitIntegration.repo_url}/compare/${gitIntegration.default_branch}...${task.branch_name}?expand=1`;

    return (
      <div className="flex items-center gap-3">
        <Label className={FIELD_LABEL}>Branch</Label>
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={task.branch_url ?? compareUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border bg-muted px-2.5 py-1 text-xs font-mono hover:bg-muted/70"
          >
            <GitBranch className="h-3 w-3" />
            {task.branch_name}
          </a>
          <a
            href={compareUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <GitPullRequest className="h-3 w-3" />
            Open PR
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Label className={FIELD_LABEL}>Branch</Label>
      {editing ? (
        <div className="flex items-center gap-2 flex-1">
          <Input
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            className="h-8 text-xs font-mono"
            disabled={creating}
          />
          <Button size="sm" onClick={handleCreateBranch} disabled={creating || !branchName.trim()}>
            {creating ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Create'}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={creating}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" className="h-8 gap-1.5 px-2.5 text-[13px]" onClick={() => setEditing(true)}>
          <GitBranch className="h-3.5 w-3.5" />
          Create Branch
        </Button>
      )}
    </div>
  );
}
