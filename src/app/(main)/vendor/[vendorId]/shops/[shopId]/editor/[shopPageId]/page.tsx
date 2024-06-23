import { db } from '@/lib/db'
import EditorProvider from '@/providers/editor/editor-provider'
import { redirect } from 'next/navigation'
import React from 'react'
import ShopEditorNavigation from './_components/shop-editor-navigation'
import ShopEditorSidebar from './_components/shop-editor-sidebar'
import ShopEditor from './_components/shop-editor'

type Props = {
  params: {
    vendorId: string
    shopId: string
    shopPageId: string
  }
}

const Page = async ({ params }: Props) => {
  const shopPageDetails = await db.shopPage.findFirst({
    where: {
      id: params.shopPageId,
    },
  })
  if (!shopPageDetails) {
    return redirect(
      `/vendor/${params.vendorId}/shops/${params.shopId}`
    )
  }

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 z-[20] bg-background overflow-hidden">
      <EditorProvider
        vendorId={params.vendorId}
        shopId={params.shopId}
        pageDetails={shopPageDetails}
      >
        <ShopEditorNavigation
          shopId={params.shopId}
          shopPageDetails={shopPageDetails}
          vendorId={params.vendorId}
        />
        <div className="h-full flex justify-center">
          <ShopEditor shopPageId={params.shopPageId} />
        </div>

        <ShopEditorSidebar vendorId={params.vendorId} />
      </EditorProvider>
    </div>
  )
}

export default Page
