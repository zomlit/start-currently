// components/SkeletonCard.tsx
import React from "react";
import { Skeleton } from "./ui/skeleton";
import { motion } from "framer-motion";

export const SkeletonCard: React.FC = () => {
  return (
    <motion.div layout>
      <Skeleton className="absolute left-0 z-0 flex h-full w-full flex-col space-y-4 rounded-lg border-0 border-white/5 px-9 py-8">
        <Skeleton className="w-2/3 p-6" />

        {/* Product description */}
        <div className="space-y-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/6" />
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-x-1">
          <Skeleton className="mt-2 h-10 w-[94px]" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Button */}
        <Skeleton className="!mt-10 h-[62px] w-full space-y-2 rounded-md p-2" />

        {/* Features */}
        <ul className="!mt-8 space-y-1">
          <li className="flex items-center gap-x-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-3/4" />
          </li>
          <li className="flex items-center gap-x-3">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-2/3" />
          </li>
        </ul>
      </Skeleton>
    </motion.div>
  );
};
