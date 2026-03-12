import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import React from 'react'
import { CalendarPage } from '@/components/calendar/calendar-page'

const Project = () => {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Calendar',
      href: '/calendar',
    },
  ];
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Calendar" />
      <CalendarPage />
    </AppLayout>
  )
}

export default Project
