"use client";
import React from "react";
import NavbarTab from "./navbar-tab";
import { IconServer, IconPower, IconList } from "@tabler/icons-react";
import { useWebSocketStatus } from "../providers/websocket-status-provider";
import { usePathname } from "next/navigation";

type Props = {};

const NavbarTabs = (props: Props) => {
  const path = usePathname();
  const status = useWebSocketStatus();
  const tabs = [
    {
      title: "Status",
      icon: IconServer,
      link: "/status",
      classes: `${
        status?.on && status?.reconnecting
          ? "text-yellow-400"
          : status?.connected
          ? "text-green-400"
          : status?.waitingToReconnect
          ? "text-yellow-400"
          : "text-red-400"
      }`,
    },
    {
      title: "Logs",
      icon: IconList, // You'll need to import this icon
      link: "/logs",
    },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-zinc-800 items-start gap-4 text-sm text-gray-300 p-2 relative">
      {tabs.map((tab) => (
        <NavbarTab key={tab.title} {...tab} selected={tab.link === path} />
      ))}
      <button
        onClick={() => status?.toggleConnection()}
        className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 p-2 rounded-full ${
          status?.connected
            ? "bg-red-500 hover:bg-red-600"
            : "bg-green-500 hover:bg-green-600"
        } transition-colors duration-200`}
        title={status?.connected ? "Disconnect" : "Connect"}
      >
        <IconPower size={24} color="white" />
      </button>
    </div>
  );
};

export default NavbarTabs;
