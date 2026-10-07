import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useMobileNavigation } from '@/hooks/use-mobile-navigation'
import { useInitials } from '@/hooks/use-initials'
import { useAppearance, type Appearance } from '@/hooks/use-appearance'
import { type User } from '@/types'
import { Link } from '@inertiajs/react'
import { LogOut, Monitor, Moon, Settings, Sun, UserRound } from 'lucide-react'

interface UserMenuContentProps {
  user: User
}

const appearanceLabel: Record<Appearance, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
}

const itemClass =
  'cursor-pointer gap-2.5 rounded-md px-2 py-2 text-[13px] text-foreground focus:bg-muted'

export function UserMenuContent({ user }: UserMenuContentProps) {
  const cleanup = useMobileNavigation()
  const getInitials = useInitials()
  const { appearance, updateAppearance } = useAppearance()

  return (
    <div className="p-1">
      <div className="flex items-start gap-2.5 px-2 py-2">
        <Avatar className="h-9 w-9 rounded-full">
          <AvatarImage src={user.profile_picture?.url} alt={user.name} />
          <AvatarFallback className="rounded-full bg-muted text-[11px] font-medium text-foreground">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-[13px] font-medium">{user.name}</p>
            <span className="rounded-full bg-muted px-1.5 py-px text-[10px] font-medium text-muted-foreground">
              Free
            </span>
          </div>
          <p className="truncate text-[12px] text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <DropdownMenuSeparator className="my-1.5" />

      <DropdownMenuGroup>
        <DropdownMenuItem asChild className={itemClass}>
          <Link href={route('profile.edit')} prefetch onClick={cleanup}>
            <UserRound className="h-4 w-4 text-muted-foreground" />
            My Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={itemClass}>
          <Link href="/settings" prefetch onClick={cleanup}>
            <Settings className="h-4 w-4 text-muted-foreground" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className={`${itemClass} focus:bg-muted data-[state=open]:bg-muted`}>
            <Monitor className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Appearance</span>
            <span className="text-[12px] text-muted-foreground">{appearanceLabel[appearance]}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="z-[9999] min-w-36 p-1">
            <DropdownMenuItem className={itemClass} onClick={() => updateAppearance('system')}>
              <Monitor className="h-4 w-4 text-muted-foreground" />
              System
            </DropdownMenuItem>
            <DropdownMenuItem className={itemClass} onClick={() => updateAppearance('light')}>
              <Sun className="h-4 w-4 text-muted-foreground" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem className={itemClass} onClick={() => updateAppearance('dark')}>
              <Moon className="h-4 w-4 text-muted-foreground" />
              Dark
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuGroup>

      <DropdownMenuSeparator className="my-1.5" />

      <DropdownMenuItem asChild className={`${itemClass} text-red-500 focus:bg-red-50 focus:text-red-500 dark:focus:bg-red-950/40`}>
        <Link method="post" href={route('logout')} as="button" onClick={cleanup}>
          <LogOut className="h-4 w-4" />
          Log out
        </Link>
      </DropdownMenuItem>
    </div>
  )
}
