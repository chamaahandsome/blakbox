'use client'
import ContactUserForm from '@/components/forms/contact-user-form'
import CustomModal from '@/components/global/custom-modal'
import { Button } from '@/components/ui/button'
import { useModal } from '@/providers/modal-provider'
import React from 'react'

type Props = {
  vendorId: string
}

const CraeteContactButton = ({ vendorId }: Props) => {
  const { setOpen } = useModal()

  const handleCreateContact = async () => {
    setOpen(
      <CustomModal
        title="Create Or Update Contact information"
        subheading="Contacts of your customers."
      >
        <ContactUserForm vendorId={vendorId} />
      </CustomModal>
    )
  }

  return <Button onClick={handleCreateContact}>Create Contact</Button>
}

export default CraeteContactButton