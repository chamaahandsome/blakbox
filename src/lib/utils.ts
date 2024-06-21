import { Decimal } from "@prisma/client/runtime/library";
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStripeOAuthLink(
  accountType: 'market' | 'vendor',
  state: string
) {
  return `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID}&scope=read_write&redirect_uri=${process.env.NEXT_PUBLIC_URL}${accountType}&state=${state}`
}


export const convertTicketData = (ticket) => {
  return {
    ...ticket,
    value: ticket.value instanceof Decimal ? ticket.value.toNumber() : ticket.value,
    createdAt: ticket.createdAt instanceof Date ? ticket.createdAt.toISOString() : ticket.createdAt,
    updatedAt: ticket.updatedAt instanceof Date ? ticket.updatedAt.toISOString() : ticket.updatedAt,
    // Convert nested objects if necessary
    Tags: ticket.Tags.map(tag => ({
      ...tag,
      createdAt: tag.createdAt instanceof Date ? tag.createdAt.toISOString() : tag.createdAt,
      updatedAt: tag.updatedAt instanceof Date ? tag.updatedAt.toISOString() : tag.updatedAt,
    })),
    Assigned: ticket.Assigned ? {
      ...ticket.Assigned,
      createdAt: ticket.Assigned.createdAt instanceof Date ? ticket.Assigned.createdAt.toISOString() : ticket.Assigned.createdAt,
      updatedAt: ticket.Assigned.updatedAt instanceof Date ? ticket.Assigned.updatedAt.toISOString() : ticket.Assigned.updatedAt,
    } : null,
    Customer: ticket.Customer ? {
      ...ticket.Customer,
      createdAt: ticket.Customer.createdAt instanceof Date ? ticket.Customer.createdAt.toISOString() : ticket.Customer.createdAt,
      updatedAt: ticket.Customer.updatedAt instanceof Date ? ticket.Customer.updatedAt.toISOString() : ticket.Customer.updatedAt,
    } : null,
  };
};
