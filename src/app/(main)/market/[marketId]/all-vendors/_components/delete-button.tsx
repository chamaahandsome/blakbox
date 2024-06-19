'use client'
import {
  deleteVendor,
  getVendorDetails,
  saveActivityLogsNotification,
} from '@/lib/queries'
import { useRouter } from 'next/navigation'
import React from 'react'

type Props = {
  vendorId: string
}

const DeleteButton = ({ vendorId }: Props) => {
  const router = useRouter()

  return (
    <div
      className="text-white"
      onClick={async () => {
        const response = await getVendorDetails(vendorId)
        await saveActivityLogsNotification({
          marketId: undefined,
          description: `Deleted a Vendor | ${response?.name}`,
          vendorId,
        })
        await deleteVendor(vendorId)
        router.refresh()
      }}
    >
      Delete Vendor
    </div>
  )
}

export default DeleteButton