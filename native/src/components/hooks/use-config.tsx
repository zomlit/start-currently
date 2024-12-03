"use client";
import { useCallback, useContext } from "react";
import { Config, ConfigContext } from "../providers/config-provider";

export const useConfig = () => {
  const context = useContext(ConfigContext);

  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }

  const { config, setConfig } = context;

  function cssToJS(cssString: string) {
    const jsStyles: any = {};
    // Split the CSS string by closing braces
    const rules = cssString.split("}");

    for (let rule of rules) {
      if (rule.trim() !== "") {
        // Split rule by opening brace
        const parts = rule.split("{");
        const className = parts[0].trim().replace(".", ""); // Remove the dot
        const styles = parts[1].trim();
        jsStyles[className] = styles;
      }
    }

    return jsStyles;
  }

  const updateClasses = useCallback(
    (newClasses: string) => {
      setConfig((prevConfig) => ({
        ...prevConfig,
        classes: cssToJS(newClasses),
      }));
    },
    [setConfig]
  );

  return {
    config: config,
  };
};
