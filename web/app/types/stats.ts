export interface StatsSettings {
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  padding: number;
  showBorders: boolean;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  opacity: number;
}

export const defaultStatsSettings: StatsSettings = {
  backgroundColor: "#000000",
  textColor: "#ffffff",
  fontSize: 16,
  fontFamily: "Inter",
  padding: 16,
  showBorders: true,
  borderColor: "#ffffff",
  borderWidth: 1,
  borderRadius: 8,
  opacity: 100,
};
