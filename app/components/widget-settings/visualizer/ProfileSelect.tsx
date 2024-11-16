import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { VisualizerProfile } from "@/types/visualizer";
import { useVisualizerStore } from "@/store/visualizerStore";

interface ProfileSelectProps {
  profiles: VisualizerProfile[];
}

export function ProfileSelect({ profiles }: ProfileSelectProps) {
  const { selectedProfileId, setSelectedProfileId } = useVisualizerStore();

  return (
    <Select
      value={selectedProfileId || undefined}
      onValueChange={setSelectedProfileId}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select a profile" />
      </SelectTrigger>
      <SelectContent>
        {profiles.map((profile) => (
          <SelectItem key={profile.id} value={profile.id}>
            {profile.settings.name}
            {profile.settings.isDefault && " (Default)"}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
