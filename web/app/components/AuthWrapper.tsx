import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";

export const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <AuthProvider>{children}</AuthProvider>;
};
