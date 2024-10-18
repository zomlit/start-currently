"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useUser } from "@clerk/tanstack-start";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Copy, Trash, Download, Upload, Edit2, Plus } from "lucide-react";

import { useSupabase } from "@/hooks/useSupabase";
import { Database } from "@/types/supabase";
import { WidgetType } from "@/types/Widget";
import { toast } from "@/utils/toast";
import { TooltipArrow } from "@radix-ui/react-tooltip";

// Define the WidgetControlsProps type
interface WidgetControlsProps {
  widgets: Record<string, any>;
  selectedWidget: WidgetType;
  setSelectedWidget: (widget: WidgetType) => void;
  selectedProfile: string;
  setSelectedProfile: (profile: string) => void;
  addProfile: (name: string, widget: WidgetType) => void;
  duplicateProfile: () => void;
  deleteProfile: () => void;
  handleProfileNameChange: (name: string) => void;
  exportConfig: () => void;
  importConfig: (event: React.ChangeEvent<HTMLInputElement>) => void;
  updateWidgetSettings: (
    widget: WidgetType,
    profile: string,
    settings: Record<string, any>
  ) => void;
}

const WidgetControls: React.FC<WidgetControlsProps> = ({
  widgets,
  selectedWidget,
  setSelectedWidget,
  selectedProfile,
  setSelectedProfile,
  addProfile,
  duplicateProfile,
  deleteProfile,
  handleProfileNameChange,
  exportConfig,
  importConfig,
  updateWidgetSettings,
}) => {
  const supabase = useSupabase();
  const { user } = useUser();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editingProfileName, setEditingProfileName] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileWidget, setNewProfileWidget] =
    useState<WidgetType>(selectedWidget);
  const [isEditPopoverOpen, setIsEditPopoverOpen] = useState(false);
  const [lastSelectedProfiles, setLastSelectedProfiles] = useState<
    Record<WidgetType, string>
  >({
    visualizer: "",
    chat: "",
    freeform: "",
    alerts: "",
    game_stats: "",
    game_overlay: "",
    gamepad: "",
    timer: "",
    configure: "",
  });

  // Add this new state for the public URL
  const [publicUrl, setPublicUrl] = useState("");

  useEffect(() => {
    // Update the last selected profile for the current widget
    setLastSelectedProfiles((prev) => ({
      ...prev,
      [selectedWidget]: selectedProfile,
    }));

    if (selectedProfile && user) {
      const url = `${process.env.NEXT_PUBLIC_APP_URL}/${user.username}/${selectedWidget}/${selectedProfile}`;
      setPublicUrl(url);
    }
  }, [selectedWidget, selectedProfile, user]);

  useEffect(() => {
    const channel = supabase
      .channel("profile_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Profiles" },
        handleRealtimeUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    // Update newProfileWidget when selectedWidget changes
    setNewProfileWidget(selectedWidget);
  }, [selectedWidget]);

  const handleWidgetChange = (newWidget: string) => {
    setSelectedWidget(newWidget as WidgetType);
    const newProfile =
      lastSelectedProfiles[newWidget as WidgetType] ||
      widgets[newWidget as WidgetType].profiles[0].id;
    setSelectedProfile(newProfile);
  };

  const handleProfileChange = (profileId: string) => {
    setSelectedProfile(profileId);
  };

  const renderActionButton = (
    action: () => void,
    icon: React.ReactNode,
    label: string,
    onAction: () => void,
    disabled = false
  ) => (
    <HoverCard openDelay={300} closeDelay={200}>
      <HoverCardTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8"
          onClick={onAction}
          disabled={disabled}
        >
          {icon}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent side="top" align="center" className="w-auto p-2">
        <p className="text-sm font-semibold">{label}</p>
      </HoverCardContent>
    </HoverCard>
  );

  const handleAddProfile = () => {
    addProfile(newProfileName, newProfileWidget);
    setIsAddDialogOpen(false);
    setNewProfileName("");
    // No need to reset newProfileWidget here as it will always match the selected tab
    toast.success({ title: "Profile added successfully" });
  };

  const handleDeleteProfile = () => {
    deleteProfile();
    setDeleteConfirmOpen(false);
    toast.success({ title: "Profile deleted successfully" });
  };

  const handleEditProfileName = () => {
    handleProfileNameChange(editingProfileName);
    setEditingProfileName("");
    setIsEditPopoverOpen(false);
  };

  const handleDuplicateProfile = () => {
    duplicateProfile();
    toast.success({ title: "Profile duplicated successfully" });
  };

  const handleRealtimeUpdate = (payload: any) => {};

  const handleCopyPublicUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success({ title: "Public URL copied to clipboard" });
    } catch (err) {
      console.error("Failed to copy URL: ", err);
      toast.error({ title: "Failed to copy URL" });
    }
  };

  const handleUrlInputFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  // Move the getWidgetDisplayName function inside the component
  const getWidgetDisplayName = (widgetType: WidgetType): string => {
    switch (widgetType) {
      case "visualizer":
        return "Visualizer";
      case "chat":
        return "Chat";
      case "freeform":
        return "Freeform";
      // Add cases for other widget types as needed
      default:
        return widgetType;
    }
  };

  return (
    <>
      <Tabs
        value={selectedWidget}
        onValueChange={(value) => handleWidgetChange(value as WidgetType)}
        className="mb-4"
      >
        <TabsList className="w-full rounded-lg p-1 bg-gray-100 dark:bg-gray-800">
          {Object.entries(widgets).map(([widgetType, widget]) => (
            <TabsTrigger
              key={widgetType}
              value={widgetType as WidgetType}
              className="flex-1 rounded py-2 transition-all text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-black dark:data-[state=active]:text-white"
            >
              {getWidgetDisplayName(widgetType as WidgetType)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <Card className="rounded-none border-0">
        <CardContent className="my-6 p-0">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col items-start space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0 md:space-x-2">
              <Select
                value={selectedProfile}
                onValueChange={handleProfileChange}
              >
                <SelectTrigger
                  id="profile"
                  className="w-full border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-primary-500 dark:focus:ring-primary-400 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400 sm:w-[200px]"
                >
                  <SelectValue placeholder="Select a profile" />
                </SelectTrigger>
                <SelectContent>
                  {widgets[selectedWidget].profiles.map(
                    (profile: { id: string; name: string }) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.name}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <div className="flex w-full flex-grow items-center space-x-0 sm:w-auto">
                <Input
                  value={publicUrl}
                  readOnly
                  className="flex-grow rounded-r-none border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400"
                  placeholder="Public URL"
                  onFocus={handleUrlInputFocus}
                />
                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleCopyPublicUrl}
                        size="icon"
                        variant="ghost"
                        className="!mr-4 rounded-l-none bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      align="center"
                      side="top"
                      arrowPadding={8}
                    >
                      <TooltipArrow className="fill-white dark:fill-gray-800" />
                      <p className="text-gray-900 dark:text-gray-100">
                        Copy public URL
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex flex-wrap justify-end gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => setIsAddDialogOpen(true)}
                        size="icon"
                        variant="ghost"
                        className="text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add new profile</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleDuplicateProfile}
                        size="icon"
                        variant="ghost"
                        className="text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Duplicate profile</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => setDeleteConfirmOpen(true)}
                        size="icon"
                        variant="ghost"
                        className="text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                        disabled={widgets[selectedWidget].profiles.length <= 1}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete profile</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Popover
                  open={isEditPopoverOpen}
                  onOpenChange={setIsEditPopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => {
                        const currentProfile = widgets[
                          selectedWidget
                        ].profiles.find(
                          (p: { id: string; name: string }) =>
                            p.id === selectedProfile
                        );
                        setEditingProfileName(
                          currentProfile ? currentProfile.name : ""
                        );
                        setIsEditPopoverOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleEditProfileName();
                        setIsEditPopoverOpen(false);
                      }}
                    >
                      <div className="space-y-2">
                        <h4 className="font-medium">Edit Profile Name</h4>
                        <Input
                          value={editingProfileName}
                          onChange={(e) =>
                            setEditingProfileName(e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleEditProfileName();
                              setIsEditPopoverOpen(false);
                            }
                          }}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setIsEditPopoverOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" size="sm">
                            Save
                          </Button>
                        </div>
                      </div>
                    </form>
                  </PopoverContent>
                </Popover>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={exportConfig}
                        size="icon"
                        variant="ghost"
                        className="text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Export configuration</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() =>
                          document.getElementById("import-config")?.click()
                        }
                        size="icon"
                        variant="ghost"
                        className="text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Import configuration</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <input
                  id="import-config"
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={importConfig}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Profile Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Profile</DialogTitle>
          </DialogHeader>
          <div className="">
            <Input
              placeholder="Profile Name"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
            />
            <Select
              value={newProfileWidget}
              onValueChange={(value) =>
                setNewProfileWidget(value as WidgetType)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Widget Type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(widgets).map(([widgetType, widget]) => (
                  <SelectItem key={widgetType} value={widgetType as WidgetType}>
                    {getWidgetDisplayName(widgetType as WidgetType)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProfile}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to delete this profile?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              selected profile. profile.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProfile}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WidgetControls;
