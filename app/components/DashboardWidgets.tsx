import { useState, useEffect, useCallback, useReducer } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import WidgetControls from "@/components/widget-controls";
import { WidgetConfiguratorForm } from "@/components/widget-configurator-form";
// import { WidgetPreview } from "@/components/widget-preview";
import BackgroundImage from "@/components/ui/background-image";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import DashboardHeader from "@/components/DashboardHeader";
import { toast } from "@/utils/toast";
import { useDebouncedCallback } from "use-debounce";
import {
  loadProfiles,
  saveProfileToSupabase,
  addProfileToSupabase,
  deleteProfileFromSupabase,
  updateProfileNameInSupabase,
  checkProfileExists,
  updateProfile,
  loadProfile,
} from "@/utils/widgetDbOperations";
import { WidgetType, WidgetProfile, SpotifyTrack, Widget } from "@/types";
import { initialWidgets } from "@/types/initialWidgets";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useDatabaseStore } from "@/store/supabaseCacheStore";
import { Container } from "@/components/layout/Container";
import { defaultCommonSettings } from "@/types/initialWidgets";
import { createClient } from "@supabase/supabase-js";
import { useSupabase } from "@/hooks/useSupabase";
import { WidgetPreview } from "./widget-preview";
import { Spinner } from "./ui/spinner";

type WidgetState = {
  widgets: Record<WidgetType, Widget>;
  selectedWidget: WidgetType;
  selectedProfile: string | null;
};

type WidgetAction =
  | { type: "SET_WIDGETS"; payload: Record<WidgetType, Widget> }
  | { type: "SET_SELECTED_WIDGET"; payload: WidgetType }
  | { type: "SET_SELECTED_PROFILE"; payload: string | null }
  | {
      type: "UPDATE_PROFILE";
      payload: { widgetType: WidgetType; profile: WidgetProfile };
    };

function widgetReducer(state: WidgetState, action: WidgetAction): WidgetState {
  switch (action.type) {
    case "SET_WIDGETS":
      return { ...state, widgets: action.payload };
    case "SET_SELECTED_WIDGET":
      return { ...state, selectedWidget: action.payload };
    case "SET_SELECTED_PROFILE":
      return { ...state, selectedProfile: action.payload };
    case "UPDATE_PROFILE":
      return {
        ...state,
        widgets: {
          ...state.widgets,
          [action.payload.widgetType]: {
            ...state.widgets[action.payload.widgetType],
            profiles: state.widgets[action.payload.widgetType].profiles.map(
              (profile) =>
                profile.id === action.payload.profile.id
                  ? action.payload.profile
                  : profile
            ),
          },
        },
      };
    default:
      return state;
  }
}

interface DashboardWidgetsProps {
  userId: string;
}

