import { useAuth } from "@clerk/clerk-react";
import { redirect } from "@tanstack/react-router";

export const getAuthToken = async () => {
  const { getToken } = useAuth();
  return getToken({ template: "supabase" });
};

export const handleAuthError = (error: any) => {
  if (error?.status === 401) {
    redirect({
      to: "/sign-in",
      search: {
        from: window.location.pathname,
      },
    });
  }
  throw error;
};

export const getReturnTo = (search: { from?: string }) => {
  return search.from || "/";
};
