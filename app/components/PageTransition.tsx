import React from "react";
import { AnimatePresence } from "framer-motion";
import {
  Outlet,
  useLocation,
  useMatches,
  useMatch,
} from "@tanstack/react-router";

export const createMainTransitionProps = (
  initialY: number = -20,
  exitY: number = 60
) =>
  ({
    initial: {
      y: initialY,
      opacity: 0,
      filter: "blur(8px)",
      position: "relative",
    },
    animate: {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      damping: 5,
    },
    exit: {
      y: exitY,
      opacity: 0,
      filter: "blur(8px)",
    },
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 10,
      filter: {
        type: "tween",
        duration: 0.2,
      },
    },
  }) as const;

const fadeTransition = {
  initial: {
    opacity: 0,
    filter: "blur(8px)",
  },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
  },
  exit: {
    opacity: 0,
    filter: "blur(8px)",
  },
  transition: {
    duration: 0.3,
    filter: {
      type: "tween",
      duration: 0.2,
    },
  },
};

export const mainTransitionProps = createMainTransitionProps();

export const postTransitionProps = {
  initial: {
    y: -20,
    opacity: 0,
    filter: "blur(8px)",
  },
  animate: {
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    damping: 5,
  },
  exit: {
    y: 60,
    opacity: 0,
    filter: "blur(8px)",
  },
  transition: {
    type: "spring",
    stiffness: 150,
    damping: 10,
    filter: {
      type: "tween",
      duration: 0.2,
    },
  },
} as const;

export const PageTransition: React.FC = () => {
  const location = useLocation();
  const matches = useMatches();
  const match = useMatch({ strict: false });
  const nextMatchIndex = matches.findIndex((d) => d.id === match.id) + 1;
  const nextMatch = matches[nextMatchIndex];

  return (
    <AnimatePresence mode="wait">
      <Outlet key={nextMatch?.id || location.pathname} />
    </AnimatePresence>
  );
};
