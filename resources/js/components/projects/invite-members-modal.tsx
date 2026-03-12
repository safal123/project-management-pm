import { useState } from 'react'
import { router, usePage } from '@inertiajs/react'
import { SharedData, Project } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, Mail } from 'lucide-react'
import { toast } from 'sonner'

export const InviteMembersModal = () => {
  const { project, errors } = usePage<
    SharedData & {
      project: Project
      errors?: { message?: string; email?: string }
    }
  >().props

  const [open, setOpen] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [isInviting, setIsInviting] = useState(false)

  const handleInviteByEmail = () => {
    const email = emailInput.trim()
    if (!email || isInviting) return

    setIsInviting(true)

    router.post(
      route('invitations.store'),
      {
        email,
        workspace_id: project.workspace_id,
        project_id: project.id,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setEmailInput('')
          toast.success('Invitation sent successfully')
        },
        onError: (errors) => {
          toast.error(errors?.message || 'Failed to invite member')
        },
        onFinish: () => {
          setIsInviting(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invite Members
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px] bg-card">
        <DialogHeader>
          <DialogTitle>Invite Members to {project.name}</DialogTitle>
          <DialogDescription>
            Send an email invitation to add a new collaborator
            {errors?.message && (
              <p className="text-red-500 text-sm bg-red-500/10 p-2 rounded-md mt-2">
                {errors.message}
              </p>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Label htmlFor="invite-email">Email address</Label>
          <div className="flex gap-2 mt-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="invite-email"
                type="email"
                placeholder="Enter email address"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleInviteByEmail()
                  }
                }}
                className="pl-10"
              />
              {errors?.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            <Button onClick={handleInviteByEmail} disabled={!emailInput.trim() || isInviting}>
              {isInviting ? 'Inviting...' : 'Invite'}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
