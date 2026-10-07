import { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const gradientVariants = cva(
  "absolute inset-0",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-br from-primary/10 via-background/5 to-primary/5 dark:from-primary/20 dark:via-background/5 dark:to-primary/10",
        purple: "bg-gradient-to-br from-foreground/10 via-foreground/5 to-foreground/[0.03] dark:from-foreground/15 dark:via-foreground/8 dark:to-foreground/5",
        blue: "bg-gradient-to-br from-foreground/10 via-foreground/5 to-foreground/[0.03] dark:from-foreground/15 dark:via-foreground/8 dark:to-foreground/5",
        green: "bg-gradient-to-br from-foreground/10 via-foreground/5 to-foreground/[0.03] dark:from-foreground/15 dark:via-foreground/8 dark:to-foreground/5",
        cyan: "bg-gradient-to-br from-foreground/10 via-foreground/5 to-foreground/[0.03] dark:from-foreground/15 dark:via-foreground/8 dark:to-foreground/5",
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
          <div className="absolute -left-20 -top-20 h-[300px] w-[300px] rounded-full bg-primary/20 blur-[120px] dark:bg-primary/30" />
          <div className="absolute -right-20 top-1/3 h-[250px] w-[250px] rounded-full bg-primary/20 blur-[120px] dark:bg-primary/30" />
          <div className="absolute left-1/4 bottom-0 h-[200px] w-[200px] rounded-full bg-primary/10 blur-[100px] dark:bg-primary/20" />
        </>
      )}

      {children}
    </>
  );
}
