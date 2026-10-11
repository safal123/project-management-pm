import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { useVisibleStatus } from '@/components/user-status';
import { useAppearance, type Appearance } from '@/hooks/use-appearance';
import { useInitials } from '@/hooks/use-initials';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types';
import { Link, router } from '@inertiajs/react';
import { BellOff, CircleHelp, CreditCard, LogOut, Monitor, Moon, Settings, Smartphone, Smile, Sun, Trash2, UserRound } from 'lucide-react';
import { useState } from 'react';

const appearanceLabel: Record<Appearance, string> = { system: 'System', light: 'Light', dark: 'Dark' };
const itemClass = 'cursor-pointer gap-3 rounded-md px-3 py-2 text-[13px] text-foreground focus:bg-muted';

export function UserMenuContent({ user, onStatusClick, onHelpClick }: { user: User; onStatusClick: () => void; onHelpClick: () => void }) {
    const cleanup = useMobileNavigation();
    const getInitials = useInitials();
    const { appearance, updateAppearance } = useAppearance();
    const status = useVisibleStatus(user);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const workspace = user.current_workspace_id;
    return (
        <>
            <div className="p-4">
                <div className="flex items-center gap-3">
                    <Avatar className="size-10 rounded-xl">
                        <AvatarImage src={user.profile_picture?.url || user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-muted rounded-xl text-sm font-medium">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold">{user.name}</p>
                            <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-medium">Free</span>
                        </div>
                        <p className="text-muted-foreground mt-0.5 truncate text-[12px]">{user.email}</p>
                    </div>
                </div>
                <DropdownMenuItem
                    onSelect={onStatusClick}
                    className="bg-muted/50 mt-4 cursor-pointer gap-2.5 rounded-lg border border-dashed px-3 py-2.5 text-[13px]"
                >
                    {status.emoji ? <span className="text-base">{status.emoji}</span> : <Smile className="text-muted-foreground size-4" />}
                    <span className="truncate">{status.text || 'Set your status'}</span>
                    <span
                        role="img"
                        aria-label={user.availability === 'offline' ? 'Offline' : 'Online'}
                        title={user.availability === 'offline' ? 'Offline' : 'Online'}
                        className={`ml-auto size-2 shrink-0 rounded-full ${user.availability === 'offline' ? 'bg-neutral-400' : 'bg-emerald-500'}`}
                    />
                </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator className="m-0" />
            <DropdownMenuGroup className="p-2">
                <DropdownMenuItem asChild className={itemClass}>
                    <Link href={route('profile.edit')} onClick={cleanup}>
                        <UserRound className="text-muted-foreground size-4" />
                        My Profile
                    </Link>
                </DropdownMenuItem>
                {workspace && (
                    <DropdownMenuItem asChild className={itemClass}>
                        <Link href={route('billing.index', { workspace })} onClick={cleanup}>
                            <CreditCard className="text-muted-foreground size-4" />
                            Billing &amp; Plans
                            <span className="bg-muted text-muted-foreground ml-auto rounded-full px-2 py-0.5 text-[10px]">Free</span>
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild className={itemClass}>
                    <Link href={route('profile.edit')} onClick={cleanup}>
                        <Settings className="text-muted-foreground size-4" />
                        Settings
                    </Link>
                </DropdownMenuItem>
                {workspace && (
                    <DropdownMenuItem asChild className={itemClass}>
                        <Link href={route('archive.index', { workspace })} onClick={cleanup}>
                            <Trash2 className="text-muted-foreground size-4" />
                            Trash<span className="text-muted-foreground ml-auto text-[10px]">Archive</span>
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem
                    className={itemClass}
                    disabled={saving}
                    role="menuitemcheckbox"
                    aria-checked={!!user.notifications_muted}
                    onSelect={(event) => {
                        event.preventDefault();
                        setSaving(true);
                        setError('');
                        router.patch(
                            route('user-notifications.update'),
                            { notifications_muted: !user.notifications_muted },
                            {
                                preserveScroll: true,
                                onFinish: () => setSaving(false),
                                onError: () => setError('Could not update notifications. Try again.'),
                            },
                        );
                    }}
                >
                    <BellOff className="text-muted-foreground size-4" />
                    Mute notifications
                    <span
                        aria-hidden="true"
                        className={`ml-auto flex h-5 w-8 items-center rounded-full p-0.5 transition-colors ${user.notifications_muted ? 'bg-primary' : 'bg-muted'}`}
                    >
                        <span
                            className={`bg-background size-4 rounded-full shadow-sm transition-transform ${user.notifications_muted ? 'translate-x-3' : ''}`}
                        />
                    </span>
                </DropdownMenuItem>
                {error && (
                    <p role="alert" className="text-destructive px-3 text-xs">
                        {error}
                    </p>
                )}
                <DropdownMenuItem className={itemClass} onSelect={onHelpClick}>
                    <CircleHelp className="text-muted-foreground size-4" />
                    Help &amp; support
                </DropdownMenuItem>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className={itemClass}>
                        <Monitor className="text-muted-foreground size-4" />
                        <span className="flex-1">Appearance</span>
                        <span className="text-muted-foreground text-[12px]">{appearanceLabel[appearance]}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="min-w-36 p-1">
                        {(
                            [
                                { value: 'system', icon: Monitor },
                                { value: 'light', icon: Sun },
                                { value: 'dark', icon: Moon },
                            ] as const
                        ).map(({ value, icon: Icon }) => (
                            <DropdownMenuItem key={value} className={itemClass} onSelect={() => updateAppearance(value)}>
                                <Icon className="text-muted-foreground size-4" />
                                {appearanceLabel[value]}
                                {appearance === value && <span className="ml-auto text-xs">✓</span>}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="m-0" />
            <div className="p-2">
                <DropdownMenuItem asChild className={`${itemClass} text-red-500 focus:text-red-500`}>
                    <Link method="post" href={route('logout')} as="button" className="w-full" onClick={cleanup}>
                        <LogOut className="size-4" />
                        Log out
                    </Link>
                </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator className="m-0" />
            <div
                className="text-muted-foreground flex items-center justify-between gap-3 px-4 py-3 text-[10px]"
                title="Native apps are not available yet"
            >
                <span className="flex items-center gap-1.5">
                    <Monitor className="size-3.5" />
                    Desktop
                </span>
                <span className="flex items-center gap-1.5">
                    <Smartphone className="size-3.5" />
                    Mobile
                </span>
                <span>Coming soon</span>
            </div>
        </>
    );
}
