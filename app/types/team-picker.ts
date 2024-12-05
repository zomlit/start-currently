import { ReactNode } from 'react';
import type { BracketData } from '../components/team-picker/brackets-section';

export interface Player {
  id: string;
  name: string;
  backgroundColor: string;
  borderColor: string;
  rank: string;
  abbreviatedRank: string;
  iconUrl: string;
  isCaptain: boolean;
}

export interface Captain {
  id: string;
  name: string;
  players: Player[];
  teamNumber?: string;
}

export interface Match {
  team1: Team;
  team2: Team;
  winner?: Team;
}

export interface Team extends Omit<Player, 'color'> {
  score?: number;
  isBye?: boolean;
  disqualified?: boolean;
}

export interface TeamPickerProps {
  initialState?: TeamPickerState | null;
  isSharedView?: boolean;
}

export interface TeamPickerState {
  captains: Captain[];
  players: Player[];
  teamSize: number;
  bracket: Match[][];
  numCaptains: number;
  showLosersBracket: boolean;
  losersBracket: Match[][];
  selectedGameMode: string;
  isOnlineMode: boolean;
}

export interface ScoreUpdateInfo {
  roundIndex: number;
  matchIndex: number;
  isLosersBracket: boolean;
}

export interface EditingPlayer {
  id: string;
  name: string;
}

export interface EditingTeam {
  id: string;
  name: string;
}

export interface NextSlot {
  matchIndex: number;
  isFirstTeam: boolean;
}

export interface RankData {
  rank: string;
  abbreviatedRank: string;
  iconUrl: string;
  ratingValue?: number;
  ratingDisplayValue?: string;
  peakRank?: string | null;
  peakIconUrl?: string | null;
  peakRankFull?: string | null;
  peakRatingValue?: number | null;
  peakRatingDisplayValue?: string | null;
}

export interface APIResponse {
  segments: {
    metadata: {
      name: string;
    };
    stats: {
      tier?: {
        metadata: {
          name: string;
          iconUrl: string;
        };
      };
      division?: {
        metadata: {
          name: string;
        };
      };
      rating?: {
        value: number;
        displayValue: string;
      };
      peakRating?: {
        metadata: {
          name: string;
          division?: string;
          iconUrl: string;
        };
        value: number;
        displayValue: string;
      };
    };
    type?: string;
  }[];
}

export interface UserResponseCache {
  [username: string]: APIResponse;
}

export interface ColorTheme {
  name: string;
  description: string;
  generateColors: () => {
    background: string;
    border: string;
  };
}

export type ThemePreset = 'default' | 'dark' | 'light';

export type PickerMode = 'draft' | 'standard' | 'custom';

export interface SavedBracket {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  data: {
    teams: Captain[];
    players: Player[];
    settings: {
      mode: PickerMode;
      numTeams: number;
      teamSize: number;
      showRanks: boolean;
      showTeamLogos: boolean;
      currentTheme: ThemePreset;
    };
    bracket_data?: BracketData | null;
  };
  bracket_data: BracketData | null;
} 