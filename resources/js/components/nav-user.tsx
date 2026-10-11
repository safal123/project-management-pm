import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { UserDropdown } from '@/components/user-dropdown';
import { UserInfo } from '@/components/user-info';
import { useIsMobile } from '@/hooks/use-mobile';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';

export function NavUser() {
    const { auth } = usePage<SharedData>().props;
    const { state } = useSidebar();
    const isMobile = useIsMobile();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <UserDropdown user={auth.user} side={isMobile ? 'bottom' : state === 'collapsed' ? 'right' : 'top'}>
                    <SidebarMenuButton
                        size="lg"
                        className="group border-sidebar-border bg-background text-sidebar-accent-foreground hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent border"
                    >
                        <UserInfo user={auth.user} showEmail />
                        <ChevronsUpDown className="text-muted-foreground ml-auto size-3.5" />
                    </SidebarMenuButton>
                </UserDropdown>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
