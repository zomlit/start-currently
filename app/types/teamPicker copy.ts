export interface Player {
  id: string;
  name: string;
  color: string;
  rank: string;
  abbreviatedRank: string;
  iconUrl: string;
  ratingValue?: number;
  ratingDisplayValue?: string;
  peakRank?: string;
  peakIconUrl?: string;
  peakRankFull?: string;
  peakRatingValue?: number;
  peakRatingDisplayValue?: string;
}

export interface Captain {
  id: string;
  name: string;
  players: Player[];
}

export interface Match {
  team1: Player | null;
  team2: Player | null;
  winner?: Player | null;
}

export type Bracket = Match[][];
export type LosersBracket = Match[][];