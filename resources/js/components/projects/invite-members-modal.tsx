import React, { useState } from 'react'
import { router, usePage } from '@inertiajs/react'
import { SharedData, Project, Invitation } from '@/types'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UserPlus, Search, Mail, X, Clock, UserIcon, ClockIcon, RefreshCcwIcon } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import AppAvatar from '../app-avatar'
import AppEmpty from '../app-empty'
import AppTooltip from '../app-tooltip'

interface InviteMembersModalProps {
  errors?: {
    message?: string;
    email?: string;
  };
}

export const InviteMembersModal = () => {
  const { project, errors, invitations } = usePage<
    SharedData & { project: Project; errors?: InviteMembersModalProps['errors']; invitations?: Invitation[] }
  >().props

  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [isInviting, setIsInviting] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const projectMembers = project.users || []
  const pendingInvitations = (invitations || []).filter(
    (invitation) => invitation.status === 'pending'
  )

  const filteredMembers = projectMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleInviteByEmail = (email?: string) => {
    if (!emailInput.trim() && !email) return
    if (email) {
      setEmailInput(email)
    }

    setIsInviting(true)
    router.post(
      route('invitations.store'),
      {
        email: emailInput,
        workspace_id: project.workspace_id,
        project_id: project.id,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setEmailInput('')
          setIsInviting(false)
          toast.success('Invitation sent successfully')
        },
        onError: (errors) => {
          const message = errors?.message || 'Failed to invite member'
          toast.error(message)
          setIsInviting(false)
        },
      }
    )
  }

  const handleCancelInvitation = (invitationId: string, email: string) => {
    if (!confirm(`Are you sure you want to cancel the invitation sent to ${email}?`)) {
      return
    }

    router.delete(route('invitations.destroy', invitationId), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Invitation cancelled successfully')
      },
      onError: () => {
        toast.error('Failed to cancel invitation')
      },
    })
  }

  const handleResendInvitation = (invitation: Invitation) => {
    router.post(
      route('invitations.resend', invitation.id), {
      invitation: invitation.id
    },
      {
        preserveScroll: true,
        onStart: () => {
          setIsResending(true)
        },
        onSuccess: () => {
          toast.success('Invitation email resend successfully')
          router.reload({
            only: ['invitations'],
          })
          setIsResending(false)
        },
        onError: (errors) => {
          const message = errors?.message || 'Failed to resend invitation email'
          toast.error(message)
          setIsResending(false)
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
      <DialogContent className="sm:max-w-[600px] bg-card max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-4">
          <DialogTitle>Invite Members to {project.name}</DialogTitle>
          <DialogDescription>
            Add team members to collaborate on this project
            {errors?.message && <p className="text-red-500 text-sm bg-red-500/10 p-2 rounded-md mt-2">{errors.message}</p>}
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="space-y-4 py-4 -mt-6">
          {/* Invite by Email */}
          <div className="space-y-4 px-4">
            <Label htmlFor="email">Invite by Email</Label>
            <div className="flex gap-2 mt-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
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
                {errors?.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>
              <Button
                onClick={() => handleInviteByEmail()}
                disabled={!emailInput.trim() || isInviting}
              >
                {isInviting ? 'Inviting...' : 'Invite'}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Pending Invitations */}
          {pendingInvitations.length > 0 ? (
            <>
              <div className="space-y-2 px-4">
                <Label className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Pending Invitations
                </Label>
                <div className="space-y-2 mt-2">
                  {pendingInvitations.map((invitation: Invitation) => (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-background"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{invitation.email}</p>
                            <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          </div>
                          <div className="flex flex-col gap-2 mt-1">
                            <p className="text-xs text-muted-foreground">
                              Invited on: {new Date(invitation.invited_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                            {/* Last Sent At */}
                            {invitation.last_sent_at && (
                              <p className="text-xs text-muted-foreground">
                                Last sent at: {new Date(invitation.last_sent_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </p>
                            )}
                            <div className="flex items-center gap-2">
                              <p className="w-fit text-xs text-muted-foreground flex items-center border border-border bg-primary/10 rounded-md px-2 py-1">
                                Invited by:
                                <span className="mr-1 ">
                                  {invitation.invited_by?.name}
                                </span>
                                <AppAvatar src={invitation.invited_by?.avatar} name={invitation.invited_by?.name} size="xs" />
                              </p>
                              <AppTooltip
                                content="Resend Invitation"
                                side="top"
                              >
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleResendInvitation(invitation)}
                                  className="text-primary hover:text-primary"
                                >
                                  <RefreshCcwIcon className={cn("h-4 w-4", isResending && "animate-spin")} />
                                </Button>
                              </AppTooltip>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelInvitation(invitation.id, invitation.email)}
                                className="text-destructive hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          ) : (
            <div className='px-4'>
              <AppEmpty
                title="No pending invitations"
                description="There are no pending invitations for this project. When members join, they will appear here."
                icon={<ClockIcon className='text-primary' />}
              />
            </div>
          )}

          {/* Search Members */}
          <div className="space-y-2 px-4">
            <Label htmlFor="search">Project Members</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                type="text"
                placeholder="Search by name or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="px-4">
            <ScrollArea className="h-[300px] rounded-md border">
              <div className="p-4 space-y-2 px-4">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => {
                    return (
                      <div
                        key={member.id}
                        className={cn("border flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors")}>
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback>
                              {member.name?.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{member.name}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })

                ) : (
                  <AppEmpty
                    title="No members found matching your search"
                    description="No members in this project"
                    icon={<UserIcon className='text-primary' />}
                  />
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="p-4 bg-muted">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
