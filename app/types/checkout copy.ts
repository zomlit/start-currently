// types/checkout.ts
import Stripe from "stripe";

export const frequencies = [
  { id: "1", value: "month", label: "Monthly", priceSuffix: "/month" },
  { id: "2", value: "year", label: "Annually", priceSuffix: "/year" },
] as const;

export type PricingTierFrequency = typeof frequencies[number];

export interface ProductWithPrices
  extends Omit<Stripe.Product, "default_price"> {
  prices: Stripe.Price[];
  default_price?: Stripe.Price | string | null;
}
