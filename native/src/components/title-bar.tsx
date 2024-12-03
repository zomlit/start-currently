"use client";
import React, { useEffect, useState } from "react";
import { checkUpdate, installUpdate } from "@tauri-apps/api/updater";
import { relaunch } from "@tauri-apps/api/process";
import { modifyLinks } from "@/lib/utils";
import { marked } from "marked";
import useSiteWindow from "./hooks/useSiteWindow";

const TitleBarButton = ({ src = "", onClick }: { onClick: any; src: any }) => {
  return (
    <div
      className="inline-flex justify-center items-center w-[25px] h-full text-white fill-white hover:bg-zinc-800/50 cursor-pointer"
      id="titlebar-minimize"
      onClick={onClick}
    >
      {src}
    </div>
  );
};

const TitleBar = () => {
  const [manifest, setManifest] = useState<any>();
  const { appWindow } = useSiteWindow();

  const windowMinimize = () => appWindow?.minimize();
  const windowMaximize = () => appWindow?.maximize();
  const windowClose = () => appWindow?.close();

  function startInstall(newVersion: any) {
    installUpdate().then(relaunch);
  }

  // update checker
  useEffect(() => {
    checkUpdate().then(({ shouldUpdate, manifest }) => {
      if (shouldUpdate) {
        setManifest(manifest);
      }
    });
  }, []);

  return <></>;
};

export default TitleBar;