function DashboardWidgets({ userId }: DashboardWidgetsProps) {
  const [state, dispatch] = useReducer(widgetReducer, {
    widgets: initialWidgets,
    selectedWidget: "visualizer",
    selectedProfile: null,
  });
  const { user } = useUser();
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  // Add this line to declare the isLoading state
  const [isLoading, setIsLoading] = useState(false);

  // Use React Query to fetch profiles
  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ["profiles", user?.id],
    queryFn: () => loadProfiles(user?.id || ""),
  });

  // Use React Query for optimistic updates
  const updateProfileMutation = useMutation({
    mutationFn: (updates: Partial<WidgetProfile>) =>
      updateProfile(updates.id, updates),
    onMutate: async (newProfile) => {
      await queryClient.cancelQueries({ queryKey: ["profiles", user?.id] });
      const previousProfiles = queryClient.getQueryData(["profiles", user?.id]);
      queryClient.setQueryData(["profiles", user?.id], (old: WidgetProfile[]) =>
        old.map((profile) =>
          profile.id === newProfile.id ? { ...profile, ...newProfile } : profile
        )
      );
      return { previousProfiles };
    },
    onError: (err, newProfile, context) => {
      queryClient.setQueryData(
        ["profiles", user?.id],
        context.previousProfiles
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles", user?.id] });
    },
  });

  const { subscribeToTable, unsubscribeFromTable, currentTrack } =
    useDatabaseStore();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const transformProfilesToWidgets = useCallback(
    (profiles: WidgetProfile[]): Record<WidgetType, Widget> => {
      const transformedWidgets: Record<WidgetType, Widget> = {
        visualizer: { profiles: [] },
        chat: { profiles: [] },
        alerts: { profiles: [] },
        game_stats: { profiles: [] },
        game_overlay: { profiles: [] },
        gamepad: { profiles: [] },
        timer: { profiles: [] },
        configure: { profiles: [] },
        freeform: { profiles: [] },
      };

      profiles.forEach((profile) => {
        const widgetType = profile.widgetType as WidgetType;
        if (transformedWidgets[widgetType]) {
          transformedWidgets[widgetType].profiles.push(profile);
        } else {
          console.warn(`Unknown widget type: ${widgetType}`);
        }
      });

      // Only add a default profile if there are no profiles for a widget type
      Object.keys(transformedWidgets).forEach((widgetType) => {
        if (
          transformedWidgets[widgetType as WidgetType].profiles.length === 0
        ) {
          console.warn(
            `No profiles found for widget type: ${widgetType}. Adding a default profile.`
          );
          transformedWidgets[widgetType as WidgetType].profiles.push({
            id: `default-${widgetType}`,
            name: `Default ${widgetType} Profile`,
            widgetType: widgetType as WidgetType,
            settings: {
              commonSettings: defaultCommonSettings,
              specificSettings: {},
            },
            color: "#000000",
            is_active: true,
            is_current: false,
            user_id: user?.id || "",
          } as WidgetProfile);
        }
      });

      return transformedWidgets;
    },
    [user?.id]
  );

  const refreshData = useCallback(
    async (keepSelectedProfile?: string) => {
      const userId = user?.id;
      if (userId) {
        setIsLoading(true);
        try {
          console.log("Fetching profiles for user:", userId);
          const data = await loadProfiles(userId);
          console.log("Raw profile data:", data);
          const loadedWidgets = transformProfilesToWidgets(data);
          console.log("Transformed widgets:", loadedWidgets);

          dispatch({ type: "SET_WIDGETS", payload: loadedWidgets });

          if (keepSelectedProfile) {
            dispatch({
              type: "SET_SELECTED_PROFILE",
              payload: keepSelectedProfile,
            });
          } else {
            const availableProfiles =
              loadedWidgets[state.selectedWidget]?.profiles || [];
            const newSelectedProfile = availableProfiles[0]?.id || null;
            dispatch({
              type: "SET_SELECTED_PROFILE",
              payload: newSelectedProfile,
            });
          }

          console.log("Profiles loaded:", loadedWidgets);
        } catch (error) {
          console.error("Error loading profiles:", error);
          toast.error({
            title: "Failed to load profiles",
          });
        } finally {
          setIsLoading(false);
        }
      }
    },
    [user?.id, state.selectedWidget, transformProfilesToWidgets]
  );

  const setCurrentProfile = useCallback(
    async (profileId: string) => {
      if (!user?.id) {
        console.error("User ID is not available");
        return;
      }

      console.log(`Attempting to set current profile to: ${profileId}`);
      try {
        dispatch({ type: "SET_SELECTED_PROFILE", payload: profileId });

        console.log(`Current profile optimistically set to ${profileId}`);

        await updateProfile(profileId, { is_current: true });

        console.log(`Database updated for profile: ${profileId}`);

        // Fetch the updated profile data
        const updatedProfile = await loadProfile(
          user.id,
          state.selectedWidget,
          profileId
        );
        if (updatedProfile) {
          dispatch({
            type: "UPDATE_PROFILE",
            payload: {
              widgetType: state.selectedWidget,
              profile: updatedProfile as WidgetProfile,
            },
          });
        }

        console.log("Profile data updated in state");
      } catch (error) {
        console.error("Error setting current profile:", error);
        toast.error({
          title: "Failed to set current profile. Please try again.",
        });
        await refreshData();
      }
    },
    [updateProfile, refreshData, user?.id, state.selectedWidget]
  );

  // Replace updateWidgetSettings function
  const updateWidgetSettings = useCallback(
    async (
      widgetType: WidgetType,
      profileId: string,
      updatedSettings: Partial<ProfileSettings>
    ) => {
      try {
        const currentProfile = profiles?.find(
          (profile) => profile.id === profileId
        );
        if (!currentProfile)
          throw new Error("Profile not found in local state");

        const mergedSettings = {
          commonSettings: {
            ...currentProfile.settings.commonSettings,
            ...(updatedSettings.settings?.commonSettings || {}),
          },
          specificSettings: {
            ...currentProfile.settings.specificSettings,
            ...(updatedSettings.settings?.specificSettings || {}),
          },
        };

        await updateProfileMutation.mutateAsync({
          id: profileId,
          settings: mergedSettings,
        });

        return { data: currentProfile, status: 200 };
      } catch (error) {
        console.error("Error updating widget settings:", error);
        return { error: error.message || "Unknown error", status: 500 };
      }
    },
    [profiles, updateProfileMutation]
  );

  const addProfile = async (name: string, widgetType: WidgetType) => {
    const userId = user?.id;
    if (!userId) {
      console.error("User ID is undefined");
      toast.error({
        title: "Failed to add profile. User ID is missing.",
      });
      return;
    }

    try {
      const newProfile = await addProfileToSupabase(userId, widgetType, name);
      dispatch({
        type: "UPDATE_PROFILE",
        payload: { widgetType, profile: newProfile },
      });
      dispatch({ type: "SET_SELECTED_PROFILE", payload: newProfile.id });
      toast.success({
        title: `Profile "${name}" added successfully`,
      });
    } catch (error) {
      console.error("Error adding profile:", error);
      toast.error({
        title: "Failed to add profile",
      });
    }
  };

  const duplicateProfile = async () => {
    const userId = user?.id;

    if (!userId) {
      console.error("User ID is undefined");
      toast.error({
        title: "Failed to duplicate profile. User ID is missing.",
      });
      return;
    }

    const currentProfile = state.widgets[state.selectedWidget].profiles.find(
      (p) => p.id === state.selectedProfile
    );
    if (!currentProfile) {
      console.error("Current profile not found");
      toast.error({
        title: "Failed to duplicate profile. Current profile not found.",
      });
      return;
    }

    const newProfileName = `${currentProfile.name} Copy`;
    try {
      const exists = await checkProfileExists(
        userId,
        state.selectedWidget,
        newProfileName
      );
      if (exists) {
        toast.error({
          title: `A profile named "${newProfileName}" already exists`,
        });
        return;
      }

      const duplicatedProfile = {
        ...currentProfile,
        name: newProfileName,
      };

      const newProfile = await addProfileToSupabase(
        userId,
        state.selectedWidget,
        newProfileName
      );

      // Update the new profile with the duplicated settings
      if (newProfile.id) {
        await updateProfile(newProfile.id, {
          settings: duplicatedProfile.settings,
          color: duplicatedProfile.color,
        });

        dispatch({
          type: "UPDATE_PROFILE",
          payload: { widgetType: state.selectedWidget, profile: newProfile },
        });
        dispatch({ type: "SET_SELECTED_PROFILE", payload: newProfile.id });
        toast.success({
          title: `Profile "${newProfileName}" duplicated successfully`,
        });
      } else {
        throw new Error("New profile ID is undefined");
      }
    } catch (error) {
      console.error("Error duplicating profile:", error);
      toast.error({
        title: "Failed to duplicate profile",
      });
    }
  };

  const deleteProfile = async () => {
    if (state.widgets[state.selectedWidget].profiles.length > 1) {
      try {
        const profileToDelete = state.widgets[
          state.selectedWidget
        ].profiles.find((p) => p.id === state.selectedProfile);
        if (!profileToDelete) {
          throw new Error("Selected profile not found");
        }
        if (!profileToDelete.id) {
          throw new Error("Profile ID is undefined");
        }
        await deleteProfileFromSupabase(profileToDelete.id);

        dispatch({
          type: "SET_WIDGETS",
          payload: {
            ...state.widgets,
            [state.selectedWidget]: {
              ...state.widgets[state.selectedWidget],
              profiles: state.widgets[state.selectedWidget].profiles.filter(
                (profile) => profile.id !== state.selectedProfile
              ),
            },
          },
        });
        const firstRemainingProfile =
          state.widgets[state.selectedWidget].profiles[0];
        dispatch({
          type: "SET_SELECTED_PROFILE",
          payload: firstRemainingProfile?.id || null,
        });
        toast.success({
          title: "Profile deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting profile:", error);
        toast.error({
          title: "Failed to delete profile",
        });
      }
    } else {
      toast.error({
        title: "Cannot delete the only profile",
      });
    }
  };

  const handleProfileNameChange = async (newName: string) => {
    const currentProfile = state.widgets[state.selectedWidget].profiles.find(
      (p) => p.id === state.selectedProfile
    );
    if (!currentProfile) {
      toast.error({
        title: "Current profile not found",
      });
      return;
    }

    if (newName === currentProfile.name) {
      return;
    }

    try {
      const exists = await checkProfileExists(
        user?.id || "",
        state.selectedWidget,
        newName
      );
      if (exists) {
        toast.error({
          title: `A profile named "${newName}" already exists`,
        });
        return;
      }

      if (!currentProfile.id) {
        throw new Error("Profile ID is undefined");
      }

      await updateProfileNameInSupabase(currentProfile.id, newName);

      // Refresh data after updating
      await refreshData();

      toast.success({
        title: `Profile name changed to "${newName}"`,
      });
    } catch (error) {
      console.error("Error updating profile name:", error);
      toast.error({
        title: "Failed to update profile name",
      });
    }
  };

  const exportConfig = () => {
    const config = JSON.stringify(state.widgets, null, 2);
    const blob = new Blob([config], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "widget-config.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success({
      title: "Configuration exported successfully",
    });
  };

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const importedWidgets = JSON.parse(
            e.target?.result as string
          ) as Record<WidgetType, Widget>;
          dispatch({ type: "SET_WIDGETS", payload: importedWidgets });
          const firstWidgetType = Object.keys(importedWidgets)[0] as WidgetType;
          dispatch({ type: "SET_SELECTED_WIDGET", payload: firstWidgetType });
          const firstProfile = importedWidgets[firstWidgetType].profiles[0];
          dispatch({
            type: "SET_SELECTED_PROFILE",
            payload: firstProfile?.id || null,
          });
          toast.success({
            title: "Configuration imported successfully",
          });
        } catch (error) {
          console.error("Error importing configuration:", error);
          toast.error({
            title: "Error importing configuration",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    if (user?.id) {
      console.log("User authenticated:", user.id);
      refreshData();
      subscribeToTable("VisualizerWidget");
    } else {
      console.log("User not authenticated");
    }
    return () => {
      unsubscribeFromTable("VisualizerWidget");
    };
  }, [user?.id, subscribeToTable, unsubscribeFromTable, refreshData]);

  // Add this useEffect to load profiles on page load
  useEffect(() => {
    if (user?.id) {
      refreshData();
    }
  }, [user?.id, refreshData]);

  const currentProfile = state.widgets[state.selectedWidget]?.profiles.find(
    (p) => p.id === state.selectedProfile
  );

  return (
    <Container isDashboard maxWidth="7xl" className="mb-20">
      <DashboardHeader
        category="Widgets"
        title={`${state.selectedWidget}`}
        description={`Customize your ${state.selectedWidget} settings`}
        keyModalText="Add Spotify Keys"
        buttonUrl=""
        buttonText=""
        backText="Back to Widgets"
      />
      <WidgetControls
        widgets={state.widgets}
        selectedWidget={state.selectedWidget}
        setSelectedWidget={(widget) =>
          dispatch({ type: "SET_SELECTED_WIDGET", payload: widget })
        }
        selectedProfile={state.selectedProfile || ""}
        setSelectedProfile={setCurrentProfile}
        addProfile={addProfile}
        duplicateProfile={duplicateProfile}
        deleteProfile={deleteProfile}
        handleProfileNameChange={handleProfileNameChange}
        exportConfig={exportConfig}
        importConfig={importConfig}
        updateWidgetSettings={updateWidgetSettings}
      />
      <ResizablePanelGroup
        direction={isDesktop ? "horizontal" : "vertical"}
        className="!overflow-visible"
      >
        <ResizablePanel
          defaultSize={isDesktop ? 72 : 100}
          className="relative !overflow-visible bg-gradient/5 lg:flex-row lg:p-8"
        >
          {state.selectedProfile && user?.id && currentProfile && (
            <WidgetPreview
              currentProfile={currentProfile}
              selectedWidget={state.selectedWidget}
              initialTrack={currentTrack as SpotifyTrack}
              userId={user.id}
              // Pass the current profile data instead of optimisticProfileSettings
              optimisticSettings={currentProfile.settings}
            />
          )}
        </ResizablePanel>
        {isDesktop && <ResizableHandle withHandle />}
        <ResizablePanel
          defaultSize={isDesktop ? 28 : 100}
          className="min-w-[20rem] !overflow-visible rounded-br-3xl bg-background/50 min-h-[calc(100vh-200px)]"
        >
          {state.selectedProfile && (
            <WidgetConfiguratorForm
              widgets={state.widgets}
              selectedWidget={state.selectedWidget}
              selectedProfile={state.selectedProfile}
              updateWidgetSettings={updateWidgetSettings}
            />
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </Container>
  );
}

export default DashboardWidgets;
