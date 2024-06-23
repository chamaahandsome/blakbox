import ShopEditor from '@/app/(main)/vendor/[vendorId]/shops/[shopId]/editor/[shopPageId]/_components/shop-editor'
import { getDomainContent } from '@/lib/queries'
import EditorProvider from '@/providers/editor/editor-provider'
import { notFound } from 'next/navigation'
import React from 'react'

const Page = async ({
  params,
}: {
  params: { domain: string; path: string }
}) => {
  const domainData = await getDomainContent(params.domain.slice(0, -1))
  const pageData = domainData?.ShopPages.find(
    (page) => page.pathName === params.path
  )

  if (!pageData || !domainData) return notFound()

  return (
    <EditorProvider
      vendorId={domainData.vendorId}
      pageDetails={pageData}
      shopId={domainData.id}
    >
      <ShopEditor
        shopPageId={pageData.id}
        liveMode={true}
      />
    </EditorProvider>
  )
}

export default Page
