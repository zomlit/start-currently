import React from "react";
import { Link } from "@tanstack/react-router";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/tanstack-start";

export function Navigation() {
  return (
    <div className="p-2 flex gap-2 text-lg relative z-10">
      <Link
        to="/"
        activeProps={{
          className: "font-bold",
        }}
        activeOptions={{ exact: true }}
      >
        Home
      </Link>{" "}
      <Link
        to="/posts"
        activeProps={{
          className: "font-bold",
        }}
      >
        Posts
      </Link>
      <Link
        to="/dashboard"
        activeProps={{
          className: "font-bold",
        }}
      >
        Dashboard
      </Link>
      <Link
        to="/pricing"
        activeProps={{
          className: "font-bold",
        }}
      >
        Pricing
      </Link>
      <div className="ml-auto">
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal" />
        </SignedOut>
      </div>
    </div>
  );
}
