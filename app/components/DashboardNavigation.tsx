import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { CircleDot } from "./icons";
import { UserButton, useUser } from "@clerk/tanstack-start";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { navItems } from "@/config/navigation";
import { ChevronRight } from "lucide-react";

const DashboardNavigation: React.FC = () => {
  const { isLoaded } = useUser();
  const [sidebarToggled, setSidebarToggled] = useState(false);
  const { pathname } = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmenuClick = (itemId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setOpenSubmenu(openSubmenu === itemId ? null : itemId);
    
    if (isMobile) {
      setIsExpanded(true);
    }
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsExpanded(false);
      setOpenSubmenu(null);
    }
  };

  const handleToggleSidebar = () => {
    setSidebarToggled(!sidebarToggled);
    if (!sidebarToggled) {
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
      setOpenSubmenu(null);
    }
  };

  return (
    <div>
      <aside
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "fixed left-0 top-0 z-40 flex h-[100dvh] flex-col gap-4 pb-10 pt-4 shadow-2xl shadow-purple-500/20 !backdrop-blur-2xl",
          "w-14 transition-all duration-300 ease-in-out",
          isExpanded && "w-64 px-2",
          sidebarToggled
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex h-[60px] items-center justify-center">
          <Link
            to="/"
            className={cn(
              "flex items-center",
              isExpanded ? "gap-2" : "justify-center"
            )}
          >
            <CircleDot
              className={cn("h-6 w-6 fill-violet-500", {
                "animate-spin": !isLoaded,
              })}
            />
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-lg font-semibold overflow-hidden whitespace-nowrap"
                >
                  Currently
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        <div className="flex-1">
          <nav className="grid gap-1 px-2">
            {navItems.map((item) => {
              const isActive = item.submenu
                ? item.submenu.some(
                    (subItem) =>
                      pathname === subItem.link ||
                      pathname.startsWith(subItem.link || "")
                  )
                : pathname === item.link || pathname.startsWith(item.link || "");

              return (
                <div key={item.id} className="transition-all duration-300 ease-in-out">
                  {item.submenu ? (
                    <div>
                      <button
                        onClick={(e) => handleSubmenuClick(item.id, e)}
                        className={cn(
                          "group/nav flex h-10 w-full items-center justify-between rounded-md px-3 text-sm font-medium",
                          "transition-[background-color,color,width,transform] duration-300 ease-in-out",
                          isActive && "bg-violet-500/10 text-violet-500"
                        )}
                      >
                        <div className="flex items-center min-w-[24px] transition-all duration-300 ease-in-out">
                          <item.icon className="h-4 w-4 shrink-0" />
                          <AnimatePresence mode="wait">
                            {isExpanded && (
                              <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                className="ml-2 overflow-hidden whitespace-nowrap"
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                              >
                                {item.text}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                            >
                              <ChevronRight
                                className={cn(
                                  "h-4 w-4 transition-transform duration-200",
                                  openSubmenu === item.id && "rotate-90"
                                )}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>
                      <AnimatePresence>
                        {(openSubmenu === item.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="ml-4 mt-1 space-y-1">
                              {item.submenu.map((subItem) => {
                                const isSubActive =
                                  pathname === subItem.link ||
                                  pathname.startsWith(subItem.link);

                                return (
                                  <Link
                                    key={subItem.id}
                                    to={subItem.link}
                                    onClick={() => {
                                      if (isMobile) {
                                        setSidebarToggled(false);
                                        setOpenSubmenu(null);
                                      }
                                    }}
                                    className={cn(
                                      "flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                                      "hover:bg-violet-500/10 hover:text-accent-foreground",
                                      isSubActive && "bg-violet-500/10 text-violet-500"
                                    )}
                                  >
                                    <subItem.icon className="mr-2 h-4 w-4" />
                                    <span>{subItem.text}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      to={item.link || ""}
                      className={cn(
                        "group/nav flex h-10 items-center rounded-md px-3 text-sm font-medium",
                        isExpanded ? "w-full" : "w-10",
                        "transition-[background-color,color,width,transform] duration-300 ease-in-out",
                        isActive && "bg-violet-500/10 text-violet-500 border-l-4 border-violet-500"
                      )}
                    >
                      <div className="flex items-center min-w-[24px] transition-all duration-300 ease-in-out">
                        <item.icon className="h-4 w-4 shrink-0" />
                        <AnimatePresence mode="wait">
                          {isExpanded && (
                            <motion.span
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: "auto" }}
                              exit={{ opacity: 0, width: 0 }}
                              className="ml-2 overflow-hidden whitespace-nowrap"
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                              {item.text}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto flex justify-center">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-6 h-6",
              },
            }}
          />
        </div>
      </aside>

      <button
        onClick={handleToggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-background/80 rounded-md"
      >
        <span className="sr-only">Toggle Menu</span>
        {/* Add your menu icon here */}
      </button>
    </div>
  );
};

export default DashboardNavigation;
