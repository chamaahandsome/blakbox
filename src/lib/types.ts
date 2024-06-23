import {
    Contact,
    Lane,
    Notification,
    Prisma,
    Role,
    Tag,
    Ticket,
    User,
  } from '@prisma/client'
  import {
    _getTicketsWithAllRelations,
    getAuthUserDetails,
    getShops,
    getMedia,
    getPipelineDetails,
    getTicketsWithTags,
    getUserPermissions,
  } from './queries'
  import { db } from './db'
  import { z } from 'zod'
import Stripe from 'stripe'


  
  export type NotificationWithUser =
    | ({
        User: {
          id: string
          name: string
          avatarUrl: string
          email: string
          createdAt: Date
          updatedAt: Date
          role: Role
          marketId: string | null
        }
      } & Notification)[]
    | undefined;
  
  export type UserWithPermissionsAndVendors = Prisma.PromiseReturnType<
    typeof getUserPermissions
  >;
  
  export const ShopPageSchema = z.object({
    name: z.string().min(1),
    pathName: z.string().optional(),
  })
  
  const __getUsersWithMarketVendorPermissionsSidebarOptions = async (
    marketId: string
  ) => {
    return await db.user.findFirst({
      where: { Market: { id: marketId } },
      include: {
        Market: { include: { Vendor: true } },
        Permissions: { include: { Vendor: true } },
      },
    })
  };
  
  export type AuthUserWithMarketSidebarOptionsVendors =
    Prisma.PromiseReturnType<typeof getAuthUserDetails>;
  
  export type UsersWithMarketVendorPermissionsSidebarOptions =
    Prisma.PromiseReturnType<
      typeof __getUsersWithMarketVendorPermissionsSidebarOptions
    >;
  
  export type GetMediaFiles = Prisma.PromiseReturnType<typeof getMedia>;
  
  export type CreateMediaType = Prisma.MediaCreateWithoutVendorInput;
  
  export type TicketAndTags = Ticket & {
    Tags: Tag[]
    Assigned: User | null
    Customer: Contact | null
  };
  
  export type LaneDetail = Lane & {
    Tickets: TicketAndTags[]
  };
  
  export const CreatePipelineFormSchema = z.object({
    name: z.string().min(1),
  });
  
  export const CreateShopFormSchema = z.object({
    name: z.string().min(1),
    description: z.string(),
    subDomainName: z.string().optional(),
    favicon: z.string().optional(),
  })
  
  export type PipelineDetailsWithLanesCardsTagsTickets = Prisma.PromiseReturnType<
    typeof getPipelineDetails
  >;
  
  export const LaneFormSchema = z.object({
    name: z.string().min(1),
  });
  
  export type TicketWithTags = Prisma.PromiseReturnType<typeof getTicketsWithTags>;
  
  const currencyNumberRegex = /^\d+(\.\d{1,2})?$/
  
  export const TicketFormSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    value: z.string().refine((value) => currencyNumberRegex.test(value), {
      message: 'Value must be a valid price.',
    }),
  });
  
  export type TicketDetails = Prisma.PromiseReturnType<
    typeof _getTicketsWithAllRelations
  >;
  
  // export const ContactUserFormSchema = z.object({
  //   name: z.string().min(1, 'Required'),
  //   email: z.string().email(),
  // });

  export const ContactUserFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Invalid phone number"), // Example validation for a 10-digit number
  });
  
  export type Address = {
    city: string
    country: string
    line1: string
    postal_code: string
    state: string
  };
  
  export type ShippingInfo = {
    address: Address
    name: string
  };
  
  export type StripeCustomerType = {
    email: string
    name: string
    shipping: ShippingInfo
    address: Address
  }
  
  export type PricesList = Stripe.ApiList<Stripe.Price>;
  
  export type ShopsForVendor = Prisma.PromiseReturnType<
    typeof getShops
  >[0];
  
  export type UpsertShopPage = Prisma.ShopPageCreateWithoutShopInput;