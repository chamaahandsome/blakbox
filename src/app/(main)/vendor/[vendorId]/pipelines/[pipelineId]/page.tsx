import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { db } from '@/lib/db'
import {
  getLanesWithTicketAndTags,
  getPipelineDetails,
  updateLanesOrder,
  updateTicketsOrder,
} from '@/lib/queries'
import { LaneDetail } from '@/lib/types'
import { redirect } from 'next/navigation'
import React from 'react'
import PipelineInfoBar from '../_components/pipeline-infobar'
import PipelineSettings from '../_components/pipeline-settings'
import PipelineView from '../_components/pipeline-view'

type Props = {
  params: { vendorId: string; pipelineId: string }
}

const PipelinePage = async ({ params }: Props) => {
  const pipelineDetails = await getPipelineDetails(params.pipelineId)
  if (!pipelineDetails)
    return redirect(`/vendor/${params.vendorId}/pipelines`)

  const pipelines = await db.pipeline.findMany({
    where: { vendorId: params.vendorId },
  })

  const lanes = (await getLanesWithTicketAndTags(
    params.pipelineId
  )) as LaneDetail[]

  return (
    <Tabs
      defaultValue="view"
      className="w-full"
    >
      <TabsList className="bg-transparent border-b-2 h-16 w-full justify-between mb-4">
        <PipelineInfoBar
          pipelineId={params.pipelineId}
          vendorId={params.vendorId}
          pipelines={pipelines}
        />
        <div>
          <TabsTrigger value="view">Pipeline View</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </div>
      </TabsList>
      <TabsContent value="view">
        <PipelineView
          lanes={lanes}
          pipelineDetails={pipelineDetails}
          pipelineId={params.pipelineId}
          vendorId={params.vendorId}
          updateLanesOrder={updateLanesOrder}
          updateTicketsOrder={updateTicketsOrder}
        />
      </TabsContent>
      <TabsContent value="settings">
        <PipelineSettings
          pipelineId={params.pipelineId}
          pipelines={pipelines}
          vendorId={params.vendorId}
        />
      </TabsContent>
    </Tabs>
  )
}

export default PipelinePage