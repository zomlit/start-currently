import { useState, useEffect, useCallback, useReducer } from "react";
import { useAuth } from "@clerk/tanstack-start";
import WidgetControls from "@/components/widget-controls";
import { WidgetConfiguratorForm } from "@/components/widget-configurator-form";
import { WidgetPreview } from "@/components/widget-preview";
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
import { useOptimisticProfileSettings } from "@/contexts/OptimisticProfileSettingsContext";
import { defaultCommonSettings } from "@/types/initialWidgets";
import { createClient } from "@supabase/supabase-js";

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

function DashboardWidgets() {
  const [state, dispatch] = useReducer(widgetReducer, {
    widgets: initialWidgets,
    selectedWidget: "visualizer",
    selectedProfile: null,
  });

  const { userId } = useAuth();
  const { subscribeToTable, unsubscribeFromTable, currentTrack } =
    useDatabaseStore();
  const [isLoading, setIsLoading] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const { optimisticProfileSettings, updateProfileSetting } =
    useOptimisticProfileSettings();

  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ... (keep the rest of the component logic, updating user?.id to userId where necessary)

  return (
    <Container isDashboard maxWidth="full" className="mb-20">
      <BackgroundImage
        src="/images/hero-bg.webp"
        alt="Dashboard background"
        opacity={0.4}
        zIndex={-5}
      />
      <DashboardHeader
        category="Widgets"
        title={`${state.selectedWidget}`}
        description={`Customize your ${state.selectedWidget} settings`}
        keyModalText="Add Spotify Keys"
        buttonUrl=""
        buttonText=""
        backText="Back to Widgets"
      />
      {/* ... (keep the rest of the JSX) */}
    </Container>
  );
}

export default DashboardWidgets;
