import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProfile, useProfiles } from "@/hooks/useProfile";
import { Slider, ColorPicker, Switch } from "@/components/form/index";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/tanstack-start";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import apiMethods from "@/lib/api";
import { Plus, Copy, Trash, Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/utils/toast";
import { WidgetPreview } from "@/components/widget-preview";
import { useDatabaseStore } from "@/store/supabaseCacheStore";
import { SpotifyTrack } from "@/types/spotify";
import { formatTime } from "@/utils";
import { Spinner } from "@/components/ui/spinner";
import { WidgetLayout } from "@/components/layouts/WidgetLayout";
import { VisualizerSettingsForm } from "@/components/widget-settings/VisualizerSettingsForm";
import type { VisualizerSettings } from "@/types/widget";

const profileSchema = z.object({
  id: z.string().optional(),
  section_id: z.string(),
  settings: z.object({
    name: z.string().min(1, "Profile name is required"),
    isDefault: z.boolean().default(false),
    specificSettings: z.object({
      selectedSkin: z
        .enum(["default", "minimal", "rounded"])
        .default("rounded"),
      hideOnDisabled: z.boolean().default(false),
      pauseEnabled: z.boolean().default(false),
      canvasEnabled: z.boolean().default(false),
      backgroundCanvas: z.boolean().default(false),
      backgroundCanvasOpacity: z.number().min(0).max(1).default(0.5),
      micEnabled: z.boolean().default(false),
      progressBarForegroundColor: z.string().default("#ffffff"),
      progressBarBackgroundColor: z.string().default("#000000"),
      mode: z.number().default(10),
      gradient: z.string().default("rainbow"),
      customGradientStart: z
        .object({
          r: z.number(),
          g: z.number(),
          b: z.number(),
          a: z.number(),
        })
        .optional(),
      customGradientEnd: z
        .object({
          r: z.number(),
          g: z.number(),
          b: z.number(),
          a: z.number(),
        })
        .optional(),
      fillAlpha: z.number().min(0).max(1).default(0.5),
      lineWidth: z.number().min(0).max(5).default(1),
      channelLayout: z.string().default("dual-combined"),
      frequencyScale: z.string().default("bark"),
      linearAmplitude: z.boolean().default(true),
      linearBoost: z.number().default(1.8),
      showPeaks: z.boolean().default(false),
      outlineBars: z.boolean().default(true),
      weightingFilter: z.string().default("D"),
      barSpace: z.number().default(0.1),
      ledBars: z.boolean().default(false),
      lumiBars: z.boolean().default(false),
      reflexRatio: z.number().default(0),
      reflexAlpha: z.number().default(0.15),
      reflexBright: z.number().default(1),
      mirror: z.number().default(0),
      splitGradient: z.boolean().default(false),
      roundBars: z.boolean().default(false),
    }),
  }),
});

type Profile = z.infer<typeof profileSchema>;

export const Route = createFileRoute("/_app/widgets/visualizer")({
  component: VisualizerSection,
});

function VisualizerSection() {
  const { subscribeToTable, unsubscribeFromTable, currentTrack } =
    useDatabaseStore();

  const { userId, getToken, isLoaded } = useAuth();
  const queryClient = useQueryClient();
  const [selectedProfileId, setSelectedProfileId] = React.useState<
    string | null
  >(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [newProfileName, setNewProfileName] = React.useState("");

  const {
    data: profiles,
    isLoading: isProfilesLoading,
    error: profilesError,
  } = useProfiles("visualizer");

  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useProfile("visualizer", selectedProfileId);

  const methods = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: profile || {
      section_id: "visualizer",
      settings: {
        name: "New Profile",
        isDefault: false,
        specificSettings: {
          selectedSkin: "rounded",
          hideOnDisabled: false,
          pauseEnabled: false,
          canvasEnabled: false,
          backgroundCanvas: false,
          backgroundCanvasOpacity: 0.5,
          micEnabled: false,
          progressBarForegroundColor: "#ffffff",
          progressBarBackgroundColor: "#000000",
          mode: 10,
          gradient: "rainbow",
          fillAlpha: 0.5,
          lineWidth: 1,
          channelLayout: "dual-combined",
          frequencyScale: "bark",
          linearAmplitude: true,
          linearBoost: 1.8,
          showPeaks: false,
          outlineBars: true,
          weightingFilter: "D",
          barSpace: 0.1,
          ledBars: false,
          lumiBars: false,
          reflexRatio: 0,
          reflexAlpha: 0.15,
          reflexBright: 1,
          mirror: 0,
          splitGradient: false,
          roundBars: false,
        },
      },
    },
  });

  const nowPlayingData = useDatabaseStore(
    (state) => state.VisualizerWidget?.[0]
  );

  const { watch, handleSubmit, setValue, reset } = methods;

  React.useEffect(() => {
    if (profile) {
      reset(profile);
    }
  }, [profile, reset]);

  React.useEffect(() => {
    if (profiles && profiles.length > 0 && !selectedProfileId) {
      const defaultProfile = profiles.find(
        (p: Profile) => p.settings.isDefault
      );
      setSelectedProfileId(defaultProfile?.id || profiles[0].id);
    }
  }, [profiles, selectedProfileId]);

  const getTokenAsync = async () => {
    const token = await getToken({ template: "lstio" });
    if (!token) throw new Error("No token available");
    return token;
  };

  const mutation = useMutation({
    mutationFn: async (newProfile: Profile) => {
      const token = await getTokenAsync();
      if (newProfile.id) {
        return apiMethods.profiles.update(
          newProfile.id,
          newProfile.settings,
          token
        );
      } else {
        return apiMethods.profiles.createDefault(
          "visualizer",
          userId!,
          newProfile.settings,
          token
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles", "visualizer"] });
      toast.success({ title: "Profile saved successfully" });
    },
  });

  const copyMutation = useMutation({
    mutationFn: async (profileToCopy: Profile) => {
      const token = await getTokenAsync();
      return apiMethods.profiles.copy(profileToCopy, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles", "visualizer"] });
      toast.success({ title: "Profile duplicated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (profileId: string) => {
      const token = await getTokenAsync();
      return apiMethods.profiles.delete(profileId, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles", "visualizer"] });
      if (profiles && profiles.length > 1) {
        setSelectedProfileId(profiles[0].id);
      }
      toast.success({ title: "Profile deleted successfully" });
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: async (profileName: string) => {
      const token = await getTokenAsync();
      if (!userId) {
        throw new Error("User ID is not available");
      }

      const settings = {
        name: profileName,
        isDefault: false,
        specificSettings: {
          selectedSkin: "rounded",
          hideOnDisabled: false,
          pauseEnabled: false,
          canvasEnabled: false,
          backgroundCanvas: false,
          backgroundCanvasOpacity: 0.5,
          micEnabled: false,
          progressBarForegroundColor: "#ffffff",
          progressBarBackgroundColor: "#000000",
          mode: 10,
          gradient: "rainbow",
          fillAlpha: 0.5,
          lineWidth: 1,
          channelLayout: "dual-combined",
          frequencyScale: "bark",
          linearAmplitude: true,
          linearBoost: 1.8,
          showPeaks: false,
          outlineBars: true,
          weightingFilter: "D",
          barSpace: 0.1,
          ledBars: false,
          lumiBars: false,
          reflexRatio: 0,
          reflexAlpha: 0.15,
          reflexBright: 1,
          mirror: 0,
          splitGradient: false,
          roundBars: false,
        },
      };

      console.log("Sending create profile request with data:", {
        sectionId: "visualizer",
        userId,
        settings,
        tokenPreview: token.substring(0, 10) + "...", // Log part of the token for debugging
      });

      try {
        const response = await apiMethods.profiles.createDefault(
          "visualizer",
          userId,
          settings,
          token
        );
        console.log("Create profile response:", response);
        if (!response.success) {
          throw new Error(response.error || "Failed to create profile");
        }
        return response.data;
      } catch (error: any) {
        console.error("Profile creation error:", error);
        throw new Error(error.message || "Failed to create profile");
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profiles", "visualizer"] });
      setSelectedProfileId(data.id);
      setIsAddDialogOpen(false);
      setNewProfileName("");
      toast.success({ title: "New profile created successfully" });
    },
    onError: (error: any) => {
      console.error("Error creating profile:", error);
      toast.error({ title: error.message || "Failed to create profile" });
    },
  });

  const onSubmit = (data: Profile) => {
    mutation.mutate(data);
  };

  const handleProfileChange = (profileId: string) => {
    setSelectedProfileId(profileId);
  };

  const handleCopyProfile = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (profile) {
      copyMutation.mutate(profile);
    }
  };

  const handleSetDefault = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (selectedProfileId) {
      try {
        const token = await getTokenAsync();
        if (!token) throw new Error("No token available");
        await apiMethods.profiles.setDefault(selectedProfileId, token);
        queryClient.invalidateQueries({ queryKey: ["profiles", "visualizer"] });
        toast.success({ title: "Profile set as default successfully" });
      } catch (error) {
        console.error("Error setting default profile:", error);
        toast.error({ title: "Failed to set profile as default" });
      }
    }
  };

  const handleDeleteProfile = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (selectedProfileId && profiles && profiles.length > 1) {
      if (window.confirm("Are you sure you want to delete this profile?")) {
        deleteMutation.mutate(selectedProfileId);
      }
    } else {
      alert("You cannot delete the last profile.");
    }
  };

  const handleCreateProfile = () => {
    if (newProfileName.trim()) {
      console.log("Creating profile:", newProfileName.trim());
      createProfileMutation.mutate(newProfileName.trim());
    }
  };

  if (!isLoaded || isProfilesLoading) {
    return <Spinner className="w-8 fill-violet-300 dark:text-white" />;
  }

  if (!userId) {
    return <div>Please sign in to customize your visualizer</div>;
  }

  if (profilesError) {
    return (
      <div>
        <p>Error loading profiles: {profilesError.message}</p>
        <Button
          onClick={() =>
            queryClient.invalidateQueries({
              queryKey: ["profiles", "visualizer"],
            })
          }
        >
          Retry
        </Button>
      </div>
    );
  }

  const VisualizerPreview = (
    <div className="h-full w-full">
      <WidgetPreview
        currentProfile={profile as WidgetProfile}
        selectedWidget="visualizer"
        initialTrack={currentTrack as SpotifyTrack}
        userId={userId}
      />
      <div className="relative z-10">
        <h2 className="mb-2 flex items-center text-lg font-bold text-purple-400">
          <svg
            className="mr-2 h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
          Now Playing
        </h2>
        {(nowPlayingData?.track as SpotifyTrack) ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              {(nowPlayingData?.track as SpotifyTrack)?.albumArt && (
                <img
                  src={(nowPlayingData?.track as SpotifyTrack).albumArt}
                  alt="Album Art"
                  className="h-20 w-20 rounded-md border-2 border-blue-400 shadow-md"
                />
              )}
              <div>
                <p className="text-2xl font-bold text-blue-300">
                  {(nowPlayingData?.track as SpotifyTrack).title}
                </p>
                <p className="text-lg text-purple-200">
                  {(nowPlayingData?.track as SpotifyTrack).artist}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-[auto,1fr] gap-x-4">
              <p className="text-gray-400">Album:</p>
              <p className="text-purple-200">
                {(nowPlayingData?.track as SpotifyTrack).album}
              </p>
              <p className="text-gray-400">Status:</p>
              <p
                className={`font-semibold ${
                  (nowPlayingData?.track as SpotifyTrack).isPlaying
                    ? "text-green-400"
                    : "text-yellow-400"
                }`}
              >
                {(nowPlayingData?.track as SpotifyTrack).isPlaying
                  ? "Playing"
                  : "Paused"}
              </p>
              <p className="text-gray-400">Progress:</p>
              <p className="text-purple-200">
                {formatTime((nowPlayingData?.track as SpotifyTrack).elapsed)} /{" "}
                {formatTime((nowPlayingData?.track as SpotifyTrack).duration)}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-300">Waiting for track data...</p>
        )}
      </div>
    </div>
  );

  const VisualizerSettings = (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Select
          onValueChange={handleProfileChange}
          value={selectedProfileId || undefined}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a profile" />
          </SelectTrigger>
          <SelectContent>
            {Array.isArray(profiles) &&
              profiles.map((profile) => (
                <SelectItem key={profile.id} value={profile.id || ""}>
                  {profile.settings.name}
                  {profile.settings.isDefault && " (Default)"}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <div className="flex space-x-2">
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            size="icon"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button onClick={handleCopyProfile} size="icon" variant="outline">
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleDeleteProfile}
            size="icon"
            variant="outline"
            disabled={profiles?.length <= 1}
          >
            <Trash className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleSetDefault}
            disabled={profile?.settings.isDefault}
          >
            Set as Default
          </Button>
        </div>
      </div>
      {profile && (
        <VisualizerSettingsForm
          settings={profile.settings.specificSettings}
          onUpdate={(updates) => {
            if (profile.id) {
              mutation.mutate({
                ...profile,
                settings: {
                  ...profile.settings,
                  specificSettings: {
                    ...profile.settings.specificSettings,
                    ...updates,
                  },
                },
              });
            }
          }}
        />
      )}
    </div>
  );

  return (
    <>
      <WidgetLayout preview={VisualizerPreview} settings={VisualizerSettings} />
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Profile</DialogTitle>
            <DialogDescription>
              Enter a name for your new profile.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Profile Name"
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProfile}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
