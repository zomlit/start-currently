import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { CircleDot } from "./icons";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { UserButton, useUser } from "@clerk/tanstack-start";
import { cn } from "@/lib/utils";
import MicrophoneIcon from "@icons/outline/microphone-2.svg?react";
import { motion } from "framer-motion";

import { navItems } from "@/config/navigation";

const DashboardNavigation: React.FC = () => {
  const { isLoaded } = useUser();
  const [sidebarToggled, setSidebarToggled] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { pathname } = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(event.target as Node)
      ) {
        setSidebarToggled(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarToggled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarToggled((prev) => !prev);
  };

  const activeIndex = Math.max(
    0,
    navItems.findIndex(
      (item) => pathname === item.link || pathname.startsWith(item.link)
    )
  );

  return (
    <div>
      <aside
        ref={sidebarRef}
        className={cn(
          "fixed left-0 top-0 z-40 flex h-[100dvh] flex-col justify-between overflow-visible px-4 shadow-2xl shadow-purple-500/20 !backdrop-blur-2xl",
          "w-[18rem] transition-all duration-300 ease-in-out",
          sidebarToggled
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0",
          "md:w-20"
        )}
      >
        <div>
          <div className="border-b border-b-gray-200 py-3 dark:border-b-zinc-800">
            <Link
              to="/"
              className="group flex items-center justify-center gap-x-3 text-lg font-semibold text-gray-800 transition-transform dark:text-gray-200"
            >
              <div className="spring-bounce-60 spring-duration-300 flex h-10 w-10 items-center justify-center rounded-md text-white transition-transform hover:rotate-[-42deg]">
                <CircleDot
                  className={cn("w-8 fill-violet-500", {
                    "animate-spin": !isLoaded,
                  })}
                />
              </div>
            </Link>
          </div>
          <nav className="relative h-full">
            <ul className="relative z-10 mt-2 space-y-1 text-gray-700 dark:text-gray-300">
              <motion.div
                className="absolute left-0 h-8 w-1 rounded-r-full bg-violet-500"
                initial={false}
                animate={{
                  top: `${activeIndex * 40 + 4}px`,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
              />
              {navItems.map((navItem) => (
                <li key={navItem.id} className="grid w-full place-items-center">
                  <HoverCard openDelay={50} closeDelay={50}>
                    <HoverCardTrigger asChild>
                      <Link
                        to={navItem.link}
                        onClick={() => {
                          if (sidebarToggled) toggleSidebar();
                        }}
                        className={cn(
                          "relative z-10 flex w-full items-center justify-start rounded-md p-2",
                          "md:justify-center",
                          "group transition-colors duration-200",
                          pathname === navItem.link ||
                            pathname.startsWith(navItem.link)
                            ? "bg-violet-500/10 text-violet-500"
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-black/25"
                        )}
                      >
                        {navItem.icon && (
                          <navItem.icon
                            className={cn(
                              "h-5 w-5",
                              pathname === navItem.link ||
                                pathname.startsWith(navItem.link)
                                ? "text-violet-500"
                                : "text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300"
                            )}
                          />
                        )}
                        <span className="visible ml-3 text-sm transition-colors duration-300 ease-linear md:hidden">
                          {navItem.text}
                        </span>
                      </Link>
                    </HoverCardTrigger>
                    <HoverCardContent
                      sticky="always"
                      className="invisible max-w-max border-0 lg:visible"
                      side="right"
                      sideOffset={10}
                    >
                      {navItem.text}
                    </HoverCardContent>
                  </HoverCard>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="z-50 mb-4 transition-all duration-300 md:flex md:justify-center">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-10 h-10",
              },
            }}
          />
        </div>
      </aside>

      {/* Mobile sidebar toggle button with delayed visibility */}
      <div
        className={cn(
          "fixed left-0 z-50 flex p-[5px] transition-all duration-300 ease-in-out md:hidden",
          "opacity-0 transition-opacity duration-300",
          isScrolled ? "top-[10px]" : "top-[10px]",
          !sidebarToggled && "delay-300 opacity-100"
        )}
        style={{
          transform: sidebarToggled ? "translateX(240px)" : "translateX(0)",
        }}
      >
        <button
          ref={toggleButtonRef}
          onClick={toggleSidebar}
          className="relative flex aspect-square w-8 flex-col items-center justify-center rounded-full p-1 outline-none"
        >
          <span className="sr-only">toggle sidebar</span>
          <span
            className={cn(
              "h-0.5 w-4 rounded-full bg-gray-300 transition-transform duration-100 ease-linear",
              sidebarToggled ? "translate-y-1.5 rotate-[40deg]" : ""
            )}
          />
          <span
            className={cn(
              "mt-1 h-0.5 w-4 origin-center rounded-full bg-gray-300 transition-all duration-100 ease-linear",
              sidebarToggled ? "scale-x-0 opacity-0" : ""
            )}
          />
          <span
            className={cn(
              "mt-1 h-0.5 w-4 rounded-full bg-gray-300 transition-all duration-100 ease-linear",
              sidebarToggled ? "-translate-y-1.5 -rotate-[40deg]" : ""
            )}
          />
        </button>
      </div>
    </div>
  );
};

export default DashboardNavigation;
