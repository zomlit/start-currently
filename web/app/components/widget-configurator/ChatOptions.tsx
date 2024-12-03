import React from "react";
import { FormField, FormItem, FormLabel, FormControl } from "../ui/form";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ProfileSettings } from "@/types"; // Add this import

interface ChatOptionsProps {
  form: UseFormReturn<WidgetSettings, any, undefined>;
  currentProfile: WidgetProfile;
  handleProfileChange: (
    settingType: keyof ProfileSettings,
    updates: Partial<ProfileSettings[keyof ProfileSettings]>,
  ) => void;
  optimisticProfileSettings: ProfileSettings;
  updateProfileSetting: (settingType: keyof ProfileSettings, fieldName: string, value: any) => void;
}

const ChatOptions: React.FC<ChatOptionsProps> = ({
  form,
  currentProfile,
  handleProfileChange,
  optimisticProfileSettings,
  updateProfileSetting,
}) => {
  const specificSettings = currentProfile.settings.specificSettings;

  return (
    <>
      <div className="flex items-center space-x-2">
        <Switch
          id="show-user-avatar"
          checked={specificSettings.showUserAvatar}
          onCheckedChange={(checked) =>
            handleProfileChange("specificSettings", {
              showUserAvatar: checked,
            })
          }
        />
        <Label htmlFor="show-user-avatar">Show User Avatar</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="show-timestamp"
          checked={specificSettings.showTimestamp}
          onCheckedChange={(checked) =>
            handleProfileChange("specificSettings", {
              showTimestamp: checked,
            })
          }
        />
        <Label htmlFor="show-timestamp">Show Timestamp</Label>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message-limit">Message Limit</Label>
        <Input
          id="message-limit"
          type="number"
          value={specificSettings.messageLimit}
          onChange={(e) =>
            handleProfileChange("specificSettings", {
              messageLimit: parseInt(e.target.value),
            })
          }
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="notifications"
          checked={specificSettings.notifications}
          onCheckedChange={(checked) =>
            handleProfileChange("specificSettings", {
              notifications: checked,
            })
          }
        />
        <Label htmlFor="notifications">Enable Notifications</Label>
      </div>
    </>
  );
};

export default ChatOptions;
