import { Button } from "@/components/ui/button";
import { Plus, Copy, Trash } from "lucide-react";
import type { VisualizerProfile } from "@/types/visualizer";

interface ProfileActionsProps {
  profile: VisualizerProfile;
  profiles: VisualizerProfile[];
  onAddNew: () => void;
}

export function ProfileActions({
  profile,
  profiles,
  onAddNew,
}: ProfileActionsProps) {
  return (
    <div className="flex space-x-2">
      <Button onClick={onAddNew} size="icon" variant="outline">
        <Plus className="h-4 w-4" />
      </Button>
      <Button onClick={() => {}} size="icon" variant="outline">
        <Copy className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => {}}
        size="icon"
        variant="outline"
        disabled={profiles.length <= 1}
      >
        <Trash className="h-4 w-4" />
      </Button>
      <Button disabled={profile.settings.isDefault}>Set as Default</Button>
    </div>
  );
}
