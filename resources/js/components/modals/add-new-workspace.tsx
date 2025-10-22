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
import { useForm } from "@inertiajs/react"
import InputError from "../input-error"
import { FormEventHandler } from 'react';

export function AddNewWorkspace() {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    description: '',
  })

  const submit: FormEventHandler = (e) => {
    e.preventDefault()
    post(route('workspaces.store'), {
      onFinish: () => reset(),
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" size={"sm"}>
          <Plus className="mr-2 h-4 w-4" />
          New Workspace
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={submit}>
          <DialogHeader className="mb-4 dark:bg-primary/10 border border-border p-4 rounded-lg mt-4">
            <DialogTitle>
              Add New Workspace
            </DialogTitle>
            <DialogDescription>
              Create a new workspace to manage your projects and tasks.
              You can add and remove users to your workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">
                Workspace Name
              </Label>
              <Input
                id="name"
                type="name"
                autoFocus
                tabIndex={1}
                autoComplete="email"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="Workspace Name"
              />
              <InputError message={errors.name} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="username-1">
                Workspace Description
              </Label>
              <Textarea
                id="description"
                tabIndex={2}
                autoComplete="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="Workspace Description"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={processing}>
              {processing && <Loader2 className="h-4 w-4 animate-spin bg-transparent" />}
              Create Workspace
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog >
  )
}
