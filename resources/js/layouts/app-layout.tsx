import { Toaster } from '@/components/ui/sonner';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
  <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
    {children}
    <Toaster
      position="top-right"
      duration={3500}
      // richColors
      closeButton
      expand
      toastOptions={{
        classNames: {
          toast:
            'rounded-xl shadow-lg border bg-background text-foreground',
          title: 'font-semibold',
          description: 'text-sm opacity-90',
          actionButton:
            'bg-primary text-primary-foreground hover:bg-primary/90',
          cancelButton:
            'bg-muted text-muted-foreground hover:bg-muted/80',
        },
      }}
    />
  </AppLayoutTemplate>
);
