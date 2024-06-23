import { getShops } from '@/lib/queries'
import React from 'react'
import ShopsDataTable from './data-table'
import { Plus } from 'lucide-react'
import { columns } from './columns'
import ShopForm from '@/components/forms/shop-form'
import BlurPage from '@/components/global/blur-page'

const Shops = async ({ params }: { params: { vendorId: string } }) => {
  const shops = await getShops(params.vendorId)
  if (!shops) return null

  return (
    <BlurPage>
      <ShopsDataTable
        actionButtonText={
          <>
            <Plus size={15} />
            Create Shop
          </>
        }
        modalChildren={
          <ShopForm vendorId={params.vendorId}></ShopForm>
        }
        filterValue="name"
        columns={columns}
        data={shops}
      />
    </BlurPage>
  )
}

export default Shops
