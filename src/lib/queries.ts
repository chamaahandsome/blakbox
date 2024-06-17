'use server';

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { db } from "./db";
import { redirect } from "next/navigation";
import { Market, Plan, User } from "@prisma/client";

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

export const saveActivityLogsNotifications = async ({
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
    if (vendorId) {
        await db.notification.create({
            data: {
                notification: `${userData.name} | ${description}`,
                User: {
                    connect: {
                        id: userData.id,
                    },
                },
                Market: {
                    connect: {
                        id: foundMarketId,
                    },
                },
                Vendor: {
                    connect: {
                        id: vendorId,
                    },
                },
            },
        })
    }
    else {
        await db.notification.create({
            data: {
                notification: `${userData.name} | ${description}`,
                User: {
                    connect: {
                        id: userData.id,
                    },
                },
                Market: {
                    connect: {
                        id: foundMarketId,
                    },
                },
            }
        })
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

     if (invitationExists) {
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
        await saveActivityLogsNotifications({
            marketId: invitationExists?.marketId,
            description: 'User accepted invitation',
            vendorId: undefined
         })

         if (userDetails) {
            await clerkClient.users.updateUserMetadata(user.id, {
                privateMetadata:{
                    role:userDetails.role || 'VENDOR_USER',
                }
            })

            await db.invitation.delete({
                where: { email:userDetails.email},
            })

            return userDetails.marketId

         } else return null
     } else {
        const market = await db.user.findUnique({
            where: {
                email: user.emailAddresses[0].emailAddress,
            },
        })

        return market ? market.marketId : null

     }
}

export const updateMarketDetails = async (
    marketId: string,
    marketDetails: Partial<Market>
  ) => {
    const response = await db.market.update({
      where: { id: marketId },
      data: { ...marketDetails },
    })
    return response
  }

  export const deleteMarket = async (marketId: string) => {
    const response = await db.market.delete({
      where: { id: marketId },
    })
    return response
  }

  export const initUser = async (newUser: Partial<User>) => {
    const user = await currentUser()
    if (!user) return
  
    const userData = await db.user.upsert({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
      update: newUser,
      create: {
        id: user.id,
        avatarUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
        name: `${user.firstName} ${user.lastName}`,
        role: newUser.role || 'VENDOR_USER',
      },
    })
  
    await clerkClient.users.updateUserMetadata(user.id, {
      privateMetadata: {
        role: newUser.role || 'VENDOR_USER',
      },
    })
  
    return userData
  }

  export const upsertMarket = async (market: Market, price?: Plan) => {
    if (!market.companyEmail) return null
    try {
      const marketDetails = await db.market.upsert({
        where: {
          id: market.id,
        },
        update: market,
        create: {
          users: {
            connect: { email: market.companyEmail },
          },
          ...market,
          SidebarOption: {
            create: [
              {
                name: 'Dashboard',
                icon: 'category',
                link: `/market/${market.id}`,
              },
              {
                name: 'Launchpad',
                icon: 'clipboardIcon',
                link: `/market/${market.id}/launchpad`,
              },
              {
                name: 'Billing',
                icon: 'payment',
                link: `/market/${market.id}/billing`,
              },
              {
                name: 'Settings',
                icon: 'settings',
                link: `/market/${market.id}/settings`,
              },
              {
                name: 'Vendors',
                icon: 'person',
                link: `/market/${market.id}/all-vendors`,
              },
              {
                name: 'Team',
                icon: 'shield',
                link: `/market/${market.id}/team`,
              },
            ],
          },
        },
      })
      return marketDetails
    } catch (error) {
      console.log(error)
    }
  }


  export const getNotificationAndUser = async (marketId: string) => {
    try {
      const response = await db.notification.findMany({
        where: { marketId },
        include: { User: true },
        orderBy: {
          createdAt: 'desc',
        },
      })
      return response
    } catch (error) {
      console.log(error)
    }
  }