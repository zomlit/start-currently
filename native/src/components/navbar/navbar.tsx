"use client";
import React from "react";
import NavbarTabs from "./navbar-tabs";
import Header from "../header";
import { useAuth } from "../providers/auth-provider";

type Props = {};

const Navbar = (props: Props) => {
  return (
    <nav className="h-full flex flex-col justify-start items-start">
      <NavbarTabs />
    </nav>
  );
};

export default Navbar;
