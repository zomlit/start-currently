import React, {
  useCallback,
  useRef,
  useEffect,
  useState,
  useMemo,
} from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "../ui/form";
import { Switch } from "../ui/switch";
import { Slider } from "../ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import GradientColorPicker from "../GradientColorPicker";
import { cn } from "@/lib/utils";
import Tiptap from "../Tiptap";
import { useAudioVisualizer } from "@/hooks/useAudioVisualizer";
import MicrophoneSelect from "@/components/MicrophoneSelect";
import VisualizerOptions from "./VisualizerOptions";
import {
  WidgetType,
  WidgetProfile,
  ProfileSettings,
  WidgetSettings,
} from "@/types";
import { UseFormReturn } from "react-hook-form";

interface WidgetOptionsProps {
  form: UseFormReturn<WidgetSettings, any, undefined>;
  currentProfile: WidgetProfile;
  handleProfileChange: (
    settingType: keyof ProfileSettings,
    updates: Partial<ProfileSettings[keyof ProfileSettings]>
  ) => void;
  selectedWidget: WidgetType;
  colorSyncEnabled: boolean;
  palette: any; // You might want to define a more specific type for palette
  optimisticProfileSettings: ProfileSettings;
  updateProfileSetting: (
    settingType: keyof ProfileSettings,
    fieldName: string,
    value: any
  ) => void;
}

const WidgetOptions: React.FC<WidgetOptionsProps> = ({
  form,
  currentProfile,
  handleProfileChange,
  selectedWidget,
  colorSyncEnabled,
  palette,
  optimisticProfileSettings,
  updateProfileSetting,
}) => {
  const audioMotionRef = useRef(null);
  const [localSettings, setLocalSettings] = useState(
    currentProfile.settings.specificSettings
  );
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});

  const memoizedLocalSettings = useMemo(() => localSettings, [localSettings]);
  const audioVisualizer = useAudioVisualizer(
    memoizedLocalSettings,
    currentProfile.track,
    palette
  );

  const handleChange = useCallback(
    (name: string, value: any) => {
      setPendingChanges((prev) => ({ ...prev, [name]: value }));
      updateProfileSetting("specificSettings", name, value);
    },
    [updateProfileSetting]
  );

  useEffect(() => {
    if (Object.keys(pendingChanges).length > 0) {
      setLocalSettings((prev) => {
        const newSettings = { ...prev, ...pendingChanges };
        handleProfileChange("specificSettings", pendingChanges);
        return newSettings;
      });
      setPendingChanges({});
    }
  }, [pendingChanges, handleProfileChange]);

  useEffect(() => {
    setLocalSettings(currentProfile.settings.specificSettings);
  }, [currentProfile.settings.specificSettings]);

  const renderMusicPlayerOptions = () => (
    <div>
      <FormField
        control={form.control}
        name="specificSettings.hideOnDisabled"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-gradient/15">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Hide on Disabled</FormLabel>
              <FormDescription>
                Hide the widget when the music is paused.
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  handleChange("hideOnDisabled", checked);
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="specificSettings.micEnabled"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-gradient/15">
            <div className="space-y-0.5">
              <FormLabel className="text-base">
                Enable Audio Spectrum Analyzer
              </FormLabel>
              <FormDescription>
                Visualize the audio from your selected audio source
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={(value) => {
                  field.onChange(value);
                  handleChange("micEnabled", value);
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="specificSettings.progressBarForegroundColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Progress Foreground</FormLabel>
              <FormControl>
                <GradientColorPicker
                  color={field.value}
                  onChange={(color) => {
                    field.onChange(color);
                    handleChange("progressBarForegroundColor", color);
                  }}
                  onChangeComplete={(color) => {
                    field.onChange(color);
                    handleChange("progressBarForegroundColor", color);
                  }}
                  currentProfile={currentProfile}
                  disabled={colorSyncEnabled}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specificSettings.progressBarBackgroundColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Progress Background</FormLabel>
              <FormControl>
                <GradientColorPicker
                  color={field.value}
                  onChange={(color) => {
                    field.onChange(color);
                    handleChange("progressBarBackgroundColor", color);
                  }}
                  onChangeComplete={(color) => {
                    field.onChange(color);
                    handleChange("progressBarBackgroundColor", color);
                  }}
                  currentProfile={currentProfile}
                  disabled={colorSyncEnabled}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {localSettings.micEnabled && (
        <VisualizerOptions
          form={form}
          currentProfile={currentProfile}
          handleProfileChange={handleProfileChange}
          colorSyncEnabled={colorSyncEnabled}
          localSettings={localSettings}
          setLocalSettings={setLocalSettings}
          palette={palette}
        />
      )}

      <FormField
        control={form.control}
        name="specificSettings.pauseEnabled"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-gradient/15">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Pause Overlay</FormLabel>
              <FormDescription>
                Show an overlay when music is paused
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  handleChange("pauseEnabled", checked);
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="specificSettings.showAlbumArt"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-gradient/15">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Show Album Art</FormLabel>
              <FormDescription>
                Display album art in the visualizer.
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  handleChange("showAlbumArt", checked);
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="specificSettings.canvasEnabled"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-gradient/15">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Enable Canvas</FormLabel>
              <FormDescription>
                Display the Canvas Video over the album art.
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  handleChange("canvasEnabled", checked);
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <div ref={audioMotionRef} className="h-64 w-full" />
    </div>
  );

  const renderLiveChatOptions = () => <div>{/* Live Chat options */}</div>;

  const renderFreeformOptions = () => <div>{/* Freeform options */}</div>;

  switch (selectedWidget) {
    case "visualizer":
      return renderMusicPlayerOptions();
    case "chat":
      return renderLiveChatOptions();
    case "freeform":
      return renderFreeformOptions();
    default:
      return null;
  }
};

export default WidgetOptions;
