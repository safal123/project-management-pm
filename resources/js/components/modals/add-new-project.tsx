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
import { Loader2, Plus } from "lucide-react"
import { Textarea } from "../ui/textarea"
import { useForm, usePage } from "@inertiajs/react"
import InputError from "../input-error"
import { FormEventHandler } from 'react';
import { SharedData } from "@/types"

export function AddNewProject() {
  const { auth } = usePage<SharedData>().props;
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    description: '',
  })

  const submit: FormEventHandler = (e) => {
    e.preventDefault()
    post(route('projects.store', { workspace_id: auth.user.current_workspace_id as string }), {
      onFinish: () => reset(),
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-fit" size={"sm"}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={submit}>
          <DialogHeader className="mb-4 dark:bg-primary/10 border border-border p-4 rounded-lg mt-4">
            <DialogTitle>
              Add New Project
            </DialogTitle>
            <DialogDescription>
              Create a new project to manage your tasks and projects.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="flex items-center bg-primary/10 p-2 rounded-md border border-border min-h-10">
              <Label htmlFor="workspace-id">
                Create Project in Workspace for
              </Label>
              <span className="text-sm text-muted-primary ml-2">
                {auth.user.current_workspace?.name}
              </span>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="name-1">
                Project Name
              </Label>
              <Input
                id="name"
                type="name"
                autoFocus
                tabIndex={1}
                autoComplete="email"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="Project Name"
              />
              <InputError message={errors.name} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="username-1">
                Project Description
              </Label>
              <Textarea
                id="description"
                tabIndex={2}
                autoComplete="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="Project Description"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={processing}>
              {processing && <Loader2 className="h-4 w-4 animate-spin bg-transparent" />}
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog >
  )
}
