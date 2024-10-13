// components/SupportCard.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MagicCard } from "./ui/magic-card";
import BlurFade from "./ui/blur-fade";
import { AnimatedLink } from "./ui/animated-link";
import { CircleCheckBig } from "lucide-react";
import { SmartDollarInput } from "./stripe/SmartDollarInput";
import { ProductWithPrices } from "../types/checkout";

type SupportCardProps = {
  product: ProductWithPrices;
  theme: string;
  index: number;
};

export const SupportCard: React.FC<SupportCardProps> = ({
  product,
  theme,
  index,
}) => {
  const [amount, setAmount] = useState("");

  const handleAmountChange = (value: number) => {
    setAmount(value);
  };

  return (
    <motion.div
      className="relative"
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <MagicCard
        className="!bg-transparent"
        gradientColor={theme === "dark" ? "" : ""}
      >
        <BlurFade
          className="border-0"
          yOffset={-1}
          delay={0.5 + index * 0.25}
          inView
        >
          <div className="relative rounded-lg bg-white dark:bg-white/10">
            <div className="grid p-8 md:grid-cols-2">
              <div className="pr-8">
                <h3 className="mb-4 text-4xl font-bold tracking-tight">
                  Show Your Support
                </h3>
                <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">
                  To help support the development of livestreaming.tools,
                  consider making a contribution of your choice. By showing your
                  support, you not only help us improve and expand our platform
                  but also enjoy the perks of the Creator Kickstart tier.
                </p>
                <h4 className="my-4 text-lg font-bold tracking-tight text-black dark:text-white">
                  What You Get:
                </h4>
                <ul>
                  <li className="flex gap-x-3">
                    <CircleCheckBig
                      className="h-6 w-5 flex-none text-emerald-500"
                      aria-hidden="true"
                    />
                    All the benefits of the Creator Kickstart plan
                  </li>
                  <li className="flex gap-x-3">
                    <CircleCheckBig
                      className="h-6 w-5 flex-none text-emerald-500"
                      aria-hidden="true"
                    />
                    Special recognition and account credits as a token of our
                    appreciation.
                  </li>
                  <li></li>
                  <li></li>
                </ul>
              </div>

              <div className="before:h:full relative before:absolute before:left-0 before:h-full before:w-[1px] md:border-l-[1px] md:border-black/60 md:pl-8 md:before:bg-white/10">
                {/* <h3 className="text-2xl font-bold tracking-tight text-black dark:text-white">
                  {product.name}
                </h3> */}
                {/* <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  {product.description}
                </p> */}
                <div className="mt-6">
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Enter amount (USD)
                  </label>
                  <div className="mt-2">
                    <SmartDollarInput
                      initialValue={5}
                      onChange={handleAmountChange}
                      min={0}
                      max={5000}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
                <AnimatedLink
                  href={`/checkout/${product.id}?amount=${amount}`}
                  title="Support Now"
                  text="Support Now"
                  buttonPadding="px-6 py-3"
                  buttonMargin="my-4"
                  fontSize="text-lg"
                  fontWeight="font-semibold"
                  bgGradient=""
                  glowOpacity={0.05}
                  hoverScale={1.03}
                  tapScale={0.9}
                  glowColors=""
                  glowBlur="blur-md"
                  buttonBgColor="bg-blue-600"
                  buttonTextColor="text-white"
                  borderRadius="rounded-lg"
                  width="w-full"
                  display="flex"
                />
                <p className="text-center text-xs font-light dark:text-gray-300">
                  Your support helps us continue to innovate and provide the
                  best tools for creators like you. Every contribution, no
                  matter the size, makes a difference. Thanks for helping us
                  build a better platform for all creators!
                </p>
              </div>
            </div>
          </div>
        </BlurFade>
      </MagicCard>
    </motion.div>
  );
};
