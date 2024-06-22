import InfoBar from '@/components/global/infobar'
import Sidebar from '@/components/sidebar'
import Unauthorized from '@/components/unauthorized'
import {
  getAuthUserDetails,
  getNotificationAndUser,
  verifyAndAcceptInvitation,
} from '@/lib/queries'
import { currentUser } from '@clerk/nextjs/server'
import { Role } from '@prisma/client'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  children: React.ReactNode
  params: { vendorId: string }
}

const VendorLayout = async ({ children, params }: Props) => {
  const marketId = await verifyAndAcceptInvitation()
  if (!marketId) return <Unauthorized />
  const user = await currentUser()
  if (!user) {
    return redirect('/')
  }

  let notifications: any = []

  if (!user.privateMetadata.role) {
    return <Unauthorized />
  } else {
    const allPermissions = await getAuthUserDetails()
    const hasPermission = allPermissions?.Permissions.find(
      (permissions) =>
        permissions.access && permissions.vendorId === params.vendorId
    )
    if (!hasPermission) {
      return <Unauthorized />
    }

    const allNotifications = await getNotificationAndUser(marketId)

    if (
      user.privateMetadata.role === 'MARKET_ADMIN' ||
      user.privateMetadata.role === 'MARKET_OWNER'
    ) {
      notifications = allNotifications
    } else {
      const filteredNoti = allNotifications?.filter(
        (item) => item.vendorId === params.vendorId
      )
      if (filteredNoti) notifications = filteredNoti
    }
  }

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar
        id={params.vendorId}
        type="vendor"
      />

      <div className="md:pl-[300px]">
        <InfoBar
          notifications={notifications}
          role={user.privateMetadata.role as Role}
          vendorId={params.vendorId as string}
        />
        <div className="relative">{children}</div>
      </div>
    </div>
  )
} 

export default VendorLayout;