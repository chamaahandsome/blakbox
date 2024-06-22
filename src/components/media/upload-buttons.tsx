'use client'
import { useModal } from '@/providers/modal-provider'
import React from 'react'
import { Button } from '../ui/button'
import CustomModal from '../global/custom-modal'
import UploadMediaForm from '../forms/upload-media'


type Props = {
  vendorId: string
}

const MediaUploadButton = ({ vendorId }: Props) => {
  const { isOpen, setOpen, setClose } = useModal()

  return (
    <Button
      onClick={() => {
        setOpen(
          <CustomModal
            title="Upload Media"
            subheading="Upload a file to your media files"
          >
            <UploadMediaForm vendorId={vendorId}></UploadMediaForm>
          </CustomModal>
        )
      }}
    >
      Upload
    </Button>
  )
}

export default MediaUploadButton;