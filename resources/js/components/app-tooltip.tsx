import React from 'react'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

interface AppTooltipProps {
  children: React.ReactNode
  content: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  open?: boolean
}

const AppTooltip = ({ children, content, side, open }: AppTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip open={open}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side} className="z-[9999]">
          <p className="text-xs ">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider >
  )
}

export default AppTooltip
