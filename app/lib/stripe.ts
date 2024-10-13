// lib/stripe.ts
import Stripe from "stripe";
import { getStripeSecretKey } from "../lib/environment";

const stripe = new Stripe(
  "sk_test_51PcF2THbwVKSSyqKVidtRCcBM4yQN8DB6WyvBgxCW0T1zGCTR9IVXz78Kuxe6IaX733KpUIeUYrx3QdPTKlzd6cO00fzBoI6H5",
  {
    apiVersion: "2024-09-30.acacia",
  }
);
console.log(
  "Stripe client initialized with key:",
  getStripeSecretKey()?.slice(0, 5) + "..."
);
export interface ProductWithPrices
  extends Omit<Stripe.Product, "default_price"> {
  prices: Stripe.Price[];
  default_price?: Stripe.Price | string | null;
  features?: Array<{ name: string }>;
}

export async function getProducts(): Promise<ProductWithPrices[]> {
  console.log("getProducts function called");
  try {
    const products = await stripe.products.list({
      limit: 10,
      expand: ["data.default_price"],
      active: true,
    });
    console.log("Products retrieved from Stripe:", products.data);

    const productsWithPrices = await Promise.all(
      products.data.map(async (product) => {
        const prices = await stripe.prices.list({
          product: product.id,
          active: true,
        });
        console.log(`Prices for product ${product.id}:`, prices.data);

        return {
          ...product,
          prices: prices.data,
        } as ProductWithPrices;
      })
    );

    console.log("Processed products with prices:", productsWithPrices);
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
    console.log(`Fetching product with ID: ${productId}`);
    const product = await stripe.products.retrieve(productId, {
      expand: ["default_price"],
    });

    console.log("Retrieved product:", product);

    console.log(`Fetching prices for product: ${productId}`);
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
    });
    console.log(
      `Retrieved ${prices.data.length} prices for product: ${productId}`
    );

    const productWithPrices: ProductWithPrices = {
      ...product,
      prices: prices.data,
    };

    console.log("Finished processing product with prices");
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
