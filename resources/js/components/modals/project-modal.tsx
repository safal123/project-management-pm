import { useState } from 'react'
import { useForm, usePage } from '@inertiajs/react'
import { Project, SharedData } from '@/types'
import { BaseModal } from './base-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import InputError from '@/components/input-error'
import { FolderPlus, Pencil, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ProjectModalProps {
  project?: Project
  triggerClassName?: string
  triggerVariant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary'
}

export function ProjectModal({
  project,
  triggerClassName,
  triggerVariant = 'default',
}: ProjectModalProps) {
  const { auth } = usePage<SharedData>().props
  const [open, setOpen] = useState(false)
  const isEditMode = !!project

  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: project?.name || '',
    description: project?.description || '',
  })

  const handleSubmit = () => {
    if (isEditMode && data.name === project.name && data.description === project.description) {
      setOpen(false)
      return
    }

    if (isEditMode) {
      put(route('projects.update', project.slug), {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Project updated successfully')
          setOpen(false)
        },
        onError: () => {
          toast.error('Failed to update project')
        },
      })
    } else {
      post(
        route('projects.store', {
          workspace_id: auth.user.current_workspace_id as string,
        }),
        {
          preserveScroll: true,
          onSuccess: () => {
            toast.success('Project created successfully')
            reset()
            setOpen(false)
          },
          onError: () => {
            toast.error('Failed to create project')
          },
        }
      )
    }
  }

  return (
    <BaseModal
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button className={triggerClassName} size="sm" variant={triggerVariant}>
          {isEditMode ? (
            <Pencil className="h-4 w-4" />
          ) : (
            <>
              <FolderPlus className="h-4 w-4" />
              New Project
            </>
          )}
        </Button>
      }
      icon={
        isEditMode
          ? <Pencil className="h-5 w-5 text-primary" />
          : <FolderPlus className="h-5 w-5 text-primary" />
      }
      title={isEditMode ? 'Edit Project' : 'Add New Project'}
      description={
        isEditMode
          ? 'Update your project details. Changes will be saved immediately.'
          : 'Create a new project to manage your tasks and projects.'
      }
      className="sm:max-w-[525px]"
      footer={
        <>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={processing} className="gap-2">
            {processing && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditMode ? 'Update Project' : 'Create Project'}
          </Button>
        </>
      }
    >
      <div className="grid gap-4">
        <div className="flex items-center gap-2 rounded-md border bg-primary/10 p-2">
          <Label>
            {isEditMode ? 'Project ID' : 'Create Project in Workspace for'}
          </Label>
          <span className="text-sm font-mono text-muted-foreground">
            {isEditMode ? project.id : auth.user.current_workspace?.name}
          </span>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="name">Project Name</Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            placeholder="Project Name"
            autoFocus={!isEditMode}
          />
          <InputError message={errors.name} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Project Description</Label>
          <Textarea
            id="description"
            rows={4}
            value={data.description}
            onChange={(e) => setData('description', e.target.value)}
            placeholder="Project Description"
          />
          <InputError message={errors.description} />
        </div>
      </div>
    </BaseModal>
  )
}
