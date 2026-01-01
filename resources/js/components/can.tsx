import { ReactNode } from 'react'
import { usePage } from '@inertiajs/react'
import { SharedData } from '@/types'

interface Props {
  permission: string
  children: ReactNode
}

export default function Can({ permission, children }: Props) {
  const { auth } = usePage<SharedData>().props

  if (!auth?.permissions?.can.includes(permission)) return null

  return <>{children}</>
}
