import Unauthorized from '@/components/unauthorized'
import { getAuthUserDetails, verifyAndAcceptInvitation } from '@/lib/queries'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  searchParams: { state: string; code: string }
}

const VendorMainPage = async ({ searchParams }: Props) => {
  console.log('Vendor LaunchPad SearchParams:', searchParams)

  const marketId = await verifyAndAcceptInvitation()

  if (!marketId) {
    return <Unauthorized />
  }

  const user = await getAuthUserDetails()
  if (!user) return

  const getFirstVendorWithAccess = user.Permissions.find(
    (permission) => permission.access === true
  )

  if (searchParams.state) {
    const statePath = searchParams.state.split('___')[0]
    const stateVendorId = searchParams.state.split('___')[1]
    if (!stateVendorId) return <Unauthorized />
    return redirect(
      `/vendor/${stateVendorId}/${statePath}?code=${searchParams.code}`
    )
  }

  if (getFirstVendorWithAccess) {
    return redirect(`/vendor/${getFirstVendorWithAccess.vendorId}`)
  }

  return <Unauthorized />
}

export default VendorMainPage;