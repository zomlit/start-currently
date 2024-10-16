import React, {
  createContext,
  useContext,
  useOptimistic,
  useTransition,
  useState,
  useEffect,
} from "react";
import { ProfileSettings } from "@/types";

type OptimisticProfileSettingsContextType = {
  currentProfileSettings: ProfileSettings;
  optimisticProfileSettings: ProfileSettings;
  updateProfileSetting: (
    settingType: keyof ProfileSettings,
    fieldName: string,
    value: any
  ) => void;
  setCurrentProfileSettings: (settings: ProfileSettings) => void;
  setSupabaseResponse: (response: any) => void;
  supabaseResponse: any | null;
};

const OptimisticProfileSettingsContext = createContext<
  OptimisticProfileSettingsContextType | undefined
>(undefined);

export function OptimisticProfileSettingsProvider({
  children,
  initialProfileSettings,
  initialSupabaseResponse = null,
}: {
  children: React.ReactNode;
  initialProfileSettings: ProfileSettings;
  initialSupabaseResponse?: any | null;
}) {
  const [currentProfileSettings, setCurrentProfileSettings] = useState(
    initialProfileSettings
  );
  const [optimisticProfileSettings, setOptimisticProfileSettings] =
    useOptimistic(
      currentProfileSettings,
      (
        currentSettings,
        newSetting: {
          settingType: keyof ProfileSettings;
          fieldName: string;
          value: any;
        }
      ) => ({
        ...currentSettings,
        [newSetting.settingType]: {
          ...currentSettings[newSetting.settingType],
          [newSetting.fieldName]: newSetting.value,
        },
      })
    );

  const [supabaseResponse, setSupabaseResponse] = useState(
    initialSupabaseResponse
  );

  useEffect(() => {
    setCurrentProfileSettings(initialProfileSettings);
  }, [initialProfileSettings]);

  useEffect(() => {
    if (
      supabaseResponse &&
      supabaseResponse.data &&
      supabaseResponse.data.settings
    ) {
      setCurrentProfileSettings(supabaseResponse.data.settings);
      setOptimisticProfileSettings(supabaseResponse.data.settings);
    }
  }, [supabaseResponse]);

  const [isPending, startTransition] = useTransition();

  const updateProfileSetting = React.useCallback(
    (settingType: keyof ProfileSettings, fieldName: string, value: any) => {
      startTransition(() => {
        setOptimisticProfileSettings((prevSettings) => ({
          ...prevSettings,
          [settingType]: {
            ...prevSettings[settingType],
            [fieldName]: value,
          },
        }));
        setCurrentProfileSettings((prevSettings) => ({
          ...prevSettings,
          [settingType]: {
            ...prevSettings[settingType],
            [fieldName]: value,
          },
        }));
      });
    },
    [setOptimisticProfileSettings, setCurrentProfileSettings]
  );

  const contextValue = React.useMemo(
    () => ({
      currentProfileSettings,
      optimisticProfileSettings,
      updateProfileSetting,
      setCurrentProfileSettings,
      setSupabaseResponse,
      supabaseResponse,
    }),
    [
      currentProfileSettings,
      optimisticProfileSettings,
      updateProfileSetting,
      supabaseResponse,
    ]
  );

  return (
    <OptimisticProfileSettingsContext.Provider value={contextValue}>
      {children}
    </OptimisticProfileSettingsContext.Provider>
  );
}

// Hook to use the context
export function useOptimisticProfileSettings() {
  const context = useContext(OptimisticProfileSettingsContext);
  if (context === undefined) {
    throw new Error(
      "useOptimisticProfileSettings must be used within an OptimisticProfileSettingsProvider"
    );
  }
  return context;
}
