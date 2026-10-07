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
    <DialogHeader className="gap-0 px-4 pt-4 pb-3">
      <div className="flex items-center gap-2.5">
        {icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted [&>svg]:size-3.5">
            {icon}
          </div>
        )}
        <div className="min-w-0 space-y-0.5 pr-6">
          <DialogTitle className="text-[13px] font-medium leading-tight">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-xs leading-snug text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </div>
      </div>
    </DialogHeader>
  )

  const body = (
    <div className="space-y-3 px-4 py-3 text-[13px] [&_label]:text-[13px]">
      {children}
    </div>
  )

  const footerSection = footer && (
    <>
      <Separator className="bg-border" />
      <DialogFooter className="gap-2 px-4 py-3 [&_button]:h-8 [&_button]:text-[13px] [&_button]:px-3">
        {footer}
      </DialogFooter>
    </>
  )

  const content = formProps ? (
    <form {...formProps}>
      {header}
      <Separator className="bg-border" />
      {body}
      {footerSection}
    </form>
  ) : (
    <>
      {header}
      <Separator className="bg-border" />
      {body}
      {footerSection}
    </>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={cn(
          'bg-white dark:bg-background gap-0 p-0 [&>button]:top-3 [&>button]:right-3',
          className
        )}
      >
        {content}
      </DialogContent>
    </Dialog>
  )
}
