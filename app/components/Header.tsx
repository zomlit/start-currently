import React from "react";
import { UserButton } from "@clerk/tanstack-start";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { LstLogo } from "./icons";

interface HeaderProps {
  url: string;
}

const Header: React.FC<HeaderProps> = () => {
  const isScrolled = useScrollPosition();

  return (
    <header className="relative">
      <nav
        className={`fixed left-0 right-0 top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "animate-slide-up h-[68px] bg-white/5 py-4 shadow-md backdrop-blur-lg"
            : "h-[116px] py-10"
        }`}
      >
        <div className="container flex max-w-full items-center">
          <a href="/" className="flex items-center">
            <div
              className={`ml-1 mr-2 flex items-center justify-between py-2 transition-all [&>*]:fill-white ${
                isScrolled ? "scale-75" : ""
              }`}
            >
              <LstLogo className="md:invisible" />
            </div>
            <span
              className={`font-display inline break-words bg-gradient-to-r from-blue-500 via-sky-400 to-purple-400 bg-clip-text font-light tracking-tight text-transparent transition-all duration-300 ${
                isScrolled ? "text-2xl" : "text-3xl"
              }`}
            >
              {/* livestreaming.tools */}
            </span>
          </a>

          <div className={`flex-1 items-center md:mt-0 md:flex`}>
            <ul className="relative z-50 mr-8 flex flex-1 items-center justify-end space-y-0 md:mr-0">
              <Navigation isScrolled={isScrolled} />
              <div className="relative top-1 z-50 ml-14">
                <UserButton afterSignOutUrl="/" />
              </div>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
