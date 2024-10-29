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

const profileSchema = z.object({
  id: z.string().optional(),
  section_id: z.string(),
  settings: z.object({
    name: z.string().min(1, "Profile name is required"),
    isDefault: z.boolean().default(true),
    common: z.object({
      backgroundColor: z.string(),
      padding: z.number().min(0).max(50),
      showBorders: z.boolean(),
    }),
    sectionSpecific: z.object({
      fontSize: z.number().min(10).max(50),
      chartType: z.enum(["bar", "line", "pie"]),
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
        common: {
          backgroundColor: "#ffffff",
          padding: 10,
          showBorders: false,
        },
        sectionSpecific: { fontSize: 16, chartType: "bar" },
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
        common: {
          backgroundColor: "#ffffff",
          padding: 10,
          showBorders: false,
        },
        sectionSpecific: {
          fontSize: 16,
          chartType: "bar",
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

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
        <WidgetPreview
          currentProfile="Default Profile"
          selectedWidget="visualizer"
          initialTrack={currentTrack as SpotifyTrack}
          userId={userId}
          // Pass the current profile data instead of optimisticProfileSettings
          // optimisticSettings={currentProfile.settings}
        />
        {/* <Input
          {...methods.register("settings.name")}
          placeholder="Profile Name"
          className="mb-4"
        />

        <h2 className="text-xl font-bold">Common Settings</h2>
        <ColorPicker
          name="settings.common.backgroundColor"
          label="Background Color"
        />
        <Slider
          name="settings.common.padding"
          label="Padding"
          min={0}
          max={50}
        />
        <Switch name="settings.common.showBorders" label="Show Borders" />

        <h2 className="text-xl font-bold">Visualizer Specific Settings</h2>
        <Slider
          name="settings.sectionSpecific.fontSize"
          label="Font Size"
          min={10}
          max={50}
        />
        <Select
          onValueChange={(value) =>
            setValue(
              "settings.sectionSpecific.chartType",
              value as "bar" | "line" | "pie"
            )
          }
          value={watch("settings.sectionSpecific.chartType")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select chart type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bar">Bar Chart</SelectItem>
            <SelectItem value="line">Line Chart</SelectItem>
            <SelectItem value="pie">Pie Chart</SelectItem>
          </SelectContent>
        </Select>
 */}
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
          {nowPlayingData?.track ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {nowPlayingData?.track?.albumArt && (
                  <img
                    src={nowPlayingData?.track?.albumArt}
                    alt="Album Art"
                    className="h-20 w-20 rounded-md border-2 border-blue-400 shadow-md"
                  />
                )}
                <div>
                  <p className="text-2xl font-bold text-blue-300">
                    {nowPlayingData?.track?.title}
                  </p>
                  <p className="text-lg text-purple-200">
                    {nowPlayingData?.track?.artist}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-[auto,1fr] gap-x-4">
                <p className="text-gray-400">Album:</p>
                <p className="text-purple-200">
                  {nowPlayingData?.track?.album}
                </p>
                <p className="text-gray-400">Status:</p>
                <p
                  className={`font-semibold ${
                    nowPlayingData?.track?.isPlaying
                      ? "text-green-400"
                      : "text-yellow-400"
                  }`}
                >
                  {nowPlayingData?.track?.isPlaying ? "Playing" : "Paused"}
                </p>
                <p className="text-gray-400">Progress:</p>
                <p className="text-purple-200">
                  {formatTime(nowPlayingData?.track?.elapsed)} /{" "}
                  {formatTime(nowPlayingData?.track?.duration)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-300">Waiting for track data...</p>
          )}
        </div>
        <div
          className="preview mt-8 p-4"
          style={{
            backgroundColor: watch("settings.common.backgroundColor"),
            padding: `${watch("settings.common.padding")}px`,
            border: watch("settings.common.showBorders")
              ? "1px solid black"
              : "none",
            fontSize: `${watch("settings.sectionSpecific.fontSize")}px`,
          }}
        >
          <h3 className="text-lg font-semibold">Visualizer Preview</h3>
          <p>Chart Type: {watch("settings.sectionSpecific.chartType")}</p>
          <p>
            This is how your visualizer will look with the current settings.
          </p>
        </div>
        <button type="submit" className="btn btn-primary">
          Save Profile
        </button>
      </form>

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
    </FormProvider>
  );
}
