import React from 'react'
import { SharedData, Workspace, type WorkspaceSelectorProps } from '../types/index'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from './ui/sidebar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { useIsMobile } from '@/hooks/use-mobile'
import { Check, ChevronsUpDown } from 'lucide-react'
import { DropdownMenuLabel } from './ui/dropdown-menu'
import { Separator } from './ui/separator'
import { AddNewWorkspace } from './modals/add-new-workspace'
import { router, usePage } from '@inertiajs/react'

const WorkspaceSelector = ({ workspaces }: WorkspaceSelectorProps) => {
  const { auth } = usePage<SharedData>().props;
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  const activeTeam = auth.user.current_workspace as Workspace | null;

  // If no workspace is set, use the first available workspace
  const currentWorkspace = activeTeam || workspaces[0];

  if (!currentWorkspace) {
    return null; // Or show a "Create Workspace" prompt
  }

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
                <span className="text-xl font-semibold">{currentWorkspace.name.charAt(0)}</span>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {currentWorkspace.name}
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
              <DropdownMenuItem
                onClick={() => router.visit(route('workspace.switcher', { workspace: workspace.id }), { method: 'post' })}
                key={workspace.id} className="mt-1 px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {workspace.name.substring(0, 20)}
                  </span>
                  {auth.user.current_workspace_id === workspace.id && (
                    <Check className="ml-auto size-4 text-primary" />
                  )}
                </div>
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
