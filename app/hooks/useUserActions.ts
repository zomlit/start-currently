import { useState, useEffect } from "react";
import { useLocation } from "@tanstack/react-router";

type UserAction = {
  type: string;
  context: string;
  timestamp: number;
};

export function useUserActions() {
  const [currentAction, setCurrentAction] = useState<UserAction | null>(null);
  const [displayedText, setDisplayedText] = useState("");
  const location = useLocation();

  // Get context-aware description based on location and action
  const getActionContext = (actionType: string): string => {
    const path = location.pathname;
    const contextMap: Record<string, Record<string, string>> = {
      dashboard: {
        moving: "exploring dashboard",
        clicking: "interacting with widgets",
        typing: "updating settings",
        scrolling: "reviewing analytics",
        swiping: "navigating charts",
        pinching: "zooming data view",
        hovering: "examining metrics",
      },
      default: {
        moving: "exploring",
        clicking: "selecting",
        typing: "writing",
        scrolling: "browsing",
        swiping: "navigating",
        pinching: "zooming",
        hovering: "examining",
      },
    };

    const context = path.includes("dashboard")
      ? contextMap.dashboard
      : contextMap.default;
    return context[actionType] || actionType;
  };

  useEffect(() => {
    let debounceTimer: NodeJS.Timeout;
    let typewriterTimer: NodeJS.Timeout;

    const updateAction = (type: string) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const newAction = {
          type,
          context: getActionContext(type),
          timestamp: Date.now(),
        };
        setCurrentAction(newAction);

        // Typewriter effect
        let i = 0;
        const text = newAction.context;
        const typeWriter = () => {
          if (i < text.length) {
            setDisplayedText(text.substring(0, i + 1));
            i++;
            typewriterTimer = setTimeout(typeWriter, 50);
          }
        };
        setDisplayedText("");
        typeWriter();
      }, 100);
    };

    const handlers = {
      mousemove: () => updateAction("moving"),
      click: () => updateAction("clicking"),
      keypress: () => updateAction("typing"),
      scroll: () => updateAction("scrolling"),
      touchstart: () => updateAction("tapping"),
      touchmove: (e: TouchEvent) => {
        if (e.touches.length === 2) {
          updateAction("pinching");
        } else {
          updateAction("swiping");
        }
      },
      mouseover: () => updateAction("hovering"),
    };

    // Register all event listeners
    Object.entries(handlers).forEach(([event, handler]) => {
      window.addEventListener(event, handler as EventListener);
    });

    return () => {
      clearTimeout(debounceTimer);
      clearTimeout(typewriterTimer);
      Object.entries(handlers).forEach(([event, handler]) => {
        window.removeEventListener(event, handler as EventListener);
      });
    };
  }, [location.pathname]);

  return { currentAction, displayedText };
}
