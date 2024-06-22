'use client'
import VendorDetails from '@/components/forms/vendor-details'
import CustomModal from '@/components/global/custom-modal'
import { Button } from '@/components/ui/button'
import { useModal } from '@/providers/modal-provider'
import { Market, MarketSidebarOption, Vendor, User } from '@prisma/client'
import { PlusCircleIcon } from 'lucide-react'
import React from 'react'
import { twMerge } from 'tailwind-merge'

type Props = {
  user: User & {
    Market:
      | (
          | Market
          | (null & {
              Vendor: Vendor[]
              SideBarOption: MarketSidebarOption[]
            })
        )
      | null
  }
  id: string
  className: string
}

const CreateVendorButton = ({ className, id, user }: Props) => {
  const { setOpen } = useModal()
  const marketDetails = user.Market

  if (!marketDetails) return

  return (
    <Button
      className={twMerge('w-full flex gap-4', className)}
      onClick={() => {
        setOpen(
          <CustomModal
            title="Create a Vendor"
            subheading="Input details of your Vendor"
          >
            <VendorDetails
              marketDetails={marketDetails}
              userId={user.id}
              userName={user.name}
            />
          </CustomModal>
        )
      }}
    >
      <PlusCircleIcon size={15} />
      Create Vendor
    </Button>
  )
}

export default CreateVendorButton;