import React from 'react'

const page = ({params}: {params: {marketId: string}}) => {
  return (
    <div>
      {params.marketId}
    </div>
  )
}

export default page