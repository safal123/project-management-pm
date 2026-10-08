import { useState } from 'react'
import { router, usePage } from '@inertiajs/react'
import { AlertCircle, Check, Copy, Loader2, Mail, Send, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SharedData } from '@/types'
import { BaseModal } from './base-modal'

export function WorkspaceInviteModal() {
  const { auth, invite_link, errors } = usePage<
    SharedData & { invite_link?: string; errors?: { message?: string; email?: string } }
  >().props
  const workspace = auth.user.current_workspace
  const [open, setOpen] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [isInviting, setIsInviting] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleInviteByEmail = () => {
    const email = emailInput.trim()
    if (!email || isInviting || !workspace?.id) return

    setIsInviting(true)

    router.post(
      route('invitations.store'),
      {
        email,
        workspace_id: workspace.id,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setEmailInput('')
          toast.success('Invitation sent')
        },
        onError: (formErrors) => {
          toast.error(formErrors?.message || formErrors?.email || 'Failed to send invitation')
        },
        onFinish: () => setIsInviting(false),
      }
    )
  }

  const copyInviteLink = async () => {
    if (!invite_link) return

    try {
      await navigator.clipboard.writeText(invite_link)
      setCopied(true)
      toast.success('Invite link copied')
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Could not copy invite link')
    }
  }

  return (
    <BaseModal
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        if (!value) {
          setEmailInput('')
          setCopied(false)
        }
      }}
      trigger={
        <Button variant="default" size="sm" className="h-8 gap-1.5 px-2.5 text-[13px]">
          <UserPlus className="h-3.5 w-3.5" />
          Invite
        </Button>
      }
      icon={<UserPlus />}
      title={`Invite to ${workspace?.name ?? 'workspace'}`}
      description="Share a link or send an email invitation"
      className="sm:max-w-[480px]"
      footer={
        <>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleInviteByEmail} disabled={!emailInput.trim() || isInviting} className="gap-2">
            {isInviting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Send invitation
              </>
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {errors?.message && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-2.5 text-[13px] text-destructive">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>{errors.message}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="workspace-invite-link">Invite link</Label>
          <div className="flex items-center gap-1.5">
            <Input
              id="workspace-invite-link"
              readOnly
              value={invite_link ?? 'Generating link…'}
              className="h-8 text-[13px]"
              onFocus={(event) => event.target.select()}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 shrink-0 px-2.5 text-[13px]"
              onClick={copyInviteLink}
              disabled={!invite_link}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Anyone with this link can join the workspace. The link expires in 7 days.
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-2 text-[11px] text-muted-foreground">or invite by email</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="workspace-invite-email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="workspace-invite-email"
              type="email"
              placeholder="colleague@company.com"
              value={emailInput}
              onChange={(event) => setEmailInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  handleInviteByEmail()
                }
              }}
              className="h-8 pl-8 text-[13px]"
              autoComplete="email"
            />
          </div>
          {errors?.email && (
            <p className="flex items-center gap-1 text-[13px] text-destructive">
              <AlertCircle className="h-3 w-3" />
              {errors.email}
            </p>
          )}
        </div>
      </div>
    </BaseModal>
  )
}
