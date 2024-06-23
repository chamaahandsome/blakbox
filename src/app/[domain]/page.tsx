import { db } from '@/lib/db'
import { getDomainContent } from '@/lib/queries'
import EditorProvider from '@/providers/editor/editor-provider'
import { notFound } from 'next/navigation'
import React from 'react'
import ShopEditorNavigation from '../(main)/vendor/[vendorId]/shops/[shopId]/editor/[shopPageId]/_components/shop-editor-navigation'
import ShopEditor from '../(main)/vendor/[vendorId]/shops/[shopId]/editor/[shopPageId]/_components/shop-editor'

const Page = async ({ params }: { params: { domain: string } }) => {
  const domainData = await getDomainContent(params.domain.slice(0, -1))
  if (!domainData) return notFound()

  const pageData = domainData.ShopPages.find((page) => !page.pathName)

  if (!pageData) return notFound()

  await db.shopPage.update({
    where: {
      id: pageData.id,
    },
    data: {
      visits: {
        increment: 1,
      },
    },
  })

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
