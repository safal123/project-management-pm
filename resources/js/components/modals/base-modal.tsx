import { type ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface BaseModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: ReactNode
  icon?: ReactNode
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
  /** Wraps header + body + footer in a <form> element */
  formProps?: React.FormHTMLAttributes<HTMLFormElement>
}

export function BaseModal({
  open,
  onOpenChange,
  trigger,
  icon,
  title,
  description,
  children,
  footer,
  className,
  formProps,
}: BaseModalProps) {
  const header = (
    <DialogHeader className="px-6 pt-6 pb-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            {icon}
          </div>
        )}
        <div>
          <DialogTitle className="text-lg">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-sm">
              {description}
            </DialogDescription>
          )}
        </div>
      </div>
    </DialogHeader>
  )

  const body = <div className="px-6 py-5">{children}</div>

  const footerSection = footer && (
    <>
      <Separator />
      <DialogFooter className="px-6 py-4">{footer}</DialogFooter>
    </>
  )

  const content = formProps ? (
    <form {...formProps}>
      {header}
      <Separator />
      {body}
      {footerSection}
    </form>
  ) : (
    <>
      {header}
      <Separator />
      {body}
      {footerSection}
    </>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={cn('bg-card p-0 gap-0', className)}
      >
        {content}
      </DialogContent>
    </Dialog>
  )
}
