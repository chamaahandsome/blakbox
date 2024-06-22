import BlurPage from '@/components/global/blur-page'
import MediaComponent from '@/components/media'

import { getMedia } from '@/lib/queries'
import React from 'react'

type Props = {
  params: { vendorId: string }
}

const MediaPage = async ({ params }: Props) => {
  const data = await getMedia(params.vendorId)

  return (
    <BlurPage>
      <MediaComponent
        data={data}
        vendorId={params.vendorId}
      />
    </BlurPage>
  )
}

export default MediaPage;