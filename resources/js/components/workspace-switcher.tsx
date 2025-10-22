import React from 'react'
import { type WorkspaceSelectorProps } from '../types/index'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from './ui/sidebar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { useIsMobile } from '@/hooks/use-mobile'
import { ChevronsUpDown, Plus } from 'lucide-react'
import { DropdownMenuLabel } from './ui/dropdown-menu'
import { Separator } from './ui/separator'
import { Button } from './ui/button'
import { AddNewWorkspace } from './modals/add-new-workspace'

const WorkspaceSelector = ({ workspaces }: WorkspaceSelectorProps) => {
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  const activeTeam = workspaces[0];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <span className="text-xl font-semibold">{activeTeam.name.charAt(0)}</span>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeTeam.name}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="border w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg bg-background z-10 mt-1 p-1"
            align="end"
            side={isMobile ? 'bottom' : state === 'collapsed' ? 'left' : 'bottom'}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Workspaces
            </DropdownMenuLabel>
            <Separator />
            {workspaces.map((workspace) => (
              <DropdownMenuItem key={workspace.id} className="mt-1 px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md">
                <span className="text-sm font-medium">
                  {workspace.name.substring(0, 20)}
                </span>
              </DropdownMenuItem>
            ))}
            {/* Add a new workspace button */}
            <div className="mt-1 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md">
              <AddNewWorkspace />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

      </SidebarMenuItem >
    </SidebarMenu>
  )
}

export default WorkspaceSelector
