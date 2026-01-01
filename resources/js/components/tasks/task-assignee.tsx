import React, { useMemo, useState } from 'react'
import { router, usePage } from '@inertiajs/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronDown, Search, UserCheck, X, Mail, Send, LoaderCircle } from 'lucide-react'
import { SharedData, Task, User, Project } from '@/types'
import { toast } from 'sonner'
import AppAvatar from '@/components/app-avatar'
import { InviteMembersModal } from '@/components/projects/invite-members-modal'

interface Props {
  task: Task
  className?: string
}

export default function TaskAssignee({ task, className }: Props) {
  const { auth, project, errors } = usePage<
    SharedData & { project: Project; users: User[] }
  >().props

  const [search, setSearch] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const members = useMemo(() => project.users ?? [], [project.users])

  const filteredMembers = useMemo(() => {
    if (inviteOpen) return []
    return members.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    )
  }, [members, search, inviteOpen])

  const assign = (assigned_to: string | null) => {
    router.patch(
      `/tasks/${task.id}`,
      { assigned_to },
      {
        preserveScroll: true,
        onStart: () => {
          setLoading(true)
        },
        onSuccess: () => {
          toast.success(
            `Assignee updated to ${assigned_to ? auth.user.name : 'none'
            }`
          )
          setLoading(false)
        },
        onError: () => toast.error('Failed to update assignee'),
      }
    )
  }

  const inviteByEmail = () => {
    if (!email.trim()) return
    router.post(
      route('invitations.store'),
      {
        email,
        workspace_id: project.workspace_id,
        project_id: project.id,
      },
      {
        preserveScroll: true,
        onStart: () => {
          setLoading(true)
        },
        onSuccess: () => {
          toast.success('Invitation sent successfully')
          router.reload({
            only: ['invitations'],
          })
          setLoading(false)
        },
        onError: (errors) => {
          const message = errors?.message || 'Failed to invite member'
          toast.error(message)
          setLoading(false)
        },
      }
    )
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Label className="w-24 text-sm">Assignee</Label>
      {/* OVerlay Loader */}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 justify-start -ml-1 py-5"
          >
            {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {/* {task.assigned_to.profile_picture?.url} */}
            {task.assigned_to ? (
              <>
                <AppAvatar
                  src={task.assigned_to.profile_picture?.url}
                  name={task.assigned_to.name}
                  size="sm"
                />
                <span className="text-sm font-medium">{task.assigned_to.name}</span>
              </>
            ) : (
              <span>Add assignee</span>
            )}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          className="w-96 p-0 border border-primary/30 rounded-md shadow-md bg-card"
        >
          {/* Search members */}
          {!inviteOpen && (
            <div className="px-2 py-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8"
                />
              </div>
            </div>
          )}

          {/* Assign to me */}
          {!task.assigned_to || task.assigned_to.id !== auth.user.id ? (
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault()
                assign(auth.user.id)
              }}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Assign to me
            </DropdownMenuItem>
          ) : null}

          {/* Members list */}
          <div className="max-h-60 overflow-y-auto">
            {filteredMembers.map((user) => (
              <DropdownMenuItem
                key={user.id}
                onSelect={(e) => {
                  e.preventDefault()
                  assign(user.id)
                }}
                className="flex items-center gap-2"
              >
                <AppAvatar
                  src={user.profile_picture?.url}
                  name={user.name}
                  size="sm"
                />
                <div className="text-sm leading-tight">
                  {user.name}
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </div>
              </DropdownMenuItem>
            ))}

            {!filteredMembers.length && !inviteOpen && (
              <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                No members found
              </div>
            )}
          </div>

          {/* Invite via email */}
          <div className="border-t">
            {!inviteOpen ? (
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  setInviteOpen(true)
                }}
              >
                <Mail className="h-4 w-4 mr-2" />
                Invite via email
              </DropdownMenuItem>
            ) : (
              <div className="px-2 py-2 flex flex-col gap-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-8"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && inviteByEmail()}
                  />
                  <Button size="sm" onClick={inviteByEmail}>
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setInviteOpen(false)
                    setEmail('')
                  }}
                  className="h-6 px-2 text-xs self-start"
                >
                  Cancel
                </Button>

                {errors?.email && (
                  <div className="bg-red-900/20 p-2 rounded-md mt-1 border border-red-500">
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="border-t p-1">
            <InviteMembersModal />
          </div>

          {/* Unassign */}
          {task.assigned_to && !inviteOpen && (
            <div className="border-t">
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  assign(null)
                }}
                className="text-destructive"
              >
                <X className="h-4 w-4 mr-2" />
                Unassign
              </DropdownMenuItem>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
