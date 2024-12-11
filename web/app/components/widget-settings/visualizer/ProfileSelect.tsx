import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { VisualizerProfile } from "@/schemas/visualizer";
import { useVisualizerStore } from "@/store/visualizerStore";

interface ProfileSelectProps {
  profiles: VisualizerProfile[] | undefined;
}

export function ProfileSelect({ profiles }: ProfileSelectProps) {
  const { selectedProfileId, setSelectedProfileId } = useVisualizerStore();

  if (!Array.isArray(profiles) || profiles.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger className="w-[200px]">
          <SelectValue>No profiles available</SelectValue>
        </SelectTrigger>
      </Select>
    );
  }

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);
  const selectedProfileName =
    selectedProfile?.settings.name || "Select a profile";

  return (
    <Select
      value={selectedProfileId || undefined}
      onValueChange={setSelectedProfileId}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue>{selectedProfileName}</SelectValue>
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
