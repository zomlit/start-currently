import React, { useEffect } from "react";
import { AnimatedLink } from "@/components/ui/animated-link";
import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@clerk/tanstack-start";

export default function HeroSection() {
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    console.log("Clerk state updated:", { isLoaded, isSignedIn });
  }, [isLoaded, isSignedIn]);

  return (
    <section className="">
      <div className="mx-auto h-screen content-center align-middle">
        <div className="relative z-30 mx-auto max-w-4xl space-y-5 text-center">
          <h2 className="mx-auto text-6xl font-extrabold tracking-tight lg:text-8xl">
            Take control <span className="font-extralight">of your stream</span>
          </h2>
          <p className="mx-auto max-w-2xl dark:text-gray-400">
            Modern tools for the modern streamer.
          </p>
          <div className="!my-16 flex justify-center">
            {!isLoaded ? (
              <Spinner className="w-8 fill-violet-300 text-white" />
            ) : isSignedIn ? (
              <AnimatedLink
                to="/dashboard"
                text={`HEY ${user?.username || "USER"} GO TO DASHBOARD`}
                glowColors="bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E]"
                focusRingColor="ring-0"
                focusRingWidth="ring-0"
                focusRingOffsetWidth="ring-offset-0"
                focusVisibleRingColor="ring-0"
                focusVisibleRingWidth="ring-0"
                focusVisibleRingOffsetWidth="ring-offset-0"
                focusBoxShadow="shadow-none"
                focusVisibleBoxShadow="shadow-none"
                className="uppercase focus:outline-none"
                glowOpacity={0.5}
              />
            ) : (
              <AnimatedLink
                to="/dashboard"
                text="DASHBOARD"
                glowColors="bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E]"
                focusRingColor="ring-0"
                focusRingWidth="ring-0"
                focusRingOffsetWidth="ring-offset-0"
                focusVisibleRingColor="ring-0"
                focusVisibleRingWidth="ring-0"
                focusVisibleRingOffsetWidth="ring-offset-0"
                focusBoxShadow="shadow-none"
                focusVisibleBoxShadow="shadow-none"
                glowOpacity={0.5}
                className="uppercase focus:outline-none"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
