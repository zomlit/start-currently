// hooks/useSortedProducts.ts
import { useMemo } from "react";
import Stripe from "stripe";
import { ProductWithPrices } from "../types/checkout";

export function useSortedProducts(products: ProductWithPrices[]) {
  return useMemo(() => {
    return [...products].sort((a, b) => {
      const aPrice = (a.prices as Stripe.Price[]).find(
        (p) => p.recurring?.interval === "month"
      );
      const bPrice = (b.prices as Stripe.Price[]).find(
        (p) => p.recurring?.interval === "month"
      );
      return (aPrice?.unit_amount || 0) - (bPrice?.unit_amount || 0);
    });
  }, [products]);
}
