"use client";
import React, { useState, useEffect } from "react";
import { Link, useLocation, useRouteContext } from "@tanstack/react-router";
import { LstLogo, CircleDot } from "./icons";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../components/ui/hover-card";
import { UserButton, useUser } from "@clerk/tanstack-start";
import { cn } from "../lib/utils";

const navItems = [
  {
    id: 1,
    // icon: <IconChartColumn className="w-34 h-4" />,
    link: "/dashboard/widgets/visualizer/",
    text: "Visualizer",
    isActive: false,
  },
  {
    id: 2,
    // icon: <IconMessageCircle2 className="h-4 w-4" />,
    link: "/dashboard/widgets/chat/",
    text: "Chat",
    isActive: false,
  },
  {
    id: 3,
    // icon: <IconBellRinging className="h-4 w-4" />,
    link: "/dashboard/widgets/alerts/",
    text: "Alerts",
    isActive: false,
  },
  // {
  //   id: 4,
  //   icon: <GameStats className="h-4 w-4 fill-white stroke-white text-white" />,
  //   link: '/dashboard/widgets/game-stats/',
  //   text: 'Game Stats',
  //   isActive: false,
  // },

  {
    id: 6,
    // icon: <IconDeviceGamepad2 className="h-4 w-4" />,
    link: "/dashboard/widgets/gamepad/",
    text: "Gamepad",
    isActive: false,
  },
  {
    id: 7,
    // icon: <IconClock className="h-4 w-4" />,
    link: "/dashboard/widgets/timer/",
    text: "Timer",
    isActive: false,
  },
];

interface SidebarToggleProps {
  toggleSidebar: () => void;
  sidebarToggled: boolean;
}

const DashboardNavigation: React.FC = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [sidebarResized, setSidebarResized] = useState(true);
  const [sidebarToggled, setSidebarToggled] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleSidebar = () => {
    setSidebarToggled((sidebarToggled) => !sidebarToggled);
  };

  useEffect(() => {
    const activeItem = navItems.findIndex(
      (navItem) => navItem.link === pathname
    );
    setActiveIndex(activeItem !== -1 ? activeItem : 0);

    if (sidebarToggled) {
      setSidebarToggled(false);
    }
  }, [pathname]);

  const updatedNavItems = navItems.map((navItem) => ({
    ...navItem,
    isActive: navItem.link === pathname,
  }));

  return (
    <div>
      <aside
        className={`fixed left-0 top-0 z-40 flex h-[100dvh] w-full max-w-[18rem] flex-col justify-between overflow-visible px-4 shadow-2xl shadow-purple-500/20 !backdrop-blur-2xl transition-all dark:bg-black/10 md:transition-[width] ${
          sidebarToggled ? "" : "-translate-x-full md:-translate-x-0"
        } ${sidebarResized ? "md:w-20" : ""}`}
      >
        <div>
          <div className="border-b border-b-gray-200 py-3 dark:border-b-zinc-800">
            <Link
              href="/dashboard/"
              data-logo-box
              className="group flex items-center gap-x-3 text-lg font-semibold text-gray-800 transition-transform dark:text-gray-200"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md text-white transition-transform spring-bounce-70 spring-duration-500 hover:rotate-[-42deg] md:min-w-[3rem]">
                <CircleDot
                  className={cn("w-8 fill-violet-500", {
                    "animate-spin": !isLoaded,
                  })}
                />
                <div className="z-5 lock h-full" />
              </div>
            </Link>
          </div>
          <nav className="relative h-full">
            <div
              className={`absolute left-0 mt-1 h-11 w-full rounded-md transition-transform duration-300 ${
                pathname === "/dashboard" ? "hidden" : ""
              }`}
              style={{ transform: `translateY(${activeIndex * 48}px)` }}
            ></div>
            <ul className="relative z-10 text-gray-700 dark:text-gray-300">
              {updatedNavItems.map((navItem, index) => (
                <li
                  className="place-items-left grid w-full md:place-items-center"
                  key={navItem.id}
                >
                  <HoverCard openDelay={50} closeDelay={50}>
                    <HoverCardTrigger asChild>
                      <Link
                        href={navItem.link}
                        onClick={() => {
                          if (sidebarToggled) toggleSidebar();
                        }}
                        className={`relative z-10 flex rounded-md p-3 lg:w-auto ${
                          navItem.isActive
                            ? "text-gray-800 dark:text-white"
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-black/25"
                        } `}
                      >
                        <div className="">{navItem.icon}</div>
                        <span
                          className={`ml-2 inline-flex transition-colors duration-300 ease-linear ${
                            sidebarResized ? "md:hidden" : ""
                          } `}
                        >
                          {navItem.text}
                        </span>
                      </Link>
                    </HoverCardTrigger>

                    <HoverCardContent
                      sticky="always"
                      className="invisible max-w-max border-0 lg:visible"
                      side="left"
                      sideOffset={0}
                    >
                      {navItem.text}
                    </HoverCardContent>
                  </HoverCard>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        {/* UserButton placed at the bottom */}
        <div
          className={`z-50 mb-4 transition-all duration-300 ${sidebarResized ? "md:flex md:justify-center" : ""}`}
        >
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

      <div>
        <div
          className={`fixed right-2 z-50 flex p-[5px] transition-all duration-300 ease-in-out md:hidden ${isScrolled ? "top-3" : "top-9"} `}
        >
          <button
            onClick={toggleSidebar}
            className="relative flex aspect-square w-8 flex-col items-center justify-center rounded-full p-1 outline-none"
          >
            <span className="sr-only">toggle sidebar</span>
            <span
              className={`h-0.5 w-5 rounded-full bg-gray-300 transition-transform duration-100 ease-linear ${sidebarToggled ? "translate-y-1.5 rotate-[40deg]" : ""} `}
            />
            <span
              className={`mt-1 h-0.5 w-5 origin-center rounded-full bg-gray-300 transition-all duration-100 ease-linear ${sidebarToggled ? "scale-x-0 opacity-0" : ""} `}
            />
            <span
              className={`mt-1 h-0.5 w-5 rounded-full bg-gray-300 transition-all duration-100 ease-linear ${sidebarToggled ? "-translate-y-1.5 -rotate-[40deg]" : ""} `}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardNavigation;
