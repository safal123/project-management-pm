import { useForm } from '@inertiajs/react'
import { FormEventHandler, useEffect, useState } from 'react'
import { Loader2, Pencil } from 'lucide-react'
import { toast } from 'sonner'

import InputError from '@/components/input-error'
import { BaseModal } from '@/components/modals/base-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type Workspace } from '@/types'

export function RenameWorkspaceModal({ workspace }: { workspace: Workspace }) {
  const [open, setOpen] = useState(false)
  const { data, setData, patch, processing, errors, reset } = useForm({
    name: workspace.name,
  })

  useEffect(() => {
    if (open) {
      setData('name', workspace.name)
    }
  }, [open, workspace.name, setData])

  const submit: FormEventHandler = (e) => {
    e.preventDefault()
    patch(route('workspaces.update', workspace.id), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Workspace renamed')
        setOpen(false)
        reset()
      },
      onError: () => toast.error('Could not rename workspace'),
    })
  }

  return (
    <BaseModal
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button variant="ghost" className="h-7 w-full justify-start px-2 text-[12px]" size="sm">
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Rename workspace
        </Button>
      }
      icon={<Pencil className="h-5 w-5" />}
      title="Rename workspace"
      description="This name is visible to everyone in the workspace."
      className="sm:max-w-[420px]"
      formProps={{ onSubmit: submit }}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={processing || !data.name.trim()}>
            {processing && <Loader2 className="animate-spin" />}
            Save
          </Button>
        </>
      }
    >
      <div className="grid gap-1.5">
        <Label htmlFor="workspace-name" className="text-[12px]">
          Name
        </Label>
        <Input
          id="workspace-name"
          autoFocus
          value={data.name}
          onChange={(e) => setData('name', e.target.value)}
          placeholder="Workspace name"
          className="h-8 text-[13px]"
        />
        <InputError message={errors.name} />
      </div>
    </BaseModal>
  )
}
