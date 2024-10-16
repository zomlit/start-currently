// components/PricingCard.tsx
import React from "react";
import { motion, AnimatePresence, animate } from "framer-motion";
import { MagicCard } from "@/components/ui/magic-card";
import BlurFade from "@/components/ui/blur-fade";
import { AnimatedLink } from "@/components/ui/animated-link";
import { FeatureList } from "@/components/FeatureList";
import { SkeletonCard } from "@/components/SkeletonCard";
import { formatPrice } from "@/lib/stripe";

import { ProductWithPrices, PricingTierFrequency } from "@/types/checkout";
import Stripe from "stripe";
import { Link } from "@tanstack/react-router";

interface PricingCardProps {
  product: ProductWithPrices;
  frequency: PricingTierFrequency;
  index: number;
  theme: string;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  product,
  frequency,
  index,
  theme,
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  const getPriceForFrequency = (frequency: string) => {
    const prices = product.prices as Stripe.Price[];
    return prices.find((price) => price.recurring?.interval === frequency);
  };

  React.useEffect(() => {
    const animationDuration = 500;
    const timer = setTimeout(() => setIsLoaded(true), animationDuration);
    return () => clearTimeout(timer);
  }, [index]);

  const currentPrice = getPriceForFrequency(frequency.value);

  const renderIcons = () => {
    switch (product.name) {
      case "Creator Kickstart":
      // return <IconRocket />
      case "Rising Creator":
      // return <IconTrendingUp />
      case "Supersonic Streamer":
      // return <IconAward />
      default:
        return null;
    }
  };

  return (
    <>
      <motion.div
        className="relative"
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div
          className={`absolute left-0 top-0 flex h-full w-full flex-col space-y-3 transition-opacity duration-1000 ${
            isLoaded ? "opacity-0" : "opacity-100"
          }`}
        >
          <SkeletonCard />
        </div>
        <MagicCard
          className="!bg-transparent"
          gradientColor={theme === "dark" ? "" : ""}
        >
          <div className="b-rounded-lg absolute bottom-0 h-[150px] w-full divide-x border-t-[1px] border-black/60 bg-white/5 shadow-inner before:absolute before:h-[1px] before:w-full before:bg-white/10 before:content-['']"></div>

          <BlurFade
            className="border-0"
            key={product.id}
            yOffset={-1}
            delay={0.5 + index * 0.25}
            inView
          >
            <div className="relative rounded-lg bg-white p-8 dark:bg-white/10">
              {/* <div className="absolute -inset-y-8 left-0 -ml-4 w-px bg-white/10 [mask-image:linear-gradient(to_top,transparent,white_20rem,white_calc(100%-20rem),transparent)]"></div>
            <div className="absolute -inset-y-8 right-0 -mr-4 w-px bg-white/10 [mask-image:linear-gradient(to_top,transparent,white_20rem,white_calc(100%-20rem),transparent)]"></div>
            <div className="absolute -inset-x-8 bottom-0 -mb-4 h-px bg-white/15 [mask-image:linear-gradient(to_left,transparent,white_20rem,white_calc(100%-20rem),transparent)]"></div>
            <div className="absolute -top-px right-16 h-8 overflow-hidden">
              <div className="-mt-px flex h-[2px] w-56 -scale-x-100">
                <div className="w-full flex-none blur-sm [background-image:linear-gradient(90deg,rgba(56,189,248,0)_0%,#0EA5E9_32.29%,rgba(236,72,153,0.3)_67.19%,rgba(236,72,153,0)_100%)]"></div>
                <div className="-ml-[100%] w-full flex-none blur-[1px] [background-image:linear-gradient(90deg,rgba(56,189,248,0)_0%,#0EA5E9_32.29%,rgba(236,72,153,0.3)_67.19%,rgba(236,72,153,0)_100%)]"></div>
              </div>
            </div> */}
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl dark:bg-white/10">
                  {renderIcons()}
                </div>
                <h3
                  id={product.id}
                  className="text-2xl font-bold tracking-tight text-black dark:text-white"
                >
                  {product.name}
                </h3>
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-400">
                {product.description}
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={frequency.value}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="text-4xl font-bold tracking-tight text-black dark:text-white"
                  >
                    {formatPrice(currentPrice)}
                  </motion.span>
                  <span className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-400">
                    {frequency.priceSuffix}
                  </span>
                </AnimatePresence>
              </p>

              <AnimatedLink
                to={`/checkout/${product.id}?frequency=${frequency.value}`}
                title="Get Started"
                text="Get Started"
                buttonPadding="px-6 py-3"
                buttonMargin="my-10"
                fontSize="text-lg"
                fontWeight="font-semibold"
                bgGradient=""
                glowOpacity={0.05}
                hoverScale={1.065}
                tapScale={0.9}
                glowColors=""
                glowBlur="blur-md"
                buttonBgColor="bg-blue-600"
                buttonTextColor="text-white"
                borderRadius="rounded-lg"
                width="w-full"
                display="flex"
                className="my-10 w-full"
              />
              <FeatureList features={product.marketing_features} />
            </div>
          </BlurFade>
        </MagicCard>
      </motion.div>
    </>
  );
};
