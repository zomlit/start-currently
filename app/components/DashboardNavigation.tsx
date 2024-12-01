import React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { CircleDot } from "./icons";
import { UserButton, useUser } from "@clerk/tanstack-start";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { navItems } from "@/config/navigation";
import { ChevronRight, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_WIDTH_EXPANDED = 280; // Default wider width
const NAV_WIDTH_COLLAPSED = 50;

const DashboardNavigation: React.FC = () => {
  const { isLoaded } = useUser();
  const { pathname } = useLocation();
  const [isCollapsed, setIsCollapsed] = React.useState(true);

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
            <NavContent isCollapsed={false} />
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop Navigation */}
      <nav
        className={cn(
          "hidden md:flex h-screen flex-col gap-4 p-2 border-r bg-background/50 backdrop-blur-sm",
          "spring-bounce-40 spring-duration-300 duration-300",
          isCollapsed
            ? `w-[${NAV_WIDTH_COLLAPSED}px]`
            : `w-[${NAV_WIDTH_EXPANDED}px]`
        )}
      >
        <NavContent isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </nav>
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
  const { isLoaded } = useUser();
  const { pathname } = useLocation();
  const [expandedSections, setExpandedSections] = React.useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((current) =>
      current.includes(sectionId)
        ? current.filter((id) => id !== sectionId)
        : [...current, sectionId]
    );
  };

  return (
    <>
      {/* Logo */}
      <div className="flex h-12 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <CircleDot
            className={cn("h-5 w-5 shrink-0 fill-violet-500", {
              "animate-spin": !isLoaded,
            })}
          />
          {!isCollapsed && <span className="font-semibold">Currently</span>}
        </Link>
        {setIsCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform",
                isCollapsed && "rotate-180"
              )}
            />
          </Button>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1">
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
                      "flex w-full items-center justify-between",
                      "rounded-md px-3 py-2",
                      "spring-bounce-40 spring-duration-300 duration-300",
                      "hover:bg-violet-500/5 hover:text-violet-400",
                      isActive && "bg-violet-500/10 text-violet-400"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="shrink-0"
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", bounce: 0.4 }}
                      >
                        <item.icon className="h-4 w-4" />
                      </motion.div>
                      <AnimatePresence mode="wait">
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex-1"
                            transition={{ type: "spring", bounce: 0.4 }}
                          >
                            {item.text}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    {!isCollapsed && (
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ type: "spring", bounce: 0.4 }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </motion.div>
                    )}
                  </motion.button>
                  <AnimatePresence initial={false}>
                    {!isCollapsed && isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", bounce: 0.4 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-1 pl-4 space-y-1">
                          {item.submenu.map((subItem, index) => (
                            <motion.div
                              key={subItem.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{
                                type: "spring",
                                bounce: 0.4,
                                delay: index * 0.05, // Stagger effect
                              }}
                            >
                              <Link
                                to={subItem.link}
                                className={cn(
                                  "flex items-center gap-3",
                                  "rounded-md px-3 py-2",
                                  "spring-bounce-40 spring-duration-300 duration-300",
                                  "hover:bg-violet-500/5 hover:text-violet-400",
                                  pathname === subItem.link &&
                                    "bg-violet-500/10 text-violet-400"
                                )}
                              >
                                <motion.div
                                  className="shrink-0"
                                  whileTap={{ scale: 0.9 }}
                                  transition={{ type: "spring", bounce: 0.4 }}
                                >
                                  <subItem.icon className="h-4 w-4" />
                                </motion.div>
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
                <motion.div
                  whileHover={{ x: 2 }}
                  transition={{ type: "spring", bounce: 0.4 }}
                >
                  <Link
                    to={item.link || ""}
                    className={cn(
                      "flex items-center gap-3",
                      "rounded-md px-3 py-2",
                      "spring-bounce-40 spring-duration-300 duration-300",
                      "hover:bg-violet-500/5 hover:text-violet-400",
                      isActive && "bg-violet-500/10 text-violet-400"
                    )}
                  >
                    <motion.div
                      className="shrink-0"
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", bounce: 0.4 }}
                    >
                      <item.icon className="h-4 w-4" />
                    </motion.div>
                    {!isCollapsed && <span>{item.text}</span>}
                  </Link>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* User Section */}
      <div className="flex items-center gap-2 px-2">
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
        />
        {!isCollapsed && <span className="text-sm">Account</span>}
      </div>
    </>
  );
};

export default DashboardNavigation;
