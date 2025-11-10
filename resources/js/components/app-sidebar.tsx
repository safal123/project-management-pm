import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import { SharedData, Workspace, type NavItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { LayoutGrid, ListIcon, CalendarIcon } from 'lucide-react';
import WorkspaceSelector from './workspace-switcher';
import { NavMainCollapse } from './nav-main-collapse';

const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutGrid,
  },
  {
    title: 'Projects',
    url: '/projects',
    icon: ListIcon,
  },
  {
    title: 'Calendar',
    url: '/calendar',
    icon: CalendarIcon,
  }
];

export function AppSidebar() {
  const workspaces = usePage<SharedData>().props.auth.user.workspaces;
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <WorkspaceSelector workspaces={workspaces as Workspace[]} />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={mainNavItems} />
        <NavMainCollapse items={mainNavItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
