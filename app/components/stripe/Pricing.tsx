import { useState } from "react";
import Stripe from "stripe";
import GenericHeader from "@/components/GenericHeader";
import { FrequencySelector } from "./FrequencySelector";
import { PricingCard } from "./PricingCard";
import { SupportCard } from "@/components/SupportCard";
import {
  PricingTierFrequency,
  ProductWithPrices,
  frequencies,
} from "@/types/checkout";
import { useSortedProducts } from "@/hooks/useSortedProducts";
import { cn } from "@/lib/utils";

export default function PricingPage({
  products,
}: {
  products: ProductWithPrices[];
}) {
  console.log("PricingPage received products:", products);
  const [frequency, setFrequency] = useState<PricingTierFrequency>(
    frequencies[0]
  );

  const recurringProducts = products.filter(
    (p) =>
      p.default_price && (p.default_price as Stripe.Price).type === "recurring"
  );
  const oneTimeProducts = products.filter(
    (p) =>
      p.default_price && (p.default_price as Stripe.Price).type === "one_time"
  );

  const sortedRecurringProducts = useSortedProducts(recurringProducts);

  const handleFrequencyChange = (newFrequency: PricingTierFrequency) => {
    setFrequency(newFrequency);
  };

  return (
    <div>
      <GenericHeader
        category="Pricing"
        title="Creator Plans"
        className="font-black"
        description="Get priority support, expanded customization, early access and more."
      />

      <div className="mb-8 mt-16 flex justify-center">
        <FrequencySelector
          frequencies={frequencies}
          selectedFrequency={frequency}
          onFrequencyChange={handleFrequencyChange}
          products={sortedRecurringProducts}
        />
      </div>

      <div
        className={cn(
          "relative isolate mx-auto grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none",
          sortedRecurringProducts.length === 2 ? "lg:grid-cols-2" : "",
          sortedRecurringProducts.length === 3 ? "lg:grid-cols-3" : ""
        )}
      >
        {sortedRecurringProducts.map((product, index) => (
          <PricingCard
            key={product.id}
            product={product}
            frequency={frequency}
            index={index}
            // theme={theme || 'light'}
          />
        ))}
      </div>

      {oneTimeProducts.length > 0 && (
        <div className="my-8">
          {oneTimeProducts.map((product, index) => (
            <SupportCard
              key={product.id}
              product={product}
              // theme={theme || 'light'}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
