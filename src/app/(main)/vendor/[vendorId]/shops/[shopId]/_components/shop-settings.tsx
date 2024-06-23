import React from 'react'

import { Shop, Vendor } from '@prisma/client'
import { db } from '@/lib/db'
import { getConnectAccountProducts } from '@/lib/stripe/stripe-actions'


import ShopForm from '@/components/forms/shop-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import ShopProductsTable from './shop-products-table'

interface ShopSettingsProps {
  vendorId: string
  defaultData: Shop
}

const ShopSettings: React.FC<ShopSettingsProps> = async ({
  vendorId,
  defaultData,
}) => {
  //CHALLENGE: go connect your stripe to sell products

  const vendorDetails = await db.vendor.findUnique({
    where: {
      id: vendorId,
    },
  })

  if (!vendorDetails) return
  if (!vendorDetails.connectAccountId) return
  const products = await getConnectAccountProducts(
    vendorDetails.connectAccountId
  )

  return (
    <div className="flex gap-4 flex-col xl:!flex-row">
      <Card className="flex-1 flex-shrink">
        <CardHeader>
          <CardTitle>Shop Products</CardTitle>
          <CardDescription>
            Select the products and services you wish to sell on this shop.
            You can sell one time and recurring products too.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <>
            {vendorDetails.connectAccountId ? (
              <ShopProductsTable
                defaultData={defaultData}
                products={products}
              />
            ) : (
              'Connect your stripe account to sell products.'
            )}
          </>
        </CardContent>
      </Card>

      <ShopForm
        vendorId={vendorId}
        defaultData={defaultData}
      />
    </div>
  )
}

export default ShopSettings
