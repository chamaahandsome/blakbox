'use server';

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { db } from "./db";
import { redirect } from "next/navigation";
import { Market, Plan, Role, User, Vendor } from "@prisma/client";
import { v4 } from "uuid";
// import {
//   CreateFunnelFormSchema,
//   CreateMediaType,
//   UpsertFunnelPage,
// } from './types'
// import { z } from 'zod'
// import { revalidatePath } from 'next/cache'

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

export const saveActivityLogsNotification = async ({
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
        await saveActivityLogsNotification({
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

  export const upsertVendor = async (vendor: Vendor) => {
    if (!vendor.companyEmail) return null
    const marketOwner = await db.user.findFirst({
      where: {
        Market: {
          id: vendor.marketId,
        },
        role: 'MARKET_OWNER',
      },
    })
    if (!marketOwner) return console.log('🔴Erorr could not create vendor')
    const permissionId = v4()
    const response = await db.vendor.upsert({
      where: { id: vendor.id },
      update: vendor,
      create: {
        ...vendor,
        Permissions: {
          create: {
            access: true,
            email: marketOwner.email,
            id: permissionId,
          },
          connect: {
            vendorId: vendor.id,
            id: permissionId,
          },
        },
        Pipeline: {
          create: { name: 'Lead Cycle' },
        },
        SidebarOption: {
          create: [
            {
              name: 'Launchpad',
              icon: 'clipboardIcon',
              link: `/vendor/${vendor.id}/launchpad`,
            },
            {
              name: 'Settings',
              icon: 'settings',
              link: `/vendor/${vendor.id}/settings`,
            },
            {
              name: 'Funnels',
              icon: 'pipelines',
              link: `/vendor/${vendor.id}/funnels`,
            },
            {
              name: 'Media',
              icon: 'database',
              link: `/vendor/${vendor.id}/media`,
            },
            {
              name: 'Automations',
              icon: 'chip',
              link: `/vendor/${vendor.id}/automations`,
            },
            {
              name: 'Pipelines',
              icon: 'flag',
              link: `/vendor/${vendor.id}/pipelines`,
            },
            {
              name: 'Contacts',
              icon: 'person',
              link: `/vendor/${vendor.id}/contacts`,
            },
            {
              name: 'Dashboard',
              icon: 'category',
              link: `/vendor/${vendor.id}`,
            },
          ],
        },
      },
    })
    return response
  }

  export const getUserPermissions = async (userId: string) => {
    const response = await db.user.findUnique({
      where: { id: userId },
      select: { Permissions: { include: { Vendor: true } } },
    })
  
    return response
  }

  export const updateUser = async (user: Partial<User>) => {
    const response = await db.user.update({
      where: { email: user.email },
      data: { ...user },
    })
  
    await clerkClient.users.updateUserMetadata(response.id, {
      privateMetadata: {
        role: user.role || 'VENDOR_USER',
      },
    })
  
    return response
  }
  
  export const changeUserPermissions = async (
    permissionId: string | undefined,
    userEmail: string,
    vendorId: string,
    permission: boolean
  ) => {
    try {
      const response = await db.permissions.upsert({
        where: { id: permissionId },
        update: { access: permission },
        create: {
          access: permission,
          email: userEmail,
          vendorId: vendorId,
        },
      })
      return response
    } catch (error) {
      console.log('🔴Could not change persmission', error)
    }
  }
  
  export const getVendorDetails = async (vendorId: string) => {
    const response = await db.vendor.findUnique({
      where: {
        id: vendorId,
      },
    })
    return response
  }
  
  export const deleteVendor = async (vendorId: string) => {
    const response = await db.vendor.delete({
      where: {
        id: vendorId,
      },
    })
    return response
  }
  
  export const deleteUser = async (userId: string) => {
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        role: undefined,
      },
    })
    const deletedUser = await db.user.delete({ where: { id: userId } })
  
    return deletedUser
  }
  
  export const getUser = async (id: string) => {
    const user = await db.user.findUnique({
      where: {
        id,
      },
    })
  
    return user
  }
  
  export const sendInvitation = async (
    role: Role,
    email: string,
    marketId: string
  ) => {
    const resposne = await db.invitation.create({
      data: { email, marketId, role },
    })
  
    try {
      const invitation = await clerkClient.invitations.createInvitation({
        emailAddress: email,
        redirectUrl: process.env.NEXT_PUBLIC_URL,
        publicMetadata: {
          throughInvitation: true,
          role,
        },
      })
    } catch (error) {
      console.log(error)
      throw error
    }
  
    return resposne
  }
  
  // export const getMedia = async (vendorId: string) => {
  //   const mediafiles = await db.vendor.findUnique({
  //     where: {
  //       id: vendorId,
  //     },
  //     include: { Media: true },
  //   })
  //   return mediafiles
  // }
  
  // export const createMedia = async (
  //   vendorId: string,
  //   mediaFile: CreateMediaType
  // ) => {
  //   const response = await db.media.create({
  //     data: {
  //       link: mediaFile.link,
  //       name: mediaFile.name,
  //       vendorId: vendorId,
  //     },
  //   })
  
  //   return response
  // }
  
  // export const deleteMedia = async (mediaId: string) => {
  //   const response = await db.media.delete({
  //     where: {
  //       id: mediaId,
  //     },
  //   })
  //   return response
  // }
  
  // export const getPipelineDetails = async (pipelineId: string) => {
  //   const response = await db.pipeline.findUnique({
  //     where: {
  //       id: pipelineId,
  //     },
  //   })
  //   return response
  // }
  
  // export const getLanesWithTicketAndTags = async (pipelineId: string) => {
  //   const response = await db.lane.findMany({
  //     where: {
  //       pipelineId,
  //     },
  //     orderBy: { order: 'asc' },
  //     include: {
  //       Tickets: {
  //         orderBy: {
  //           order: 'asc',
  //         },
  //         include: {
  //           Tags: true,
  //           Assigned: true,
  //           Customer: true,
  //         },
  //       },
  //     },
  //   })
  //   return response
  // }
  
  // export const upsertFunnel = async (
  //   vendorId: string,
  //   funnel: z.infer<typeof CreateFunnelFormSchema> & { liveProducts: string },
  //   funnelId: string
  // ) => {
  //   const response = await db.funnel.upsert({
  //     where: { id: funnelId },
  //     update: funnel,
  //     create: {
  //       ...funnel,
  //       id: funnelId || v4(),
  //       vendorId: vendorId,
  //     },
  //   })
  
  //   return response
  // }
  
  // export const upsertPipeline = async (
  //   pipeline: Prisma.PipelineUncheckedCreateWithoutLaneInput
  // ) => {
  //   const response = await db.pipeline.upsert({
  //     where: { id: pipeline.id || v4() },
  //     update: pipeline,
  //     create: pipeline,
  //   })
  
  //   return response
  // }
  
  // export const deletePipeline = async (pipelineId: string) => {
  //   const response = await db.pipeline.delete({
  //     where: { id: pipelineId },
  //   })
  //   return response
  // }
  
  // export const updateLanesOrder = async (lanes: Lane[]) => {
  //   try {
  //     const updateTrans = lanes.map((lane) =>
  //       db.lane.update({
  //         where: {
  //           id: lane.id,
  //         },
  //         data: {
  //           order: lane.order,
  //         },
  //       })
  //     )
  
  //     await db.$transaction(updateTrans)
  //     console.log('🟢 Done reordered 🟢')
  //   } catch (error) {
  //     console.log(error, 'ERROR UPDATE LANES ORDER')
  //   }
  // }
  
  // export const updateTicketsOrder = async (tickets: Ticket[]) => {
  //   try {
  //     const updateTrans = tickets.map((ticket) =>
  //       db.ticket.update({
  //         where: {
  //           id: ticket.id,
  //         },
  //         data: {
  //           order: ticket.order,
  //           laneId: ticket.laneId,
  //         },
  //       })
  //     )
  
  //     await db.$transaction(updateTrans)
  //     console.log('🟢 Done reordered 🟢')
  //   } catch (error) {
  //     console.log(error, '🔴 ERROR UPDATE TICKET ORDER')
  //   }
  // }
  
  // export const upsertLane = async (lane: Prisma.LaneUncheckedCreateInput) => {
  //   let order: number
  
  //   if (!lane.order) {
  //     const lanes = await db.lane.findMany({
  //       where: {
  //         pipelineId: lane.pipelineId,
  //       },
  //     })
  
  //     order = lanes.length
  //   } else {
  //     order = lane.order
  //   }
  
  //   const response = await db.lane.upsert({
  //     where: { id: lane.id || v4() },
  //     update: lane,
  //     create: { ...lane, order },
  //   })
  
  //   return response
  // }
  
  // export const deleteLane = async (laneId: string) => {
  //   const resposne = await db.lane.delete({ where: { id: laneId } })
  //   return resposne
  // }
  
  // export const getTicketsWithTags = async (pipelineId: string) => {
  //   const response = await db.ticket.findMany({
  //     where: {
  //       Lane: {
  //         pipelineId,
  //       },
  //     },
  //     include: { Tags: true, Assigned: true, Customer: true },
  //   })
  //   return response
  // }
  
  // export const _getTicketsWithAllRelations = async (laneId: string) => {
  //   const response = await db.ticket.findMany({
  //     where: { laneId: laneId },
  //     include: {
  //       Assigned: true,
  //       Customer: true,
  //       Lane: true,
  //       Tags: true,
  //     },
  //   })
  //   return response
  // }
  
  // export const getVendorTeamMembers = async (vendorId: string) => {
  //   const vendorUsersWithAccess = await db.user.findMany({
  //     where: {
  //       Market: {
  //         Vendor: {
  //           some: {
  //             id: vendorId,
  //           },
  //         },
  //       },
  //       role: 'VENDOR_USER',
  //       Permissions: {
  //         some: {
  //           vendorId: vendorId,
  //           access: true,
  //         },
  //       },
  //     },
  //   })
  //   return vendorUsersWithAccess
  // }
  
  // export const searchContacts = async (searchTerms: string) => {
  //   const response = await db.contact.findMany({
  //     where: {
  //       name: {
  //         contains: searchTerms,
  //       },
  //     },
  //   })
  //   return response
  // }
  
  // export const upsertTicket = async (
  //   ticket: Prisma.TicketUncheckedCreateInput,
  //   tags: Tag[]
  // ) => {
  //   let order: number
  //   if (!ticket.order) {
  //     const tickets = await db.ticket.findMany({
  //       where: { laneId: ticket.laneId },
  //     })
  //     order = tickets.length
  //   } else {
  //     order = ticket.order
  //   }
  
  //   const response = await db.ticket.upsert({
  //     where: {
  //       id: ticket.id || v4(),
  //     },
  //     update: { ...ticket, Tags: { set: tags } },
  //     create: { ...ticket, Tags: { connect: tags }, order },
  //     include: {
  //       Assigned: true,
  //       Customer: true,
  //       Tags: true,
  //       Lane: true,
  //     },
  //   })
  
  //   return response
  // }
  
  // export const deleteTicket = async (ticketId: string) => {
  //   const response = await db.ticket.delete({
  //     where: {
  //       id: ticketId,
  //     },
  //   })
  
  //   return response
  // }
  
  // export const upsertTag = async (
  //   vendorId: string,
  //   tag: Prisma.TagUncheckedCreateInput
  // ) => {
  //   const response = await db.tag.upsert({
  //     where: { id: tag.id || v4(), vendorId: vendorId },
  //     update: tag,
  //     create: { ...tag, vendorId: vendorId },
  //   })
  
  //   return response
  // }
  
  // export const getTagsForVendor = async (vendorId: string) => {
  //   const response = await db.vendor.findUnique({
  //     where: { id: vendorId },
  //     select: { Tags: true },
  //   })
  //   return response
  // }
  
  // export const deleteTag = async (tagId: string) => {
  //   const response = await db.tag.delete({ where: { id: tagId } })
  //   return response
  // }
  
  // export const upsertContact = async (
  //   contact: Prisma.ContactUncheckedCreateInput
  // ) => {
  //   const response = await db.contact.upsert({
  //     where: { id: contact.id || v4() },
  //     update: contact,
  //     create: contact,
  //   })
  //   return response
  // }
  
  // export const getFunnels = async (vendorId: string) => {
  //   const funnels = await db.funnel.findMany({
  //     where: { vendorId: vendorId },
  //     include: { FunnelPages: true },
  //   })
  
  //   return funnels
  // }
  
  // export const getFunnel = async (funnelId: string) => {
  //   const funnel = await db.funnel.findUnique({
  //     where: { id: funnelId },
  //     include: {
  //       FunnelPages: {
  //         orderBy: {
  //           order: 'asc',
  //         },
  //       },
  //     },
  //   })
  
  //   return funnel
  // }
  
  // export const updateFunnelProducts = async (
  //   products: string,
  //   funnelId: string
  // ) => {
  //   const data = await db.funnel.update({
  //     where: { id: funnelId },
  //     data: { liveProducts: products },
  //   })
  //   return data
  // }
  
  // export const upsertFunnelPage = async (
  //   vendorId: string,
  //   funnelPage: UpsertFunnelPage,
  //   funnelId: string
  // ) => {
  //   if (!vendorId || !funnelId) return
  //   const response = await db.funnelPage.upsert({
  //     where: { id: funnelPage.id || '' },
  //     update: { ...funnelPage },
  //     create: {
  //       ...funnelPage,
  //       content: funnelPage.content
  //         ? funnelPage.content
  //         : JSON.stringify([
  //             {
  //               content: [],
  //               id: '__body',
  //               name: 'Body',
  //               styles: { backgroundColor: 'white' },
  //               type: '__body',
  //             },
  //           ]),
  //       funnelId,
  //     },
  //   })
  
  //   revalidatePath(`/vendor/${vendorId}/funnels/${funnelId}`, 'page')
  //   return response
  // }
  
  // export const deleteFunnelePage = async (funnelPageId: string) => {
  //   const response = await db.funnelPage.delete({ where: { id: funnelPageId } })
  
  //   return response
  // }
  
  // export const getFunnelPageDetails = async (funnelPageId: string) => {
  //   const response = await db.funnelPage.findUnique({
  //     where: {
  //       id: funnelPageId,
  //     },
  //   })
  
  //   return response
  // }
  
  // export const getDomainContent = async (subDomainName: string) => {
  //   const response = await db.funnel.findUnique({
  //     where: {
  //       subDomainName,
  //     },
  //     include: { FunnelPages: true },
  //   })
  //   return response
  // }
  
  export const getPipelines = async (vendorId: string) => {
    const response = await db.pipeline.findMany({
      where: { vendorId: vendorId },
      include: {
        Lane: {
          include: { Tickets: true },
        },
      },
    })
    return response
  }