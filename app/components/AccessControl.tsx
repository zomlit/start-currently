import { useUser } from "@clerk/tanstack-start";
import { useLocation } from "@tanstack/react-router";
import { ReactNode } from "react";
import { useTheme } from "@/hooks/useTheme";

const ALLOWED_USER_IDS = [
  "user_2bwpcJA5JgJJpGVdcCk8pA2PyxS",
  "user_2c6N06VTAXeFDPwYGJgxaFMiYex",
];

const PUBLIC_ROUTES = ["/", "/lyrics", "/dashboard", "/teampicker"];

interface AccessControlProps {
  children: ReactNode;
}

export function AccessControl({ children }: AccessControlProps) {
  const { user, isLoaded } = useUser();
  const { pathname } = useLocation();
  const { theme } = useTheme();

  if (!isLoaded) {
    return null; // Or a loading spinner
  }

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAllowedUser = user && ALLOWED_USER_IDS.includes(user.id);

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
