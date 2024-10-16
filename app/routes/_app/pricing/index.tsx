import React from "react";
import {
  createFileRoute,
  useLoaderData,
  useRouter,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import PricingPage from "@/components/stripe/Pricing";
import { getProducts, ProductWithPrices } from "@/lib/stripe";
import { useAuth } from "@clerk/clerk-react";
import { Spinner } from "@/components/ui/spinner";
import { Container } from "@/components/layout/Container";

const getProductsFn = createServerFn("GET", async () => {
  const products = await getProducts();
  return products;
});

export const Route = createFileRoute("/_app/pricing/")({
  loader: async () => {
    const products = await getProductsFn();
    return { products };
  },
  component: PricingRoute,
});

function PricingRoute() {
  const router = useRouter();
  const loaderData = useLoaderData({ from: "/_app/pricing/" });
  const { userId } = useAuth();

  if (!loaderData) {
    console.error("Loader data is undefined");
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="w-8 fill-violet-300 text-white" />
      </div>
    );
  }

  const { products, error } = loaderData as {
    products: ProductWithPrices[];
    error?: string;
  };

  if (error) {
    console.error("Error from loader:", error);
    return <div>Error: {error}</div>;
  }

  const refreshProducts = async () => {
    console.log("Refreshing products");
    await router.invalidate();
  };

  return (
    <Container isDashboard maxWidth="7xl">
      <PricingPage products={products} />
      <button
        onClick={refreshProducts}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Refresh Products
      </button>
    </Container>
  );
}
