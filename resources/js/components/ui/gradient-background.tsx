import { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const gradientVariants = cva(
  "absolute inset-0",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-br from-purple-500/10 via-background/5 to-indigo-500/10 dark:from-purple-600/20 dark:via-background/5 dark:to-indigo-700/20",
        purple: "bg-gradient-to-br from-purple-500/15 via-pink-500/5 to-fuchsia-500/10 dark:from-purple-600/20 dark:via-pink-600/10 dark:to-fuchsia-700/20",
        blue: "bg-gradient-to-br from-blue-500/15 via-cyan-500/5 to-sky-500/10 dark:from-blue-600/20 dark:via-cyan-600/10 dark:to-sky-700/20",
        green: "bg-gradient-to-br from-emerald-500/15 via-teal-500/5 to-green-500/10 dark:from-emerald-600/20 dark:via-teal-600/10 dark:to-green-700/20",
        cyan: "bg-gradient-to-br from-cyan-500/15 via-sky-500/5 to-blue-500/10 dark:from-cyan-600/20 dark:via-sky-600/10 dark:to-blue-700/20",
        radial: "bg-radial-gradient from-primary/10 via-background/5 to-transparent dark:from-primary/20 dark:via-background/5 dark:to-transparent",
        soft: "bg-gradient-to-b from-background via-background/90 to-background/80 dark:from-background dark:via-background/90 dark:to-background/80",
      },
      intensity: {
        light: "opacity-40",
        medium: "opacity-70",
        strong: "opacity-100",
      },
    },
    defaultVariants: {
      variant: "primary",
      intensity: "medium",
    },
  }
);

export interface GradientBackgroundProps
  extends VariantProps<typeof gradientVariants> {
  className?: string;
  children?: ReactNode;
  withOrbs?: boolean;
}

export function GradientBackground({
  className,
  variant,
  intensity,
  children,
  withOrbs = false,
  ...props
}: GradientBackgroundProps) {
  return (
    <>
      <div
        className={cn(gradientVariants({ variant, intensity, className }))}
        {...props}
      />

      {withOrbs && (
        <>
          <div className="absolute -left-20 -top-20 h-[300px] w-[300px] rounded-full bg-purple-500/20 blur-[120px] dark:bg-purple-600/30" />
          <div className="absolute -right-20 top-1/3 h-[250px] w-[250px] rounded-full bg-blue-500/20 blur-[120px] dark:bg-blue-600/30" />
          <div className="absolute left-1/4 bottom-0 h-[200px] w-[200px] rounded-full bg-cyan-500/20 blur-[100px] dark:bg-cyan-600/30" />
        </>
      )}

      {children}
    </>
  );
}
