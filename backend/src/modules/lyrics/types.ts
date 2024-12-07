export interface LyricsSettings {
  backgroundColor: string;
  textColor: string;
  currentTextColor: string;
  fontSize: number;
  padding: number;
  currentLineScale: number;
  showFade: boolean;
  fadeDistance: number;
  lineHeight: number;
  fontFamily: string;
  greenScreenMode: boolean;
  colorSync: boolean;
  showVideoCanvas: boolean;
  videoCanvasOpacity: number;
  textAlign: "left" | "center" | "right";
  textShadowColor: string;
  textShadowBlur: number;
  textShadowOffsetX: number;
  textShadowOffsetY: number;
  animationEasing: string;
  animationSpeed: number;
  glowEffect: boolean;
  glowColor: string;
  glowIntensity: number;
  hideExplicitContent: boolean;
  animationStyle: "scale" | "glow" | "slide" | "fade" | "bounce";
  margin: number;
}
