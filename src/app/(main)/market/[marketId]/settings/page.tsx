import MarketDetails from '@/components/forms/market-details'
import UserDetails from '@/components/forms/user-details'

import { db } from '@/lib/db'
import { currentUser } from '@clerk/nextjs/server'

import React from 'react'

type Props = {
  params: { marketId: string }
}

const SettingsPage = async ({ params }: Props) => {
  const authUser = await currentUser()
  if (!authUser) return null

  const userDetails = await db.user.findUnique({
    where: {
      email: authUser.emailAddresses[0].emailAddress,
    },
  })

  if (!userDetails) return null
  const marketDetails = await db.market.findUnique({
    where: {
      id: params.marketId,
    },
    include: {
      Vendor: true,
    },
  })

  if (!marketDetails) return null

  const vendors = marketDetails.Vendor

  return (
    <div className="flex lg:!flex-row flex-col gap-4">
      <MarketDetails data={marketDetails} />
      <UserDetails
        type="market"
        id={params.marketId}
        vendors={vendors}
        userData={userDetails}
      />
    </div>
  )
}

export default SettingsPage