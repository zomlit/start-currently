import React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { CircleDot } from "./icons";
import {
  UserButton,
  useUser,
  useClerk,
  SignOutButton,
} from "@clerk/tanstack-start";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { navItems } from "@/config/navigation";
import { ChevronRight, Menu, MoreVertical } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState, Suspense, useCallback } from "react";
import { useIsClient } from "@/hooks/useIsClient";

const NAV_WIDTH_EXPANDED = 280;
const NAV_WIDTH_COLLAPSED = 72;

interface DashboardNavigationProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const isClient = useIsClient();
  return isClient ? <>{children}</> : null;
};

const DashboardNavigation: React.FC<DashboardNavigationProps> = ({
  isCollapsed,
  setIsCollapsed,
}) => {
  return (
    <>
      {/* Mobile Trigger */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed left-4 top-4 z-40"
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <nav className="flex flex-col h-full gap-4 p-2">
            <Suspense fallback={null}>
              <NavContent isCollapsed={false} />
            </Suspense>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop Navigation */}
      <motion.nav
        layout="position"
        animate={{
          width: isCollapsed ? NAV_WIDTH_COLLAPSED : NAV_WIDTH_EXPANDED,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 40,
          mass: 0.2,
          bounce: 0.1,
        }}
        className={cn(
          "hidden md:flex h-[calc(100vh-var(--nav-height))] flex-col gap-4 p-3 sticky top-[var(--nav-height)]",
          "bg-white/40 dark:bg-black/40 backdrop-blur-2xl",
          "shadow-2xl",
          "overflow-hidden",
          "will-change-[width,transform,opacity] transform-gpu"
        )}
      >
        <Suspense fallback={null}>
          <NavContent
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
        </Suspense>
      </motion.nav>
    </>
  );
};

