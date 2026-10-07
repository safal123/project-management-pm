import React from 'react'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"

interface AppEmptyProps {
  title: string
  description?: string
  icon: React.ReactNode
  action?: React.ReactNode
}

const AppEmpty = ({ title, description, icon, action }: AppEmptyProps) => {
  return (
    <Empty className="border border-dashed border-border p-8 md:p-10">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="size-9 [&_svg:not([class*='size-'])]:size-4">
          {icon}
        </EmptyMedia>
        <EmptyTitle className="text-[13px] font-medium">{title}</EmptyTitle>
        <EmptyDescription className="text-xs text-muted-foreground">
          {description}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {action}
      </EmptyContent>
    </Empty>
  )
}

export default AppEmpty
