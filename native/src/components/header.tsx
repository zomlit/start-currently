"use client";
import React, { memo } from "react";
import { usePathname } from "next/navigation";

function formatPath(path: string): string {
  let formattedPath = path.startsWith("/") ? path.slice(1) : path;

  if (formattedPath.length > 0) {
    formattedPath =
      formattedPath.charAt(0).toUpperCase() + formattedPath.slice(1);
  }

  return formattedPath;
}

const Header = memo(
  ({
    title = "",
    background = "bg-zinc-900",
  }: {
    title: string;
    background: string;
  }) => {
    const path = usePathname();
    const newPath = path === "/" ? "Home" : formatPath(path);

    return (
      <h1
        className={`text-2xl w-full h-20 ${background} p-4 text-white flex justify-between items-center mb-0.5`}
      >
        {title ? title : newPath}
      </h1>
    );
  }
);

Header.displayName = "Header";
export default Header;
