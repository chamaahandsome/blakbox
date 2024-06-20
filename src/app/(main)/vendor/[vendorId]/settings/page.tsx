import VendorDetails from '@/components/forms/vendor-details'
import UserDetails from '@/components/forms/user-details'
import BlurPage from '@/components/global/blur-page'
import { db } from '@/lib/db'

import React from 'react'
import { currentUser } from '@clerk/nextjs/server'

type Props = {
  params: { vendorId: string }
}

const VendorSettingPage = async ({ params }: Props) => {
  const authUser = await currentUser()
  if (!authUser) return
  const userDetails = await db.user.findUnique({
    where: {
      email: authUser.emailAddresses[0].emailAddress,
    },
  })
  if (!userDetails) return

  const vendor = await db.vendor.findUnique({
    where: { id: params.vendorId },
  })
  if (!vendor) return

  const marketDetails = await db.market.findUnique({
    where: { id: vendor.marketId },
    include: { Vendor: true },
  })

  if (!marketDetails) return
  const vendors = marketDetails.Vendor

  return (
    <BlurPage>
      <div className="flex lg:!flex-row flex-col gap-4">
        <VendorDetails
          marketDetails={marketDetails}
          details={vendor}
          userId={userDetails.id}
          userName={userDetails.name}
        />
        <UserDetails
          type="vendor"
          id={params.vendorId}
          vendors={vendors}
          userData={userDetails}
        />
      </div>
    </BlurPage>
  )
}

export default VendorSettingPage