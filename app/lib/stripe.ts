// lib/stripe.ts
import Stripe from "stripe";
import { getStripeSecretKey } from "../lib/environment";

const stripe = new Stripe(getStripeSecretKey(), {
  apiVersion: "2024-09-30.acacia",
});

export interface ProductWithPrices
  extends Omit<Stripe.Product, "default_price"> {
  prices: Stripe.Price[];
  default_price?: Stripe.Price | string | null;
  features?: Array<{ name: string }>;
}

export async function getProducts(): Promise<ProductWithPrices[]> {
  try {
    const products = await stripe.products.list({
      limit: 10,
      expand: ["data.default_price"],
      active: true,
    });

    const productsWithPrices = await Promise.all(
      products.data.map(async (product) => {
        const prices = await stripe.prices.list({
          product: product.id,
          active: true,
        });

        return {
          ...product,
          prices: prices.data,
        } as ProductWithPrices;
      })
    );

    return productsWithPrices;
  } catch (error) {
    console.error("Error in getProducts:", error);
    throw error;
  }
}

export async function getProductById(
  productId: string
): Promise<ProductWithPrices | null> {
  try {
    const product = await stripe.products.retrieve(productId, {
      expand: ["default_price"],
    });

    const prices = await stripe.prices.list({
      product: productId,
      active: true,
    });

    const productWithPrices: ProductWithPrices = {
      ...product,
      prices: prices.data,
    };

    return productWithPrices;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export const formatPrice = (price: Stripe.Price | null | undefined): string => {
  if (!price || typeof price.unit_amount !== "number") return "N/A";
  const amount = price.unit_amount / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};
