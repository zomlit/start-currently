import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { ProfileSettings } from "@/types";
import { useQueryClient } from "@tanstack/react-query";

type OptimisticProfileSettingsContextType = {
  currentProfileSettings: ProfileSettings;
  optimisticProfileSettings: ProfileSettings;
  updateProfileSetting: (
    settingType: keyof ProfileSettings,
    fieldName: string,
    value: any
  ) => void;
  setCurrentProfileSettings: (settings: ProfileSettings) => void;
};

const OptimisticProfileSettingsContext = createContext<
  OptimisticProfileSettingsContextType | undefined
>(undefined);

export function OptimisticProfileSettingsProvider({
  children,
  initialProfileSettings,
}: {
  children: React.ReactNode;
  initialProfileSettings: ProfileSettings;
}) {
  const [currentProfileSettings, setCurrentProfileSettings] = useState(
    initialProfileSettings
  );
  const [optimisticProfileSettings, setOptimisticProfileSettings] = useState(
    initialProfileSettings
  );
  const queryClient = useQueryClient();

  useEffect(() => {
    setCurrentProfileSettings(initialProfileSettings);
    setOptimisticProfileSettings(initialProfileSettings);
  }, [initialProfileSettings]);

  const updateProfileSetting = (
    settingType: keyof ProfileSettings,
    fieldName: string,
    value: any
  ) => {
    setOptimisticProfileSettings((prevSettings) => ({
      ...prevSettings,
      [settingType]: {
        ...prevSettings[settingType],
        [fieldName]: value,
      },
    }));

    // Here you would typically update the server and then update the actual settings
    // For now, we'll just update the current settings immediately
    setCurrentProfileSettings((prevSettings) => ({
      ...prevSettings,
      [settingType]: {
        ...prevSettings[settingType],
        [fieldName]: value,
      },
    }));

    // Invalidate relevant queries
    queryClient.invalidateQueries({ queryKey: ["profiles"] });
  };

  const contextValue = useMemo(
    () => ({
      currentProfileSettings,
      optimisticProfileSettings,
      updateProfileSetting,
      setCurrentProfileSettings,
    }),
    [currentProfileSettings, optimisticProfileSettings]
  );

  return (
    <OptimisticProfileSettingsContext.Provider value={contextValue}>
      {children}
    </OptimisticProfileSettingsContext.Provider>
  );
}

export function useOptimisticProfileSettings() {
  const context = useContext(OptimisticProfileSettingsContext);
  if (context === undefined) {
    throw new Error(
      "useOptimisticProfileSettings must be used within an OptimisticProfileSettingsProvider"
    );
  }
  return context;
}
