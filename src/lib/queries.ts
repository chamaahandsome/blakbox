'use server';

import { currentUser } from "@clerk/nextjs/server";
import { db } from "./db";
import { redirect } from "next/navigation";
import { User } from "@prisma/client";

export const getAuthUserDetails = async () => {
    const user = await currentUser()

    if (!user) {
        return
    }

    const userData = await db.user.findUnique({
        where: { 
            email: user.emailAddresses[0].emailAddress
        },
        include: {
            Market: {
                include: {
                    SidebarOption: true,
                    Vendor: {
                        include:{
                            SidebarOption: true,
                        }
                    },
                },
            },
            Permissions: true,
        },
    })

    return userData
};

export const saveActivityLogNotifications = async ({
    marketId,
    description,
    vendorId,
}: {
    marketId?: string,
    description: string,
    vendorId?: string,
}) => {
    const authUser = await currentUser()
    let userData
    if(!authUser){
        const response = await db.user.findFirst({
            where: {
                Market: {
                    Vendor: {
                        some: { id: vendorId },
                    },
                },
            },
        })
        if (response) {
            userData = response
        }
    } else {
        userData = await db.user.findUnique({
            where: {
                email: authUser?.emailAddresses[0].emailAddress,
            },
        }) 
    }
    if(!userData) {
        console.log('User not found')
        return
    }
    let foundMarketId = marketId
    if (!foundMarketId) {
        if (!vendorId) {
            throw new Error('MarketId or VendorId is required')
        }
        const response = await db.vendor.findUnique({
            where: {
                id: vendorId,
            },
        })
        if (response) foundMarketId = response.marketId
    }
}

export const createTeamUser = async (marketId: string, user:User) => {
    if(user.role === 'MARKET_OWNER') return null
    const response = await db.user.create({data: {...user}})

    return response
}

export const verifyAndAcceptInvitation = async () => {
    const user = await currentUser()
    if (!user) return redirect('/sign-in')

    const invitationExists = await db.invitation.findUnique({
        where: {
            email: user.emailAddresses[0].emailAddress, 
            status:'PENDING'
        }
     })

     if (!invitationExists) {
        const userDetails = await createTeamUser(invitationExists.marketId, {
            email: invitationExists.email,
            marketId: invitationExists.marketId,
            avatarUrl: user.imageUrl,
            id: user.id,
            role: invitationExists.role,
            name: `${user.firstName} ${user.lastName}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
     }
    
}