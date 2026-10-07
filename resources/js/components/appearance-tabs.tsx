import { Appearance, useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { LucideIcon, Monitor, Moon, Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

interface AppearanceToggleTabProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'mini';
}

export default function AppearanceToggleTab({ className = '', variant = 'default', ...props }: AppearanceToggleTabProps) {
  const { appearance, updateAppearance } = useAppearance();

  const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ];

  return (
    <div className={cn('inline-flex w-fit gap-0.5 rounded-md border bg-muted/40 p-0.5', className)} {...props}>
      {tabs.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => updateAppearance(value)}
          className={cn(
            'flex items-center justify-center rounded-md border border-transparent px-2.5 py-1 transition-colors',
            appearance === value
              ? 'border-neutral-300 bg-neutral-200/80 text-foreground dark:border-neutral-700 dark:bg-neutral-800/80'
              : 'text-muted-foreground hover:bg-neutral-200/60 hover:text-foreground dark:hover:bg-neutral-700/60',
            variant === 'mini' && 'w-full'
          )}
        >
          <Icon className="h-3.5 w-3.5 -ml-0.5" />
          {variant === 'mini' ? null : <span className="ml-1.5 text-[13px]">{label}</span>}
        </button>
      ))}
    </div>
  );
}
