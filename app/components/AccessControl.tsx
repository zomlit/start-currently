import { useUser } from "@clerk/tanstack-start";
import { useLocation } from "@tanstack/react-router";
import { ReactNode } from "react";

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
      <h1 className="mb-4 text-2xl font-bold text-purple-400">
        Access Restricted
      </h1>
      <p className="text-center text-gray-400">
        This content is currently not available. Please contact the
        administrator for access.
      </p>
    </div>
  );
}
