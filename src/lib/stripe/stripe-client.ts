import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>
export const getStripe = (connectAccountId?: string) => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
      { stripeAccount: connectAccountId }
    )
  }
  return stripePromise
};