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
import { api } from "@/lib/api";

const profileSchema = z.object({
  id: z.string().optional(),
  section_id: z.string(),
  settings: z.object({
    name: z.string().min(1, "Profile name is required"),
    isDefault: z.boolean().default(false),
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

export const Route = createFileRoute("/_app/sections/visualizer")({
  component: VisualizerSection,
});

function VisualizerSection() {
  const { userId, getToken, isLoaded } = useAuth();
  const queryClient = useQueryClient();
  const [selectedProfileId, setSelectedProfileId] = React.useState<
    string | null
  >(null);

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

  const mutation = useMutation({
    mutationFn: async (newProfile: Profile) => {
      const token = await getToken({ template: "lstio" });
      if (!token) throw new Error("No token available");
      if (newProfile.id) {
        return api.profiles.update(newProfile, token);
      } else {
        return api.profiles.createDefault(
          "visualizer",
          userId!,
          newProfile.settings,
          token
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles", "visualizer"] });
    },
  });

  const copyMutation = useMutation({
    mutationFn: async (profileToCopy: Profile) => {
      const token = await getToken({ template: "lstio" });
      if (!token) throw new Error("No token available");
      return api.profiles.copy(profileToCopy, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles", "visualizer"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (profileId: string) => {
      const token = await getToken({ template: "lstio" });
      if (!token) throw new Error("No token available");
      return api.profiles.delete(profileId, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles", "visualizer"] });
      if (profiles && profiles.length > 1) {
        setSelectedProfileId(profiles[0].id);
      }
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
      const token = await getToken({ template: "lstio" });
      if (!token) throw new Error("No token available");
      await api.profiles.setDefault(selectedProfileId, token);
      queryClient.invalidateQueries({ queryKey: ["profiles", "visualizer"] });
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

  const createDefaultProfile = async () => {
    if (!userId) return;
    const token = await getToken({ template: "lstio" });
    mutation.mutate(
      {
        section_id: "visualizer",
        settings: {
          name: "Default Profile",
          isDefault: true,
          common: {
            backgroundColor: "#ffffff",
            padding: 10,
            showBorders: false,
          },
          sectionSpecific: { fontSize: 16, chartType: "bar" },
        },
      },
      {
        onSuccess: (data) => {
          console.log("Default profile created:", data);
          queryClient.invalidateQueries({
            queryKey: ["profiles", "visualizer"],
          });
        },
        onError: (error) => {
          console.error("Error creating default profile:", error);
        },
      }
    );
  };

  if (!isLoaded || isProfilesLoading) {
    return <div>Loading...</div>;
  }

  if (!userId) {
    return <div>Please sign in to access this section.</div>;
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

  if (!profiles || profiles.length === 0) {
    return (
      <div>
        <p>No profiles found. Please create a profile.</p>
        <Button onClick={createDefaultProfile}>Create Default Profile</Button>
      </div>
    );
  }

  // Render the form only when all data is available
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
          <Button
            onClick={handleSetDefault}
            disabled={profile?.settings.isDefault}
          >
            Set as Default
          </Button>
          <Button onClick={handleCopyProfile} className="btn btn-secondary">
            Copy Profile
          </Button>
          <Button
            onClick={handleDeleteProfile}
            className="btn btn-danger"
            disabled={profiles?.length <= 1}
          >
            Delete Profile
          </Button>
        </div>

        <Input
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
    </FormProvider>
  );
}
