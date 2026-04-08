import { Link, usePage } from '@inertiajs/react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { SharedData, Workspace } from '@/types'
import { LayoutDashboard, FolderKanban, Calendar, Plus } from 'lucide-react'
import WorkspaceSelector from './workspace-switcher'
import { NavUser } from '@/components/nav-user'

const navItems = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Work',
    items: [
      { title: 'Projects', url: '/projects', icon: FolderKanban },
      { title: 'Calendar', url: '/calendar', icon: Calendar },
    ],
  },
]

export function AppSidebar() {
  const { url } = usePage()
  const workspaces = usePage<SharedData>().props.auth.user.workspaces

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="dark:bg-background rounded-lg">
        <WorkspaceSelector workspaces={workspaces as Workspace[]} />
      </SidebarHeader>

      <SidebarContent>
        {navItems.map((group) => (
          <SidebarGroup key={group.label} className="px-2 py-3">
            <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      asChild
                      isActive={url === item.url || url.startsWith(item.url + '/')}
                      className="data-[active=true]:bg-primary data-[active=true]:text-white dark:data-[active=true]:text-black hover:bg-primary/10"
                    >
                      <Link href={item.url} prefetch className="gap-3">
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))
        }

        <SidebarSeparator />

        <SidebarGroup className="px-2 py-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild tooltip="New project"
                className="text-primary hover:text-primary"
              >
                <Link
                  href="/projects?create=1"
                  prefetch
                  className="gap-3 text-primary hover:text-primary"
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  <span>New project</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent >

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar >
  )
}
