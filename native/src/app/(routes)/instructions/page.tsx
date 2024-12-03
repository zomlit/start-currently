"use client";
import ClickToCopy from "@/components/click-to-copy";
import dynamic from "next/dynamic";
import React from "react";

const Instructions = () => {
  return (
    <>
      <div className="w-full p-4 h-fit flex flex-col justify-start items-start gap-2">
        <span className="text-lg text-left text-white">STEP 1</span>
        <p className="text-left text-sm text-gray-300">
          Grab the following link and place it in your browser source for the
          stream. Set to 1920x1080.
        </p>
        <ClickToCopy text={""} />
        <div className="w-full h-full overflow-hidden rounded-md shadow-md"></div>
      </div>
    </>
  );
};

export default Instructions;
