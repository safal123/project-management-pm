import React, { useState } from 'react'
import { router, usePage } from '@inertiajs/react'
import { SharedData, User, Project } from '@/types'
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
import { UserPlus, Search, Mail, X, Check, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export const InviteMembersModal = () => {
  const { auth, project, errors } = usePage<
    SharedData & { project: Project; errors?: any }
  >().props

  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [isInviting, setIsInviting] = useState(false)

  const projectMembers = project.users || []

  const filteredMembers = projectMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleInviteByEmail = () => {
    if (!emailInput.trim()) return

    setIsInviting(true)
    router.post(
      route('projects.members.invite', { project: project.slug }),
      { email: emailInput },
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

  const handleRemoveMember = (userId: string) => {
    if (confirm('Are you sure you want to remove this member from the project?')) {
      router.delete(
        route('projects.members.remove', { project: project.slug, user: userId }),
        {
          preserveScroll: true,
          onSuccess: () => {
            toast.success('Member removed successfully')
          },
        }
      )
    }
  }

  const handleInvitationResponse = (userId: string, action: 'accept' | 'reject') => {
    // Show confirmation dialog for rejection
    if (action === 'reject' && !confirm('Are you sure you want to reject this invitation?')) {
      return
    }

    router.post(
      route('projects.members.respond', { project: project.slug, action }),
      { user_id: userId },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(`Invitation ${action}ed`)
        },
      }
    )
  }


  const getMemberStatus = (member: User) => {
    return member?.pivot?.status || 'not_invited'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <Badge variant="default" className="text-xs bg-green-500">
            <Check className="h-3 w-3 mr-1" />
            Accepted
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="destructive" className="text-xs">
            <X className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return null
    }
  }

  const getRoleBadge = (role: string) => {
    if (!role) return null

    const colorMap: Record<string, string> = {
      admin: 'bg-purple-500/20 text-purple-700 dark:text-purple-400',
      member: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
      viewer: 'bg-gray-500/20 text-gray-700 dark:text-gray-400',
    }

    return (
      <Badge variant="outline" className={`text-xs ${colorMap[role] || ''}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
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
      <DialogContent className="sm:max-w-[600px] bg-card">
        <DialogHeader>
          <DialogTitle>Invite Members to {project.name}</DialogTitle>
          <DialogDescription>
            Add team members to collaborate on this project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Invite by Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Invite by Email</Label>
            <div className="flex gap-2">
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
                {errors?.message && <p className="text-red-500 text-sm">{errors.message}</p>}
                {errors?.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>
              <Button
                onClick={handleInviteByEmail}
                disabled={!emailInput.trim() || isInviting}
              >
                {isInviting ? 'Inviting...' : 'Invite'}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Search Members */}
          <div className="space-y-2">
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

          <ScrollArea className="h-[300px] rounded-md border">
            <div className="p-4 space-y-2">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => {
                  const status = getMemberStatus(member)
                  const role = member?.pivot?.role || 'member'

                  return (
                    <div
                      key={member.id}
                      className={cn("flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors",
                        role === 'owner' && 'bg-muted')}
                    >
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
                            {getStatusBadge(status)}
                            {status === 'accepted' && getRoleBadge(role)}
                          </div>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>

                      {/* Action buttons based on status */}
                      <div className="flex items-center gap-2">
                        {status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleInvitationResponse(member.id, 'accept')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleInvitationResponse(member.id, 'reject')}
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {status === 'accepted' && member.id !== auth.user.id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                      ? 'No members found matching your search'
                      : 'No members in this project'}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
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
