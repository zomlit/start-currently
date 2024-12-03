import React from "react";
import { cn } from "@/lib/utils";
import { Check, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface IconBadgeProps {
  count?: number;
  status?: "success" | "error" | "warning";
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  size?: "sm" | "md";
  showStatusIcon?: boolean;
  className?: string;
}

export function IconBadge({
  count,
  status,
  position = "top-right",
  size = "sm",
  showStatusIcon = false,
  className,
}: IconBadgeProps) {
  const positions = {
    "top-right": "-right-1 -top-1",
    "top-left": "-left-1 -top-1",
    "bottom-right": "-right-1 -bottom-1",
    "bottom-left": "-left-1 -bottom-1",
  };

  const sizes = {
    sm: "h-3.5 w-3.5 text-[10px]",
    md: "h-5 w-5 text-xs",
  };

  const statusColors = {
    success: "bg-emerald-500 text-emerald-50",
    error: "bg-red-500 text-red-50",
    warning: "bg-yellow-500 text-yellow-50",
  };

  const StatusIcon = {
    success: <Check className="p-0.5 h-2 w-2 shadow-sm " />,
    error: <X className="p-0.5 h-2 w-2 shadow-sm" />,
    warning: <AlertTriangle className="p-0.5 h-2 w-2 shadow-sm" />,
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className={cn(
          "absolute flex items-center justify-center rounded-full p-1",
          "spring-bounce-80 spring-duration-300 duration-300",
          positions[position],
          sizes[size],
          status && statusColors[status],
          !status && "bg-red-500 text-red-50",
          className
        )}
      >
        {showStatusIcon && status && (
          <motion.div initial={{ rotate: -45 }} animate={{ rotate: 0 }}>
            {StatusIcon[status]}
          </motion.div>
        )}
        {!showStatusIcon && count !== undefined && count > 0 && (
          <span className="text-center font-medium">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
