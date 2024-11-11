import React from "react";
import { useOverlayStore } from "@/store/overlayStore";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GradientColorPicker } from "@/components/GradientColorPicker";
import { useUser } from "@clerk/tanstack-start";
import { useNavigate } from "@tanstack/react-router";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "@/utils/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function OverlaySettings() {
  const { settings, updateSettings } = useOverlayStore();
  const { user } = useUser();
  const navigate = useNavigate();

  const publicUrl = user?.username
    ? `${window.location.origin}/${user.username}/overlay`
    : "";

  const handleCopyUrl = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl).then(() => {
        toast.success({
          title: "URL copied to clipboard",
          description: publicUrl,
        });
      });
    }
  };

  const handleViewPublic = () => {
    if (publicUrl) {
      window.open(publicUrl, "_blank");
    }
  };

  return (
    <div className="w-[300px] p-4 bg-card rounded-lg shadow-lg space-y-6">
      {/* Public URL Section */}
      <div className="space-y-4 pb-4 border-b">
        <h3 className="font-semibold">Public Overlay</h3>
        <div className="flex gap-2">
          <Input
            value={publicUrl}
            readOnly
            placeholder="Not available"
            className="flex-1"
          />
          <Button
            size="icon"
            variant="outline"
            onClick={handleCopyUrl}
            disabled={!publicUrl}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <Button
          className="w-full"
          onClick={handleViewPublic}
          disabled={!publicUrl}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          View Public Overlay
        </Button>
      </div>

      {/* Existing Settings */}
      <div>
        <h3 className="font-semibold mb-4">Canvas Settings</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Resolution</Label>
            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Width</Label>
                <Input
                  type="number"
                  value={settings.resolution.width}
                  onChange={(e) =>
                    updateSettings({
                      resolution: {
                        ...settings.resolution,
                        width: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Height</Label>
                <Input
                  type="number"
                  value={settings.resolution.height}
                  onChange={(e) =>
                    updateSettings({
                      resolution: {
                        ...settings.resolution,
                        height: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Background Color</Label>
            <GradientColorPicker
              color={settings.background}
              onChange={(color) => updateSettings({ background: color })}
              onChangeComplete={(color) =>
                updateSettings({ background: color })
              }
              currentProfile={null}
            />
          </div>

          <div className="space-y-2">
            <Label>Grid Size</Label>
            <Slider
              min={10}
              max={50}
              step={5}
              value={[settings.gridSize]}
              onValueChange={([value]) => updateSettings({ gridSize: value })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Show Grid</Label>
            <Switch
              checked={settings.showGrid}
              onCheckedChange={(checked) =>
                updateSettings({ showGrid: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Snap to Grid</Label>
            <Switch
              checked={settings.snapToGrid}
              onCheckedChange={(checked) =>
                updateSettings({ snapToGrid: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Theme</Label>
            <Select
              value={settings.theme}
              onValueChange={(value: "light" | "dark") =>
                updateSettings({ theme: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
