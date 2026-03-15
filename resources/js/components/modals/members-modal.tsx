import { useState } from 'react'
import { router, usePage } from '@inertiajs/react'
import { SharedData, Project, Invitation, Auth } from '@/types'
import { BaseModal } from './base-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Users,
  Search,
  Mail,
  X,
  Clock,
  UserIcon,
  ClockIcon,
  RefreshCcwIcon,
  Check,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import AppAvatar from '@/components/app-avatar'
import AppEmpty from '@/components/app-empty'
import AppTooltip from '@/components/app-tooltip'
import { formatDateTime, hoursUntil } from '@/utils/date'

export const MembersModal = () => {
  const { project, auth } = usePage<
    SharedData & {
      project: Project
      invitations?: Invitation[]
      auth: Auth
    }
  >().props

  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [resendingInvitationId, setResendingInvitationId] = useState<string | null>(null)
  const [approvingInvitationId, setApprovingInvitationId] = useState<string | null>(null)

  const projectMembers = project.users || []
  const pendingInvitations = (project.invitations || []).filter(
    (invitation) => invitation.status === 'pending'
  )

  const isInvitationExpired = (invitation: Invitation) => {
    return new Date(invitation.expires_at) < new Date()
  }

  const filteredMembers = projectMembers.filter((member) =>
    [member.name, member.email]
      .filter(Boolean)
      .some((value) =>
        value!.toLowerCase().includes(searchQuery.toLowerCase())
      )
  )

  const handleApproveMember = (invitationId: string) => {
    if (approvingInvitationId) return

    const invitation = pendingInvitations.find((inv) => inv.id === invitationId)
    if (invitation && isInvitationExpired(invitation)) {
      toast.error('This invitation has expired and cannot be approved')
      return
    }

    setApprovingInvitationId(invitationId)

    router.post(
      route('invitations.approve', invitationId),
      {},
      {
        preserveScroll: true,
        only: ['project', 'invitations'],
        onSuccess: () => {
          toast.success('Member approved successfully')
        },
        onError: (errors) => {
          toast.error(errors?.message || 'Failed to approve member')
        },
        onFinish: () => {
          setApprovingInvitationId(null)
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
    if (resendingInvitationId) return

    if (isInvitationExpired(invitation)) {
      toast.error('This invitation has expired and cannot be resent')
      return
    }

    setResendingInvitationId(invitation.id)

    router.post(
      route('invitations.resend', invitation.id),
      {},
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Invitation email resent successfully')
        },
        onError: (errors) => {
          toast.error(errors?.message || 'Failed to resend invitation email')
        },
        onFinish: () => {
          setResendingInvitationId(null)
        },
      }
    )
  }

  return (
    <BaseModal
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button variant="outline" className="gap-2">
          <Users className="h-4 w-4" />
          Members
        </Button>
      }
      icon={<Users className="h-5 w-5 text-primary" />}
      title={`Members — ${project.name}`}
      description="Manage project members and pending invitations"
      className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
      footer={
        <Button variant="outline" onClick={() => setOpen(false)}>
          Close
        </Button>
      }
    >
      <div className="space-y-4 -mt-1">
        {/* Pending Invitations */}
        {pendingInvitations.length > 0 ? (
          <>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Pending Invitations
              </Label>

              <div className="space-y-2 mt-2">
                {pendingInvitations.map((invitation) => {
                  const isExpired = isInvitationExpired(invitation)
                  return (
                    <div
                      key={invitation.id}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-lg border bg-background',
                        isExpired && 'opacity-60 border-destructive/30'
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{invitation.email}</p>
                            {isExpired ? (
                              <Badge className="text-xs bg-destructive/20 text-destructive">
                                <X className="h-3 w-3 mr-1" />
                                Expired
                              </Badge>
                            ) : (
                              <Badge className="text-xs bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-col gap-2 mt-1">
                            <p className="text-xs text-muted-foreground">
                              Invited on: {formatDateTime(invitation.invited_at)}
                            </p>

                            {isExpired && (
                              <p className="text-xs text-destructive font-medium">
                                Expired on: {formatDateTime(invitation.expires_at)}
                              </p>
                            )}

                            {invitation.last_sent_at && (
                              <>
                                <p className="text-xs text-muted-foreground">
                                  Last email sent at:{' '}
                                  {formatDateTime(invitation.last_sent_at)}
                                </p>
                                {!isExpired && (
                                  <p className="text-xs text-muted-foreground flex items-center">
                                    <ClockIcon className="h-3 w-3 mr-1" />
                                    Can send email after{' '}
                                    {hoursUntil(invitation.last_sent_at)} hours
                                  </p>
                                )}
                              </>
                            )}

                            <div className="flex items-center gap-2">
                              <p className="w-fit text-xs text-muted-foreground flex items-center border border-border bg-primary/10 rounded-md px-2 py-1">
                                Invited by:
                                <span className="mx-1">
                                  {invitation.invited_by?.name}
                                </span>
                                <AppAvatar
                                  src={invitation.invited_by?.avatar}
                                  name={invitation.invited_by?.name}
                                  size="xs"
                                />
                              </p>

                              {(!invitation.last_sent_at ||
                                hoursUntil(invitation.last_sent_at) === 0) &&
                                !isExpired && (
                                  <AppTooltip content="Resend Invitation" side="top">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleResendInvitation(invitation)}
                                      disabled={resendingInvitationId === invitation.id}
                                    >
                                      <RefreshCcwIcon
                                        className={cn(
                                          'h-4 w-4',
                                          resendingInvitationId === invitation.id &&
                                          'animate-spin'
                                        )}
                                      />
                                    </Button>
                                  </AppTooltip>
                                )}

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleCancelInvitation(invitation.id, invitation.email)
                                }
                                className="text-destructive hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                                {isExpired ? 'Remove' : 'Cancel'}
                              </Button>

                              {auth.user.id === project.created_by && !isExpired && (
                                <AppTooltip content="Approve Member" side="top">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleApproveMember(invitation.id)}
                                    disabled={approvingInvitationId === invitation.id}
                                    className="text-emerald-600 hover:text-emerald-700 border-emerald-200 hover:border-emerald-300"
                                  >
                                    {approvingInvitationId === invitation.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Check className="h-4 w-4" />
                                    )}
                                  </Button>
                                </AppTooltip>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <Separator />
          </>
        ) : (
          <AppEmpty
            title="No pending invitations"
            description="There are no pending invitations for this project."
            icon={<ClockIcon className="text-primary" />}
          />
        )}

        {/* Project Members */}
        <div className="space-y-2">
          <Label htmlFor="member-search">Project Members</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="member-search"
              type="text"
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="h-[300px] rounded-md border">
          <div className="p-4 space-y-2">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="border flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>
                        {member.name?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <AppEmpty
                title="No members found matching your search"
                description="No members in this project"
                icon={<UserIcon className="text-primary" />}
              />
            )}
          </div>
        </ScrollArea>
      </div>
    </BaseModal>
  )
}
