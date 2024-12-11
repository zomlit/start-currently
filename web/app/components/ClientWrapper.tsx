import React from "react";
import { ThemeProvider } from "./ThemeProvider";
import BackgroundImage from "./ui/background-image";

interface ClientWrapperProps {
  children: React.ReactNode;
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  return (
    <div>
      <ThemeProvider defaultTheme="system">
        <BackgroundImage
          src="/images/hero-bg.webp"
          alt="Description of your image"
          opacity={0.4}
          zIndex={-10}
          className=""
        />
        {children}
      </ThemeProvider>
    </div>
  );
}
