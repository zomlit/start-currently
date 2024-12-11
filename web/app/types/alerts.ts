export interface AlertsSettings {
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
  animationDuration: number;
  soundEnabled: boolean;
  soundVolume: number;
}

export const defaultAlertsSettings: AlertsSettings = {
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
  animationDuration: 3000,
  soundEnabled: true,
  soundVolume: 50,
};
