import { useState } from 'react'
import { router, usePage } from '@inertiajs/react'
import { SharedData, Project, Invitation, Auth } from '@/types'
import { BaseModal } from './base-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  Search,
  Mail,
  X,
  Clock,
  RefreshCcwIcon,
  Check,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import AppAvatar from '@/components/app-avatar'
import AppTooltip from '@/components/app-tooltip'
import { formatShortDate, hoursUntil } from '@/utils/app-utils'

const tabTriggerClass =
  'h-8 rounded-none border-b-2 border-transparent px-0 pb-2 text-[13px] text-muted-foreground shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none'

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
    (invitation) => invitation.status === 'pending' && invitation.email
  )

  const isInvitationExpired = (invitation: Invitation) =>
    new Date(invitation.expires_at) < new Date()

  const filteredMembers = projectMembers.filter((member) =>
    [member.name, member.email]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(searchQuery.toLowerCase()))
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
        onSuccess: () => toast.success('Member approved successfully'),
        onError: (errors) => toast.error(errors?.message || 'Failed to approve member'),
        onFinish: () => setApprovingInvitationId(null),
      }
    )
  }

  const handleCancelInvitation = (invitationId: string, email: string) => {
    if (!confirm(`Cancel the invitation sent to ${email}?`)) return

    router.delete(route('invitations.destroy', invitationId), {
      preserveScroll: true,
      onSuccess: () => toast.success('Invitation cancelled'),
      onError: () => toast.error('Failed to cancel invitation'),
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
        onSuccess: () => toast.success('Invitation resent'),
        onError: (errors) => toast.error(errors?.message || 'Failed to resend invitation'),
        onFinish: () => setResendingInvitationId(null),
      }
    )
  }

  return (
    <BaseModal
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button variant="outline" size="sm" className="h-8 gap-1.5 px-2.5 text-[13px]">
          <Users className="h-3.5 w-3.5" />
          Members
        </Button>
      }
      icon={<Users />}
      title="Members"
      description={`Everyone in this workspace`}
      className="sm:max-w-[520px]"
      footer={
        <Button variant="outline" onClick={() => setOpen(false)}>
          Close
        </Button>
      }
    >
      <Tabs defaultValue="members" className="-mt-1">
        <TabsList className="h-auto w-full justify-start gap-4 rounded-none bg-transparent p-0">
          <TabsTrigger value="members" className={tabTriggerClass}>
            Members
            <span className="ml-1.5 text-[11px] text-muted-foreground">{projectMembers.length}</span>
          </TabsTrigger>
          <TabsTrigger value="pending" className={tabTriggerClass}>
            Pending
            <span className="ml-1.5 text-[11px] text-muted-foreground">{pendingInvitations.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-3 space-y-2.5 focus-visible:outline-none">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search members"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-[13px]"
            />
          </div>

          <div className="max-h-[320px] overflow-y-auto rounded-md border border-border">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => {
                const isOwner = member.id === project.created_by
                const isYou = member.id === auth.user.id

                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-2.5 border-b border-border px-2.5 py-2 last:border-b-0"
                  >
                    <AppAvatar
                      src={member.profile_picture?.url ?? member.avatar}
                      name={member.name}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <p className="truncate text-[13px] font-medium">{member.name}</p>
                        {isOwner && (
                          <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-medium">
                            Owner
                          </Badge>
                        )}
                        {isYou && (
                          <span className="text-[11px] text-muted-foreground">You</span>
                        )}
                      </div>
                      <p className="truncate text-[11px] text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="px-3 py-8 text-center text-[13px] text-muted-foreground">
                No members match that search.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-3 focus-visible:outline-none">
          <div className="max-h-[360px] overflow-y-auto rounded-md border border-border">
            {pendingInvitations.length > 0 ? (
              pendingInvitations.map((invitation) => {
                const isExpired = isInvitationExpired(invitation)
                const canResend =
                  !isExpired &&
                  (!invitation.last_sent_at || hoursUntil(invitation.last_sent_at) === 0)

                return (
                  <div
                    key={invitation.id}
                    className={cn(
                      'flex items-start gap-2.5 border-b border-border px-2.5 py-2.5 last:border-b-0',
                      isExpired && 'opacity-70'
                    )}
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <p className="truncate text-[13px] font-medium">{invitation.email}</p>
                        <Badge
                          variant="outline"
                          className="h-5 shrink-0 px-1.5 text-[10px] font-medium"
                        >
                          {isExpired ? 'Expired' : 'Pending'}
                        </Badge>
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        Invited by {invitation.invited_by?.name ?? 'a member'}
                        {invitation.invited_at ? ` · ${formatShortDate(invitation.invited_at)}` : ''}
                      </p>
                      {invitation.last_sent_at && !isExpired && hoursUntil(invitation.last_sent_at) > 0 && (
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Resend available in {hoursUntil(invitation.last_sent_at)}h
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5">
                      {canResend && (
                        <AppTooltip content="Resend invite">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => handleResendInvitation(invitation)}
                            disabled={resendingInvitationId === invitation.id}
                          >
                            <RefreshCcwIcon
                              className={cn(
                                'h-3.5 w-3.5',
                                resendingInvitationId === invitation.id && 'animate-spin'
                              )}
                            />
                          </Button>
                        </AppTooltip>
                      )}
                      {auth.user.id === project.created_by && !isExpired && (
                        <AppTooltip content="Approve">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => handleApproveMember(invitation.id)}
                            disabled={approvingInvitationId === invitation.id}
                          >
                            {approvingInvitationId === invitation.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </AppTooltip>
                      )}
                      <AppTooltip content={isExpired ? 'Remove' : 'Cancel invite'}>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleCancelInvitation(invitation.id, invitation.email)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </AppTooltip>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="px-3 py-8 text-center text-[13px] text-muted-foreground">
                No pending invitations.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </BaseModal>
  )
}
