import MarketDetails from '@/components/forms/market-details';
import { getAuthUserDetails, verifyAndAcceptInvitation } from '@/lib/queries';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react';

const MarketPage = async ({searchParams}: {searchParams: {plan:PlaneLayout; state:string; code:string}}) => {
  
  const marketId = await verifyAndAcceptInvitation()

  console.log(marketId)

  // get users details - level of access
  const user = await getAuthUserDetails();
  if (marketId){
    if(user?.role === "VENDOR_GUEST" || user?.role === "VENDOR_USER"){
      return redirect ('/vendor')
    }
    else if (user?.role === "MARKET_OWNER" || user?.role === "MARKET_ADMIN"){
      if (searchParams.plan) {
        return redirect(`/market/${marketId}/billing?plan=${searchParams.plan}`)
      }
      if (searchParams.state){
        const statePath = searchParams.state.split('__')[0]
        const stateMarketId = searchParams.state.split('___')[1]
        if (!stateMarketId) return <div>Not Authorized</div>
        return redirect(`/market/${stateMarketId}/${statePath}?code=${searchParams.code}`)
      }
      else return redirect(`/market/${marketId}`)
    }
    else {
      return <div>Not Authorized</div>
    }
  }

  const authUser = await currentUser()

  return <div className='flex justify-center items-center mt-4'>
    <div className='max-w-[850px] border-[1px] p-4 rounded-xl'>
      <h1 className='text-4xl'>Setup Your Market</h1>
      <MarketDetails data={{ companyEmail: authUser?.emailAddresses[0].emailAddress}} />
    </div>
  </div>

}

export default MarketPage;
