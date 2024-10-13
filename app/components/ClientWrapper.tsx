import React, { useEffect, useState } from "react";
import { ThemeProvider } from "./ThemeProvider";
import BackgroundImage from "./ui/background-image";

interface ClientWrapperProps {
  children: React.ReactNode;
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Remove this console.log
  // console.log("ClientWrapper mounted");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="app-theme">
      <BackgroundImage
        src="/images/hero-bg.webp"
        alt="Description of your image"
        opacity={0.4}
        zIndex={-10}
        className=""
      />
      {children}
    </ThemeProvider>
  );
}
