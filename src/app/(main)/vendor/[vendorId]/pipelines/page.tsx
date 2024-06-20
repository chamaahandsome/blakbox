import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  params: { vendorId: string }
}

const Pipelines = async ({ params }: Props) => {
  const pipelineExists = await db.pipeline.findFirst({
    where: { vendorId: params.vendorId },
  })

  if (pipelineExists)
    return redirect(
      `/vendor/${params.vendorId}/pipelines/${pipelineExists.id}`
    )

  try {
    const response = await db.pipeline.create({
      data: { name: 'First Pipeline', vendorId: params.vendorId },
    })

    return redirect(
      `/vendor/${params.vendorId}/pipelines/${response.id}`
    )
  } catch (error) {
    console.log(error)
  }
}

export default Pipelines;