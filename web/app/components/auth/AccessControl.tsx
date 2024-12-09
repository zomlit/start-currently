import React, { Suspense } from "react";
import { useUser } from "@clerk/tanstack-start";
import { useLocation } from "@tanstack/react-router";
import { useTheme } from "@/hooks/useTheme";

const PUBLIC_ROUTES = [
  "/",
  "/lyrics",
  "/dashboard",
  "/teampicker",
  "/visualizer",
];

interface AccessControlProps {
  children: React.ReactNode;
}

function AccessControlContent({ children }: AccessControlProps) {
  const { user, isLoaded } = useUser();
  const { pathname } = useLocation();
  const { theme } = useTheme();

  if (!isLoaded) return null;

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAllowedUser = user;

  if (isPublicRoute || isAllowedUser) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <h1
        className={`mb-4 text-2xl font-bold ${theme === "dark" ? "text-purple-400" : "text-purple-700"}`}
      >
        Access Restricted
      </h1>
      <p
        className={`text-center ${theme === "dark" ? "text-gray-400" : "text-gray-700"}`}
      >
        This content is currently not available. Please contact the
        administrator for access.
      </p>
    </div>
  );
}

export function AccessControl({ children }: AccessControlProps) {
  return (
    <Suspense fallback={null}>
      <AccessControlContent>{children}</AccessControlContent>
    </Suspense>
  );
}
