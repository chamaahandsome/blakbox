import { getAuthUserDetails } from '@/lib/queries';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react';

const Page = async () => {

  const authUser = await currentUser();
  if (!authUser) return redirect('/sign-in')

  const marketId = await verifyAndAcceptInvitation()

  // get users details - level of access
  const user = await getAuthUserDetails();


  return (
    <div>
      market page
    </div>
  )
}

export default Page;
