import React from "react";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";
import { mainTransitionProps } from "../PageTransition";

interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "5xl" | "7xl" | "full";
  padded?: boolean;
  paddingTop?: "sm" | "md" | "lg" | "xl";
  sidebarOffset?: boolean;
  isDashboard?: boolean;
  className?: string;
}

const Container: React.FC<ContainerProps> = ({
  children,
  maxWidth = "",
  padded = true,
  paddingTop = "md",
  sidebarOffset = false,
  isDashboard = false,
  className,
}) => {
  const containerClasses = cn(
    "container",
    {
      "max-w-sm": maxWidth === "sm",
      "max-w-md": maxWidth === "md",
      "max-w-lg": maxWidth === "lg",
      "max-w-xl": maxWidth === "xl",
      "max-w-2xl": maxWidth === "2xl",
      "max-w-5xl": maxWidth === "5xl",
      "max-w-7xl": maxWidth === "7xl",
      "max-w-full": maxWidth === "full",
      "px-4": padded, // Add horizontal padding when padded is true
      "md:pl-28": sidebarOffset || isDashboard,
    },
    className
  );

  return (
    <div className={containerClasses}>
      <motion.div {...mainTransitionProps}>{children}</motion.div>
    </div>
  );
};

export default Container;
