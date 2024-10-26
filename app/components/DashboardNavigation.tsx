import React, { useState, useEffect } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { CircleDot } from "./icons";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { UserButton, useUser } from "@clerk/tanstack-start";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageCircle,
  Bell,
  BarChart2,
  Eye,
  Users,
} from "lucide-react";

const navItems = [
  {
    id: 1,
    link: "/sections/visualizer",
    text: "Visualizer",
    icon: Eye,
  },
  {
    id: 2,
    link: "/sections/chat",
    text: "Chat",
    icon: MessageCircle,
  },
  {
    id: 3,
    link: "/sections/alerts",
    text: "Alerts",
    icon: Bell,
  },
  {
    id: 4,
    link: "/sections/stats",
    text: "Stats",
    icon: BarChart2,
  },
  {
    id: 5,
    link: "/dashboard",
    text: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: 6,
    link: "/teampicker",
    text: "Team Picker",
    icon: Users,
  },
];

const DashboardNavigation: React.FC = () => {
  const { isLoaded } = useUser();
  const [sidebarToggled, setSidebarToggled] = useState(false);
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
    setSidebarToggled((prev) => !prev);
  };

  return (
    <div>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-[100dvh] w-full max-w-[18rem] flex-col justify-between overflow-visible px-4 shadow-2xl shadow-purple-500/20 !backdrop-blur-2xl transition-all duration-300 ease-in-out",
          sidebarToggled
            ? "md:w-[18rem]"
            : "-translate-x-full md:-translate-x-0 md:w-20"
        )}
      >
        <div>
          <div className="border-b border-b-gray-200 py-3 dark:border-b-zinc-800">
            <Link
              to="/sections"
              className="group flex items-center gap-x-3 text-lg font-semibold text-gray-800 transition-transform dark:text-gray-200"
            >
              <div className="spring-bounce-60 spring-duration-300 flex h-10 w-10 items-center justify-center rounded-md text-white transition-transform hover:rotate-[-42deg] md:min-w-[3rem]">
                <CircleDot
                  className={cn("w-8 fill-violet-500", {
                    "animate-spin": !isLoaded,
                  })}
                />
              </div>
            </Link>
          </div>
          <nav className="relative h-full">
            <ul className="relative z-10 text-gray-700 dark:text-gray-300">
              {navItems.map((navItem) => (
                <li
                  className="place-items-left grid w-full md:place-items-center"
                  key={navItem.id}
                >
                  <HoverCard openDelay={50} closeDelay={50}>
                    <HoverCardTrigger asChild>
                      <Link
                        to={navItem.link}
                        onClick={() => {
                          if (sidebarToggled) toggleSidebar();
                        }}
                        className={cn(
                          "relative z-10 flex items-center rounded-md p-3 lg:w-auto",
                          pathname === navItem.link ||
                            pathname.startsWith(navItem.link)
                            ? "text-gray-800 dark:text-white"
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-black/25"
                        )}
                      >
                        {navItem.icon && <navItem.icon className="h-4 w-4" />}
                        <span className="visible md:hidden transition-colors duration-300 ease-linear ml-3">
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

      {/* Mobile sidebar toggle button */}
      <div
        className={cn(
          "fixed left-0 z-50 flex p-[5px] transition-all duration-300 ease-in-out md:hidden",
          isScrolled ? "top-[10px]" : "top-[10px]"
        )}
        style={{
          transform: sidebarToggled ? "translateX(240px)" : "translateX(0)",
        }}
      >
        <button
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