// Separate component for nav content to avoid duplication
const NavContent = ({
  isCollapsed,
  setIsCollapsed,
}: {
  isCollapsed: boolean;
  setIsCollapsed?: (value: boolean) => void;
}) => {
  const { pathname } = useLocation();
  const [expandedSections, setExpandedSections] = React.useState<string[]>([]);
  const { openUserProfile } = useClerk();

  const menuItems = [
    {
      label: "Profile Settings",
      description: "Manage your account",
      onClick: () => openUserProfile(),
    },
    {
      label: "Add Account",
      description: "Connect additional accounts",
      onClick: () => openUserProfile(),
    },
    {
      label: "Security",
      description: "Password & 2FA settings",
      onClick: () => openUserProfile(),
    },
    {
      label: "Activity Log",
      description: "View recent account activity",
      onClick: () => openUserProfile(),
    },
    {
      label: "Preferences",
      description: "Customize your experience",
      onClick: () => openUserProfile(),
    },
  ] as const;

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections((current) =>
      current.includes(sectionId)
        ? current.filter((id) => id !== sectionId)
        : [...current, sectionId]
    );
  }, []);

  return (
    <>
      {/* Logo */}
      {/* <div className="flex h-12 items-center justify-between">
        {setIsCollapsed && (
          <motion.button
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        )}
      </div> */}

      {/* Navigation Items */}
      <div className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = item.submenu
            ? item.submenu.some(
                (subItem) =>
                  pathname === subItem.link || pathname.startsWith(subItem.link)
              )
            : pathname === item.link || pathname.startsWith(item.link || "");

          const isExpanded = expandedSections.includes(item.id);

          return (
            <div key={item.id}>
              {item.submenu ? (
                <div className="relative">
                  <motion.button
                    onClick={() => toggleSection(item.id)}
                    className={cn(
                      "flex w-full items-center justify-between min-h-[40px]",
                      "rounded-0 px-2 py-2",
                      "transition-colors duration-200",
                      "text-gray-700 dark:text-gray-300",
                      "hover:text-violet-600 dark:hover:text-violet-400",
                      isActive &&
                        "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400"
                    )}
                  >
                    <div className="flex items-center">
                      <div className="w-8 flex-shrink-0 flex items-center justify-center">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <AnimatePresence mode="wait" initial={false}>
                        {!isCollapsed && (
                          <motion.span
                            initial={{
                              opacity: 0,
                              width: 0,
                              filter: "blur(8px)",
                              x: -10,
                            }}
                            animate={{
                              opacity: 1,
                              width: "auto",
                              filter: "blur(0px)",
                              x: 0,
                              transition: {
                                width: { duration: 0.2, ease: "easeOut" },
                                opacity: { duration: 0.3, ease: "easeInOut" },
                                filter: { duration: 0.2, ease: "easeOut" },
                                x: {
                                  type: "spring",
                                  stiffness: 300,
                                  damping: 30,
                                },
                              },
                            }}
                            exit={{
                              opacity: 0,
                              width: 0,
                              filter: "blur(4px)",
                              x: -10,
                              transition: {
                                width: { duration: 0.3, ease: "easeInOut" },
                                opacity: { duration: 0.2 },
                                filter: { duration: 0.2 },
                                x: { duration: 0.2 },
                              },
                            }}
                            className="whitespace-nowrap overflow-hidden ml-3"
                          >
                            {item.text}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    {!isCollapsed && (
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          isExpanded && "rotate-90"
                        )}
                      />
                    )}
                  </motion.button>
                  <AnimatePresence initial={false} mode="wait">
                    {!isCollapsed && isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: "auto",
                          opacity: 1,
                          transition: {
                            height: {
                              type: "spring",
                              stiffness: 200,
                              damping: 30,
                              mass: 0.8,
                            },
                            opacity: { duration: 0.2, ease: "easeOut" },
                          },
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                          transition: {
                            height: {
                              type: "spring",
                              stiffness: 300,
                              damping: 40,
                              mass: 0.8,
                            },
                            opacity: {
                              duration: 0.2,
                              ease: "easeInOut",
                              delay: 0.1,
                            },
                          },
                        }}
                        className="overflow-hidden will-change-[height,opacity] transform-gpu"
                      >
                        <div className="pl-6 space-y-1 relative my-2">
                          <div className="absolute left-[18px] top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700/50" />
                          {item.submenu.map((subItem, index) => (
                            <motion.div
                              key={subItem.id}
                              initial={{
                                opacity: 0,
                                x: -10,
                                filter: "blur(8px)",
                              }}
                              animate={{
                                opacity: 1,
                                x: 0,
                                filter: "blur(0px)",
                                transition: {
                                  type: "spring",
                                  stiffness: 200,
                                  damping: 30,
                                  mass: 1.5,
                                  delay: index * 0.05,
                                },
                              }}
                              exit={{
                                opacity: 0,
                                x: -10,
                                filter: "blur(4px)",
                                transition: {
                                  duration: 0.2,
                                  delay: index * 0.03,
                                },
                              }}
                              className="relative"
                            >
                              <Link
                                to={subItem.link}
                                className={cn(
                                  "flex items-center",
                                  "rounded-none px-2 py-2",
                                  "transition-colors duration-200",
                                  "text-gray-600 dark:text-gray-400",
                                  "hover:text-violet-600 dark:hover:text-violet-400",
                                  pathname === subItem.link && [
                                    "bg-violet-50 dark:bg-violet-900/20",
                                    "text-violet-600 dark:text-violet-400",
                                    "font-medium",
                                  ]
                                )}
                              >
                                <div className="w-4 mr-3 flex items-center justify-center">
                                  <subItem.icon className="h-4 w-4" />
                                </div>
                                <span>{subItem.text}</span>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to={item.link || ""}
                  className={cn(
                    "flex items-center h-10",
                    "rounded-none px-2 py-2",
                    "transition-colors duration-200",
                    "hover:text-violet-600 dark:hover:text-violet-400",
                    isActive &&
                      "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400"
                  )}
                >
                  <div className="w-8 flex-shrink-0 flex items-center justify-center">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <AnimatePresence mode="wait" initial={false}>
                    {!isCollapsed && (
                      <motion.span
                        initial={{
                          opacity: 0,
                          width: 0,
                          filter: "blur(8px)",
                          x: -10,
                        }}
                        animate={{
                          opacity: 1,
                          width: "auto",
                          filter: "blur(0px)",
                          x: 0,
                          transition: {
                            width: { duration: 0.2, ease: "easeOut" },
                            opacity: { duration: 0.3, ease: "easeInOut" },
                            filter: { duration: 0.2, ease: "easeOut" },
                            x: { type: "spring", stiffness: 300, damping: 30 },
                          },
                        }}
                        exit={{
                          opacity: 0,
                          width: 0,
                          filter: "blur(4px)",
                          x: -10,
                          transition: {
                            width: { duration: 0.3, ease: "easeInOut" },
                            opacity: { duration: 0.2 },
                            filter: { duration: 0.2 },
                            x: { duration: 0.2 },
                          },
                        }}
                        className="whitespace-nowrap overflow-hidden ml-3"
                      >
                        {item.text}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* User Section */}
      <ClientOnly>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "w-full p-2 flex items-center",
                "transition-colors duration-200",
                "hover:bg-violet-50 dark:hover:bg-violet-900/20",
                "rounded-none",
                isCollapsed ? "justify-center" : "justify-between"
              )}
            >
              <div className="flex items-center gap-2">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8",
                      userButtonPopup: "hidden",
                    },
                  }}
                />
                <AnimatePresence mode="wait" initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex flex-col items-start"
                    >
                      <span className="text-sm font-medium">Account</span>
                      <span className="text-xs text-muted-foreground">
                        Manage settings
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {!isCollapsed && (
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="top"
            alignOffset={-8}
            sideOffset={4}
            className="w-56 p-1 ml-3 border-0 dark:bg-black/40 backdrop-blur-md !rounded-none md:ml-3"
          >
            {menuItems.map((item) => (
              <DropdownMenuItem
                key={item.label}
                onClick={item.onClick}
                className="flex items-center gap-2 py-2 focus:bg-violet-900/20 rounded-none"
              >
                <div className="flex flex-col flex-1 cursor-pointer">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}

            <div className="h-px bg-border my-1" />

            <DropdownMenuItem
              asChild
              className="w-full pt-1 dark:hover:bg-violet-900/20"
            >
              <div className="w-full">
                <SignOutButton>
                  <div className="cursor-pointer w-full flex items-center justify-center text-red-500 hover:text-red-600 font-medium">
                    Sign out
                  </div>
                </SignOutButton>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ClientOnly>
    </>
  );
};

// Add displayName for better debugging
NavContent.displayName = "NavContent";

export default DashboardNavigation;
