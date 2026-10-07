import { Link, usePage } from '@inertiajs/react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { SharedData, Workspace } from '@/types'
import { Archive, Clock, CreditCard, Folder, LayoutDashboard, Mail, Plus, Settings, Users } from 'lucide-react'
import WorkspaceSelector from './workspace-switcher'
import { NavUser } from '@/components/nav-user'

const mainNav = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Projects', url: '/projects', icon: Folder },
]

const workspaceNav = [
  { title: 'People', url: '/people', icon: Users },
  { title: 'Activities', url: '/activity', icon: Clock },
  { title: 'Emails', url: '/emails', icon: Mail },
  { title: 'Billing', url: '/billing', icon: CreditCard },
  { title: 'Archive', url: '/archive', icon: Archive },
  { title: 'Settings', url: '/settings', icon: Settings },
]

const navItemClass =
  'text-muted-foreground border border-transparent data-[active=true]:border-neutral-300 data-[active=true]:bg-neutral-200/80 data-[active=true]:text-foreground dark:data-[active=true]:border-neutral-700 dark:data-[active=true]:bg-neutral-800/80'

export function AppSidebar() {
  const page = usePage<SharedData>()
  const path = page.url.split('?')[0]
  const workspaces = page.props.auth.user.workspaces
  const projects = page.props.sidebar_projects ?? []

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <WorkspaceSelector workspaces={workspaces as Workspace[]} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    asChild
                    isActive={path === item.url}
                    className={navItemClass}
                  >
                    <Link href={item.url} prefetch>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupAction asChild title="New project" className="top-1.5 right-2 [&>svg]:size-3.5">
            <Link href="/projects?create=1" prefetch>
              <Plus />
              <span className="sr-only">New project</span>
            </Link>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton
                    tooltip={project.name}
                    asChild
                    isActive={path === `/projects/${project.slug}` || path.startsWith(`/projects/${project.slug}/`)}
                    className={navItemClass}
                  >
                    <Link href={`/projects/${project.slug}`} prefetch>
                      <Folder />
                      <span>{project.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspaceNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    asChild
                    isActive={path === item.url || path.startsWith(item.url + '/')}
                    className={navItemClass}
                  >
                    <Link href={item.url} prefetch>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
