import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { Link, LinkProps } from "@tanstack/react-router";

interface AnimatedLinkProps extends Omit<LinkProps, "to"> {
  to: string;
  title?: string;
  text?: string;
  className?: string;
  buttonPadding?: string;
  buttonMargin?: string;
  fontSize?: string;
  fontWeight?: string;
  bgGradient?: string;
  hoverScale?: number;
  tapScale?: number;
  springStiffness?: number;
  springDamping?: number;
  glowOpacity?: number;
  glowBlur?: string;
  glowSpread?: string;
  glowColors?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  borderRadius?: string;
  width?: string;
  display?: string;
  focusRingColor?: string;
  focusRingWidth?: string;
  focusRingOffsetWidth?: string;
  focusVisibleRingColor?: string;
  focusVisibleRingWidth?: string;
  focusVisibleRingOffsetWidth?: string;
  focusBoxShadow?: string;
  focusVisibleBoxShadow?: string;
  children?: React.ReactNode;
}

export const AnimatedLink = forwardRef<HTMLAnchorElement, AnimatedLinkProps>(
  (
    {
      to,
      title,
      text,
      className = "",
      buttonPadding = "px-4 py-4 md:px-8",
      buttonMargin = "",
      fontSize = "text-lg",
      fontWeight = "font-bold",
      bgGradient = "",
      hoverScale = 1.05,
      tapScale = 0.95,
      springStiffness = 400,
      springDamping = 17,
      glowOpacity = 0.4,
      glowBlur = "blur-lg",
      glowSpread = "-inset-px",
      glowColors = "bg-gradient-to-r from-blue-500 to-purple-500",
      buttonBgColor = "bg-gray-900",
      buttonTextColor = "text-white",
      borderRadius = "rounded-xl",
      width = "w-full",
      display = "flex",
      focusRingColor = "ring-blue-500",
      focusRingWidth = "ring-2",
      focusRingOffsetWidth = "ring-offset-2",
      focusVisibleRingColor = "ring-blue-600",
      focusVisibleRingWidth = "ring-2",
      focusVisibleRingOffsetWidth = "ring-offset-2",
      focusBoxShadow = "shadow-outline",
      focusVisibleBoxShadow = "shadow-outline-blue",
      children,
      ...rest
    },
    ref
  ) => {
    const focusClasses = `focus:${focusRingColor} focus:${focusRingWidth} focus:${focusRingOffsetWidth} focus:${focusBoxShadow}`;
    const focusVisibleClasses = `focus-visible:${focusVisibleRingColor} focus-visible:${focusVisibleRingWidth} focus-visible:${focusVisibleRingOffsetWidth} focus-visible:${focusVisibleBoxShadow}`;

    return (
      <motion.div
        whileHover={{ scale: hoverScale }}
        whileTap={{ scale: tapScale }}
        transition={{
          type: "spring",
          stiffness: springStiffness,
          damping: springDamping,
        }}
      >
        <div className={`group relative ${display} ${buttonMargin}`}>
          <div
            className={`animate-tilt absolute transition-all ${glowSpread} ${borderRadius} ${glowColors} opacity-${glowOpacity * 100} ${glowBlur} duration-1000 group-hover:-inset-1 group-hover:opacity-100 group-hover:duration-200`}
          ></div>
          <Link
            to={to}
            ref={ref}
            title={title}
            className={`relative inline-flex items-center justify-center ${width} ${bgGradient} ${borderRadius} ${buttonBgColor} ${buttonPadding} ${fontSize} ${fontWeight} ${buttonTextColor} transition-all duration-200 ${focusClasses} ${focusVisibleClasses} outline-none ${className}`}
            {...rest}
          >
            {children || text}
          </Link>
        </div>
      </motion.div>
    );
  }
);

AnimatedLink.displayName = "AnimatedLink";
