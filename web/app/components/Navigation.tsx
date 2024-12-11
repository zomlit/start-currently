import React from "react";
import { useLocation } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/tanstack-start";
import { ModeToggle } from "./ThemeToggle";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { CircleDot } from "./icons";
import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import { ColorPicker } from "./ThemeProvider";

interface NavigationProps {
  isDashboard?: boolean;
}

export function Navigation({ isDashboard }: NavigationProps) {
  const location = useLocation();
  const { isLoaded } = useUser();
  const isScrolled = useScrollPosition();

  return (
    <nav
      className={cn(
        "sticky left-0 right-0 top-0 z-40 transition-all duration-300 shadow-sm shadow-violet-900/20",

        isScrolled
          ? "bg-white/80 !backdrop-blur-2xl dark:bg-gray-900/20 shadow-violet-900/20"
          : "bg-transparent"
      )}
    >
      <div className="container max-w-full px-8 md:px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/"
              className="flex items-center text-xl font-semibold text-gray-900 dark:text-white"
            >
              <CircleDot
                className={cn(
                  "w-6 h-6 text-gray-900 dark:text-white fill-violet-500 mr-4 md:visible",
                  {
                    "animate-spin": !isLoaded,
                  }
                )}
              />
              <span className="md:ml-0 tracking-widest !text-black dark:!text-white uppercase sm:inline-block prose dark:font-extralight">
                Currently
              </span>
            </Link>
          </div>
          {location.pathname === "/" && (
            <div className="hidden md:flex items-center space-x-8">
              <NavLink to="/" exact>
                Home
              </NavLink>
              <NavLink to="/dashboard">Dashboard</NavLink>
            </div>
          )}
          <div className="flex items-center space-x-4">
            <ModeToggle />
            <div className="relative">
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300 cursor-pointer" />
              <div className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></div>
            </div>
            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-6 h-6",
                  },
                }}
              />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button
                  variant="outline"
                  className="text-sm font-medium bg-transparent hover:bg-gradient/10 border-0 backdrop-blur-none"
                >
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  to,
  children,
  exact = false,
}: {
  to: string;
  children: React.ReactNode;
  exact?: boolean;
}) {
  return (
    <Link
      to={to}
      activeProps={{
        className: "text-violet-600 dark:text-violet-400",
      }}
      inactiveProps={{
        className:
          "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white",
      }}
      activeOptions={{ exact }}
      className="text-sm font-medium transition duration-150 ease-in-out"
    >
      {children}
    </Link>
  );
}
