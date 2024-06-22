import { db } from '@/lib/db'
import React from 'react'
import { Plus } from 'lucide-react'
import SendInvitation from '@/components/forms/send-invitation'
import { currentUser } from '@clerk/nextjs/server'
import DataTable from './data-table'
import { columns } from './columns'



type Props = {
  params: { marketId: string }
}

const TeamPage = async ({ params }: Props) => {
  const authUser = await currentUser()
  const teamMembers = await db.user.findMany({
    where: {
      Market: {
        id: params.marketId,
      },
    },
    include: {
      Market: { include: { Vendor: true } },
      Permissions: { include: { Vendor: true } },
    },
  })

  if (!authUser) return null
  const marketDetails = await db.market.findUnique({
    where: {
      id: params.marketId,
    },
    include: {
      Vendor: true,
    },
  })

  if (!marketDetails) return

  return (
    <DataTable
      actionButtonText={
        <>
          <Plus size={15} />
          Add
        </>
      }
      modalChildren={<SendInvitation marketId={marketDetails.id} />}
      filterValue="name"
      columns={columns}
      data={teamMembers}
    ></DataTable>
  )
}

export default TeamPage;