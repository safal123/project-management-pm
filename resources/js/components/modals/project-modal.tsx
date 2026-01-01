import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Pencil, Plus } from "lucide-react"
import { Textarea } from "../ui/textarea"
import { useForm, usePage } from "@inertiajs/react"
import InputError from "../input-error"
import { Project, SharedData } from "@/types"
import { toast } from "sonner"

interface ProjectModalProps {
  project?: Project // If provided, edit mode; if not, create mode
  triggerClassName?: string
  triggerVariant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary"
}

export function ProjectModal({
  project,
  triggerClassName,
  triggerVariant = "default"
}: ProjectModalProps) {
  const { auth, permissions } = usePage<SharedData>().props
  const [open, setOpen] = useState(false)
  const isEditMode = !!project

  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: project?.name || "",
    description: project?.description || "",
  })

  const handleSubmit = () => {
    if (isEditMode && data.name === project.name && data.description === project.description) {
      setOpen(false)
      return
    }

    if (isEditMode) {
      put(route("projects.update", project.slug), {
        preserveScroll: true,
        onSuccess: () => {
          toast.success("Project updated successfully")
          setOpen(false)
        },
        onError: (errors) => {
          toast.error("Failed to update project")
          console.error("Errors:", errors)
        },
      })
    } else {
      post(
        route("projects.store", {
          workspace_id: auth.user.current_workspace_id as string,
        }),
        {
          preserveScroll: true,
          onSuccess: () => {
            toast.success("Project created successfully")
            reset()
            setOpen(false)
          },
          onError: (errors) => {
            toast.error("Failed to create project")
            console.error("Errors:", errors)
          },
        }
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={triggerClassName}
          size="sm"
          variant={triggerVariant}
        >
          {isEditMode ? (
            <Pencil className="h-4 w-4" />
          ) : (
            <>
              <Plus className="h-4 w-4" />
              New Project
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader className="border border-border p-4 rounded-lg bg-primary/10 mt-2">
          <DialogTitle>
            {isEditMode ? "Edit Project" : "Add New Project"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update your project details. Changes will be saved immediately."
              : "Create a new project to manage your tasks and projects."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Context Information */}
          <div className="flex items-center gap-2 rounded-md border bg-primary/10 p-2">
            <Label>
              {isEditMode ? "Project ID" : "Create Project in Workspace for"}
            </Label>
            <span className="text-sm font-mono text-muted-foreground">
              {isEditMode ? project.id : auth.user.current_workspace?.name}
            </span>
          </div>

          {/* Project Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => setData("name", e.target.value)}
              placeholder="Project Name"
              autoFocus={!isEditMode}
            />
            <InputError message={errors.name} />
          </div>

          {/* Project Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Project Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={data.description}
              onChange={(e) => setData("description", e.target.value)}
              placeholder="Project Description"
            />
            <InputError message={errors.description} />
          </div>
        </div>

        <DialogFooter className="mt-6 gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={processing}>
            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? "Update Project" : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

