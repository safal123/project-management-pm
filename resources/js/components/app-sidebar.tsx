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
import Can from '@/components/can'
import { ProjectModal } from '@/components/modals/project-modal'

const mainNav = [
  { title: 'Dashboard', route: 'dashboard', icon: LayoutDashboard },
]

const workspaceNav = [
  { title: 'People', route: 'people.index', icon: Users },
  { title: 'Activities', route: 'activity.index', icon: Clock },
  { title: 'Emails', route: 'emails.index', icon: Mail },
  { title: 'Billing', route: 'billing.index', icon: CreditCard },
  { title: 'Archive', route: 'archive.index', icon: Archive },
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
              {mainNav.map((item) => {
                const href = route(item.route)
                return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    asChild
                    isActive={path === new URL(href, window.location.origin).pathname}
                    className={navItemClass}
                  >
                    <Link href={href} prefetch>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <Can permission="project.create">
            <ProjectModal
              trigger={
                <SidebarGroupAction title="New project" className="top-1.5 right-2 [&>svg]:size-3.5">
                  <Plus />
                  <span className="sr-only">New project</span>
                </SidebarGroupAction>
              }
            />
          </Can>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton
                    tooltip={project.name}
                    asChild
                    isActive={path.includes(`/projects/${project.slug}`)}
                    className={navItemClass}
                  >
                    <Link href={route('projects.show', project.slug)} prefetch>
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
              {workspaceNav.map((item) => {
                const href = 'route' in item ? route(item.route) : item.url
                const pathname = href.startsWith('http') ? new URL(href).pathname : href
                return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    asChild
                    isActive={path === pathname || path.startsWith(pathname + '/')}
                    className={navItemClass}
                  >
                    <Link href={href} prefetch>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                )
              })}
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
