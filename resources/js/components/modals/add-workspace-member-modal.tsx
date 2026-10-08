import { useState } from 'react'
import { router, usePage } from '@inertiajs/react'
import { AlertCircle, Loader2, Mail, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SharedData } from '@/types'
import { BaseModal } from './base-modal'

export function AddWorkspaceMemberModal() {
  const { errors } = usePage<SharedData & { errors?: { email?: string; message?: string } }>().props
  const [open, setOpen] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = () => {
    const email = emailInput.trim()
    if (!email || isAdding) return

    setIsAdding(true)

    router.post(
      route('people.store'),
      { email },
      {
        preserveScroll: true,
        onSuccess: () => {
          setEmailInput('')
          setOpen(false)
          toast.success('Member added')
        },
        onError: (formErrors) => {
          toast.error(formErrors?.email || formErrors?.message || 'Could not add member')
        },
        onFinish: () => setIsAdding(false),
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
        <Button variant="outline" size="sm" className="h-8 gap-1.5 px-2.5 text-[13px]">
          <UserPlus className="h-3.5 w-3.5" />
          Add member
        </Button>
      }
      icon={<UserPlus />}
      title="Add member"
      description="Add someone who already has an account"
      className="sm:max-w-[420px]"
      footer={
        <>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!emailInput.trim() || isAdding} className="gap-2">
            {isAdding ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Adding...
              </>
            ) : (
              'Add to workspace'
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-1.5">
        <Label htmlFor="add-member-email">Email address</Label>
        <div className="relative">
          <Mail className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="add-member-email"
            type="email"
            placeholder="teammate@company.com"
            value={emailInput}
            onChange={(event) => setEmailInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleAdd()
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
        <p className="text-[11px] text-muted-foreground">
          They must already have an account. Use Invite if they don’t.
        </p>
      </div>
    </BaseModal>
  )
}
