import { useForm } from '@inertiajs/react'
import { BaseModal } from './base-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import InputError from '@/components/input-error'
import { Plus, Briefcase, Loader2 } from 'lucide-react'
import { FormEventHandler, useState } from 'react'

export function AddNewWorkspace() {
  const [open, setOpen] = useState(false)
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    description: '',
  })

  const submit: FormEventHandler = (e) => {
    e.preventDefault()
    post(route('workspaces.store'), {
      onFinish: () => reset(),
      onSuccess: () => setOpen(false),
    })
  }

  return (
    <BaseModal
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button className="w-full" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Workspace
        </Button>
      }
      icon={<Briefcase className="h-5 w-5 text-primary" />}
      title="Add New Workspace"
      description="Create a new workspace to manage your projects and tasks."
      className="sm:max-w-[525px]"
      formProps={{ onSubmit: submit }}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={processing} className="gap-2">
            {processing && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Workspace
          </Button>
        </>
      }
    >
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Workspace Name</Label>
          <Input
            id="name"
            autoFocus
            tabIndex={1}
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            placeholder="Workspace Name"
          />
          <InputError message={errors.name} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Workspace Description</Label>
          <Textarea
            id="description"
            tabIndex={2}
            value={data.description}
            onChange={(e) => setData('description', e.target.value)}
            placeholder="Workspace Description"
          />
        </div>
      </div>
    </BaseModal>
  )
}
