import { getAuthUserDetails } from '@/lib/queries'
import { off } from 'process'
import React from 'react'
import MenuOptions from './menu-options'


type Props = {
  id: string
  type: 'market' | 'vendor'
}

const Sidebar = async ({ id, type }: Props) => {
  const user = await getAuthUserDetails()
  if (!user) return null

  if (!user.Market) return

  const details =
    type === 'market'
      ? user?.Market
      : user?.Market.Vendor.find((vendor) => vendor.id === id)

  const isWhiteLabeledMarket = user.Market.whiteLabel
  if (!details) return

  let sideBarLogo = user.Market.marketLogo || '/assets/bb-grey-logo.svg'

  if (!isWhiteLabeledMarket) {
    if (type === 'vendor') {
      sideBarLogo =
        user?.Market.Vendor.find((vendor) => vendor.id === id)
          ?.vendorLogo || user.Market.marketLogo
    }
  }

  const sidebarOpt =
    type === 'market'
      ? user.Market.SidebarOption || []
      : user.Market.Vendor.find((vendor) => vendor.id === id)
          ?.SidebarOption || []

  const vendors = user.Market.Vendor.filter((vendor) =>
    user.Permissions.find(
      (permission) =>
        permission.vendorId === vendor.id && permission.access
    )
  )

  return (
    <>
      <MenuOptions
        defaultOpen={true}
        details={details}
        id={id}
        sidebarLogo={sideBarLogo}
        sidebarOpt={sidebarOpt}
        vendors={vendors}
        user={user}
      />
      <MenuOptions
        details={details}
        id={id}
        sidebarLogo={sideBarLogo}
        sidebarOpt={sidebarOpt}
        vendors={vendors}
        user={user}
      />
    </>
  )
}

export default Sidebar;