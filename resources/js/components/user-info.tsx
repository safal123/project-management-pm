import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';

export function UserInfo({ user, showEmail = false }: { user: User; showEmail?: boolean }) {
  const getInitials = useInitials();

  return (
    <>
      <Avatar className="h-7 w-7 overflow-hidden rounded-full">
        <AvatarImage src={user.profile_picture?.url} alt={user.name} />
        <AvatarFallback className="rounded-full bg-neutral-200 text-[11px] text-black dark:bg-neutral-700 dark:text-white">
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left leading-tight">
        <span className="truncate text-[13px] font-medium">{user.name}</span>
        {showEmail && <span className="text-muted-foreground truncate text-[11px]">{user.email}</span>}
      </div>
    </>
  );
}
