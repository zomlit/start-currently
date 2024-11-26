import { SignIn, useSignIn } from "@clerk/tanstack-start";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CircleDot } from "@/components/icons";
import React, { useState } from "react";

export const Route = createFileRoute("/_app/sign-in/$")({
  component: SignInPage,
});

function SignInPage() {
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  return (
    <>
      <Container maxWidth="full" isDashboard>
        {/* <div className="min-h-screen w-full overflow-hidden lg:grid lg:grid-cols-2">
          <div className="flex items-center justify-center py-12">
            <div className="mx-auto grid w-[350px] gap-6">
              <div className="grid gap-2 text-center">
                <div className="flex justify-center">
                  <CircleDot className={`mb-10 w-16 fill-primary`} />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Welcome back
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enter your email to sign in to your account
                </p>
              </div>
              <form className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="ml-auto inline-block text-sm underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Sign In
                </Button>
              </form>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Login with Google
              </Button>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/sign-up" className="underline">
                  Sign up
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden bg-muted lg:block">
            <img
              src="/placeholder.svg"
              alt="Authentication"
              className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </div> */}

        <div className="flex items-center justify-center w-full h-screen">
          <div className="w-auto relative">
            <div className="relative z-20 backdrop-blur-lg rounded-lg shadow-xl">
              <SignIn
                routing="path"
                path="/sign-in"
                appearance={{
                  elements: {
                    formButtonPrimary:
                      "bg-purple-600 hover:bg-purple-700 dark:text-white",
                    formFieldInput:
                      "bg-white/20 border-purple-300 text-white placeholder-purple-200 dark:text-white",
                    formFieldLabel: "dark:text-white",
                    headerTitle: "dark:text-white text-xl uppercase",
                    headerSubtitle: "text-purple-400",
                    card: "dark:bg-background backdrop-blur-lg",
                    footer: "dark:text-white !dark:bg-background bg-none",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
