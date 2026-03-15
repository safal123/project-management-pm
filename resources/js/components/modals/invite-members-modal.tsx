import { useState } from 'react'
import { router, usePage } from '@inertiajs/react'
import { SharedData, Project } from '@/types'
import { BaseModal } from './base-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, Mail, Send, Loader2, AlertCircle } from 'lucide-react'
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
    <BaseModal
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        if (!value) setEmailInput('')
      }}
      trigger={
        <Button variant="default" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invite
        </Button>
      }
      icon={<UserPlus className="h-5 w-5 text-primary" />}
      title={`Invite to ${project.name}`}
      description="Invite a collaborator by entering their email address"
      className="sm:max-w-[480px]"
      footer={
        <>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleInviteByEmail}
            disabled={!emailInput.trim() || isInviting}
            className="gap-2"
          >
            {isInviting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Invitation
              </>
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {errors?.message && (
          <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>{errors.message}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="invite-email" className="text-sm font-medium">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="invite-email"
              type="email"
              placeholder="colleague@company.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleInviteByEmail()
                }
              }}
              className="pl-10"
              autoComplete="email"
            />
          </div>
          {errors?.email && (
            <p className="text-destructive text-sm flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.email}
            </p>
          )}
        </div>
      </div>
    </BaseModal>
  )
}
