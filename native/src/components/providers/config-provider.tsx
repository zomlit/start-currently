"use client";
import { classes } from "@/lib/classes/classes";
import React, { createContext, useState, ReactNode } from "react";

// Define the shape of your configuration
export type Config = {
  colors: {
    primary: string;
    secondary: string;
    mutual: string;
  }[];
  logos: {
    primary: string;
  }[];
  team_info: {
    name: string;
    players: {
      [key: string]: {
        photo: string;
      };
    };
  }[];
  series: {
    best_of: number;
    [key: number]: {
      score: number;
    };
  };
  classes: { [key: string]: string } | undefined;
};

// Create a context for your configuration data
interface ConfigContextType {
  config: Config;
  setConfig: React.Dispatch<React.SetStateAction<Config>>;
}

export const ConfigContext = createContext<ConfigContextType | undefined>(
  undefined
);

interface ConfigProviderProps {
  children: ReactNode;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  // Define your initial configuration state here
  const [config, setConfig] = useState<Config>({
    colors: [
      { primary: "#700", secondary: "#FFF", mutual: "#121013" },
      { primary: "#00549A", secondary: "#FFF", mutual: "#121013" },
    ],
    logos: [
      {
        primary: "",
      },
      {
        primary: "",
      },
    ],
    team_info: [
      {
        name: "Team 1",
        players: {
          Player1: {
            photo: "",
          },
          Player2: {
            photo: "",
          },
          Player3: {
            photo: "",
          },
        },
      },
      {
        name: "Team 2",
        players: {},
      },
    ],
    series: {
      best_of: 3,
      [0]: {
        score: 1,
      },
      [1]: {
        score: 1,
      },
    },
    classes: classes,
  });

  return (
    <ConfigContext.Provider value={{ config, setConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};
