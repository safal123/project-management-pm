import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import React from 'react'

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
      This is calendar page.
    </AppLayout>
  )
}

export default Project
