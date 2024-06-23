import BlurPage from '@/components/global/blur-page'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getShop } from '@/lib/queries'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'
import ShopSettings from './_components/shop-settings'
import ShopSteps from './_components/shop-steps'

type Props = {
  params: { shopId: string; vendorId: string }
}

const ShopPage = async ({ params }: Props) => {
  const shopPages = await getShop(params.shopId)
  if (!shopPages)
    return redirect(`/vendor/${params.vendorId}/shops`)

  return (
    <BlurPage>
      <Link
        href={`/vendor/${params.vendorId}/shops`}
        className="flex justify-between gap-4 mb-4 text-muted-foreground"
      >
        Back
      </Link>
      <h1 className="text-3xl mb-8">{shopPages.name}</h1>
      <Tabs
        defaultValue="steps"
        className="w-full"
      >
        <TabsList className="grid  grid-cols-2 w-[50%] bg-transparent ">
          <TabsTrigger value="steps">Steps</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="steps">
          <ShopSteps
            shop={shopPages}
            vendorId={params.vendorId}
            pages={shopPages.ShopPages}
            shopId={params.shopId}
          />
        </TabsContent>
        <TabsContent value="settings">
          <ShopSettings
            vendorId={params.vendorId}
            defaultData={shopPages}
          />
        </TabsContent>
      </Tabs>
    </BlurPage>
  )
}

export default ShopPage
