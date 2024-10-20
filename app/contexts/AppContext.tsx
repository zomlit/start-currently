// @/context/AppContext.tsx
"use client";
import React, { createContext, ReactNode, useContext, useEffect } from "react";
import { useCombinedStore } from "@/store";

interface AppContextType {
  getOAuthToken: (provider: string) => string | undefined;
  setOAuthTokens: (provider: string, tokens: any) => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { getOAuthToken, setOAuthTokens, isInitialized } = useCombinedStore();

  // You might want to add a useEffect here to initialize your store if needed
  useEffect(() => {
    // Initialize store logic if needed
  }, []);

  const value = {
    getOAuthToken,
    setOAuthTokens,
    isLoading: !isInitialized,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
