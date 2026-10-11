import { type UserStatus } from '@/types';
import { useEffect, useState } from 'react';

export function useVisibleStatus(user: UserStatus) {
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        setNow(Date.now());
        if (!user.status_expires_at) return;
        const timer = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, [user.status_expires_at]);
    const expired = user.status_expires_at && new Date(user.status_expires_at).getTime() <= now;
    return { text: expired ? null : user.status_text, emoji: expired ? null : user.status_emoji };
}

export function UserStatusLabel({ user }: { user: UserStatus }) {
    const status = useVisibleStatus(user);
    return (
        <span className="text-muted-foreground flex min-w-0 items-center gap-1.5 text-[11px]">
            <span className={`size-1.5 shrink-0 rounded-full ${user.availability === 'offline' ? 'bg-neutral-400' : 'bg-emerald-500'}`} />
            <span className="truncate">
                {status.text ? `${status.emoji || ''} ${status.text}` : user.availability === 'offline' ? 'Offline' : 'Online'}
            </span>
        </span>
    );
}
