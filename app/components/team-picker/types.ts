import type { Player, Captain, ThemePreset, PickerMode } from '@/types/team-picker';

export interface SavedBracket {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  data: {
    players: Player[];
    teams: Captain[];
    settings: {
      numTeams: number;
      teamSize: number;
      showRanks: boolean;
      showTeamLogos: boolean;
      currentTheme: ThemePreset;
      mode: PickerMode;
    };
  };
} 