import { useState } from 'react'
import { useForm } from '@inertiajs/react'
import { Project } from '@/types'
import { BaseModal } from './base-modal'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import InputError from '@/components/input-error'
import { Github, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ConnectGitModalProps {
  project: Project
  trigger: React.ReactNode
}

export function ConnectGitModal({ project, trigger }: ConnectGitModalProps) {
  const [open, setOpen] = useState(false)

  const { data, setData, processing, errors, reset, post } = useForm({
    provider: 'github',
    token: '',
    repo_full_name: '',
  })

  const handleSubmit = () => {
    post(route('git-integrations.store', { project: project.slug }), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Repository connected successfully')
        reset()
        setOpen(false)
      },
      onError: (errs) => {
        toast.error(errs?.token || errs?.repo_full_name || 'Failed to connect repository')
      },
    })
  }

  return (
    <BaseModal
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
      trigger={trigger}
      icon={<Github className="h-5 w-5 text-primary" />}
      title="Connect a Git repository"
      description="Link a repository so tasks in this project can spawn real branches."
      className="sm:max-w-[480px]"
      footer={
        <>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={processing}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={processing} className="gap-2">
            {processing && <Loader2 className="h-4 w-4 animate-spin" />}
            Connect
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="git-provider">Provider</Label>
          <Select value={data.provider} onValueChange={(value) => setData('provider', value)}>
            <SelectTrigger id="git-provider">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="github">GitHub</SelectItem>
              <SelectItem value="gitlab" disabled>
                GitLab — coming soon
              </SelectItem>
              <SelectItem value="bitbucket" disabled>
                Bitbucket — coming soon
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="git-repo">Repository</Label>
          <Input
            id="git-repo"
            placeholder="owner/repo"
            value={data.repo_full_name}
            onChange={(e) => setData('repo_full_name', e.target.value)}
          />
          <InputError message={errors.repo_full_name} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="git-token">Personal access token</Label>
          <Input
            id="git-token"
            type="password"
            placeholder="ghp_••••••••••••••••"
            value={data.token}
            onChange={(e) => setData('token', e.target.value)}
          />
          <InputError message={errors.token} />
          <p className="text-xs text-muted-foreground">
            Needs the{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-[11px]">repo</code> scope.
            Create one on{' '}
            <a
              href="https://github.com/settings/tokens/new"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              GitHub's token settings page
            </a>
            .
          </p>
        </div>
      </div>
    </BaseModal>
  )
}
