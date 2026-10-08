import React from 'react'
import { SharedData, Workspace, type WorkspaceSelectorProps } from '../types/index'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from './ui/sidebar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { useIsMobile } from '@/hooks/use-mobile'
import { formatDistanceToNow } from 'date-fns'
import { Check, ChevronsUpDown } from 'lucide-react'
import { DropdownMenuLabel } from './ui/dropdown-menu'
import { Separator } from './ui/separator'
import { AddNewWorkspace } from './modals/add-new-workspace'
import { RenameWorkspaceModal } from './modals/rename-workspace-modal'
import { router, usePage } from '@inertiajs/react'

const WorkspaceSelector = ({ workspaces }: WorkspaceSelectorProps) => {
  const { auth } = usePage<SharedData>().props;
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  const activeTeam = auth.user.current_workspace as Workspace | null;

  const currentWorkspace = activeTeam || workspaces[0];

  if (!currentWorkspace) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="border border-sidebar-border bg-background hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-7 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                <span className="text-[13px] font-semibold">{currentWorkspace.name.charAt(0)}</span>
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-[13px] font-medium">
                  {currentWorkspace.name}
                </span>
                {currentWorkspace.created_at && (
                  <span className="truncate text-[11px] text-muted-foreground">
                    Joined {formatDistanceToNow(new Date(currentWorkspace.created_at))}
                  </span>
                )}
              </div>
              <ChevronsUpDown className="ml-auto size-3.5 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="border w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg bg-white dark:bg-background z-10 mt-1 p-1"
            align="end"
            side={isMobile ? 'bottom' : state === 'collapsed' ? 'left' : 'bottom'}
          >
            <DropdownMenuLabel className="px-2 py-1 text-[11px] text-muted-foreground">
              Workspaces
            </DropdownMenuLabel>
            <Separator />
            {workspaces.map((workspace) => (
              <DropdownMenuItem
                onClick={() => router.visit(route('workspace.switcher', { workspace: workspace.id }), { method: 'post' })}
                key={workspace.id}
                className="mt-0.5 cursor-pointer px-2 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md outline-none"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-medium">
                    {workspace.name.substring(0, 20)}
                  </span>
                  {auth.user.current_workspace_id === workspace.id && (
                    <Check className="ml-auto size-3.5 text-foreground" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
            {currentWorkspace.can_rename && (
              <div className="mt-0.5 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md">
                <RenameWorkspaceModal workspace={currentWorkspace} />
              </div>
            )}
            <div className="mt-0.5 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md">
              <AddNewWorkspace />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export default WorkspaceSelector
