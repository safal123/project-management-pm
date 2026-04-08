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
    <Empty className='dark:bg-primary/5 dark:border-primary/20 border border-dashed border-primary/50'>
      <EmptyHeader>
        <EmptyMedia variant="icon" className='dark:text-muted-foreground'>
          {icon}
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription className='text-muted-foreground'>
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
