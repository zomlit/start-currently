import React, { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "@/config/navigation";

export function HorizontalNav() {
  const { pathname } = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  return (
    <div className="mb-2">
      <nav className="hidden md:block">
        <div className="rounded-lg bg-white/10 dark:p-2">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2 shadow-inner pt-2 dark:pt-0">
              {navItems.map((item) => {
                const isActive = item.submenu
                  ? item.submenu.some(
                      (subItem) =>
                        pathname === subItem.link ||
                        pathname.startsWith(subItem.link || "")
                    )
                  : pathname === item.link ||
                    pathname.startsWith(item.link || "");
                const Icon = item.icon;

                return item.submenu ? (
                  <div key={item.id} className="relative">
                    <button
                      onClick={() =>
                        setOpenSubmenu(openSubmenu === item.id ? null : item.id)
                      }
                      className={cn(
                        "flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-violet-500/10 text-violet-600 dark:text-violet-300"
                          : "hover:bg-violet-500/10 hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.text}</span>
                      <ChevronRight
                        className={cn(
                          "ml-2 h-4 w-4 transition-transform duration-200",
                          openSubmenu === item.id && "rotate-90"
                        )}
                      />
                    </button>
                  </div>
                ) : (
                  <Link
                    key={item.id}
                    to={item.link || ""}
                    className={cn(
                      "flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-violet-500/10 text-violet-600 dark:text-violet-200 border-l-4 border-violet-500"
                        : "hover:bg-violet-500/10 hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.text}</span>
                  </Link>
                );
              })}
            </div>
            <AnimatePresence>
              {openSubmenu === "widgets" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden mt-2 border-t border-white/10 after:absolute after:bg-black/20 after:content-[''] after:h-[1px] after:w-full after:bottom-[1px]"
                >
                  <div className="scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent overflow-x-auto mt-2">
                    <div className="flex space-x-2 px-1">
                      {navItems
                        .find((item) => item.id === "widgets")
                        ?.submenu?.map((subItem) => {
                          const isSubActive =
                            pathname === subItem.link ||
                            pathname.startsWith(subItem.link);

                          return (
                            <Link
                              key={subItem.id}
                              to={subItem.link}
                              className={cn(
                                "flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                                "hover:bg-violet-500/10 hover:text-accent-foreground",
                                isSubActive &&
                                  "bg-violet-500/10 text-violet-600 dark:text-violet-300"
                              )}
                            >
                              <subItem.icon className="h-4 w-4" />
                              <span>{subItem.text}</span>
                            </Link>
                          );
                        })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>
    </div>
  );
}
