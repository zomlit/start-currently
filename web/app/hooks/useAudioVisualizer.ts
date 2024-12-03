import { useCallback, useEffect, useState } from "react";
import AudioMotionAnalyzer from "audiomotion-analyzer";
import { rgbaToString } from "@/utils/index";

// Define default values for gradient colors
const defaultGradientStart = { r: 255, g: 0, b: 0, a: 1 }; // Red
const defaultGradientEnd = { r: 0, g: 0, b: 255, a: 1 }; // Blue

interface CustomizationState {
  matchArtworkColors?: boolean;
  userGradientStart?: { r: number; g: number; b: number; a: number };
  userGradientEnd?: { r: number; g: number; b: number; a: number };
  mode?: number;
  gradient?: string;
  mirror?: string;
  barSpace?: string;
  ledBars?: boolean;
  lumiBars?: boolean;
  lineWidth?: number;
  fillAlpha?: number;
  showPeaks?: boolean;
  splitGradient?: boolean;
  alphaBars?: boolean;
  reflexRatio?: string;
  reflexAlpha?: number;
  reflexBright?: number;
  micEnabled?: boolean;
  selectedMicId?: string;
}

interface AlbumColors {
  darkVibrant?: string;
  lightVibrant?: string;
}

export const useAudioVisualizer = (
  customizationState: CustomizationState = {},
  track: any,
  albumColors: AlbumColors = {},
) => {
  const [audioMotionInstance, setAudioMotionInstance] = useState<AudioMotionAnalyzer | null>(null);

  const audioMotionRef = useCallback(
    (node: HTMLElement | null) => {
      if (node !== null && !node.audioMotion) {
        const instance = new AudioMotionAnalyzer(node, {
          overlay: true,
          showBgColor: false,
          showScaleX: false,
        });
        (node as any).audioMotion = instance;

        setAudioMotionInstance(instance);
        instance.registerGradient("Custom", {
          bgColor: "transparent",
          colorStops: [
            {
              color: customizationState.matchArtworkColors
                ? albumColors.darkVibrant || rgbaToString(defaultGradientStart)
                : rgbaToString(customizationState.userGradientStart || defaultGradientStart),
              pos: 0,
            },
            {
              color: customizationState.matchArtworkColors
                ? albumColors.lightVibrant || rgbaToString(defaultGradientEnd)
                : rgbaToString(customizationState.userGradientEnd || defaultGradientEnd),
              pos: 1,
            },
          ],
        });
        instance.setOptions({
          mode: 10,
          gradient: "Custom",
        });
      }
    },
    [customizationState, albumColors],
  );

  useEffect(() => {
    if (audioMotionInstance) {
      let gradientToUse = customizationState.gradient || "rainbow";

      const applyGradient = (gradientName: string, startColor: string, endColor: string) => {
        audioMotionInstance.registerGradient(gradientName, {
          bgColor: "transparent",
          colorStops: [
            { color: startColor, pos: 0 },
            { color: endColor, pos: 1 },
          ],
        });
        audioMotionInstance.setOptions({ gradient: gradientName });
      };

      if (gradientToUse === "custom") {
        const startColor = rgbaToString(
          customizationState.userGradientStart || defaultGradientStart,
        );
        const endColor = rgbaToString(customizationState.userGradientEnd || defaultGradientEnd);
        applyGradient("custom", startColor, endColor);
      } else if (gradientToUse === "Color Sync") {
        const startColor = albumColors.lightVibrant || rgbaToString(defaultGradientStart);
        const endColor = albumColors.darkVibrant || rgbaToString(defaultGradientEnd);
        applyGradient("ColorSync", startColor, endColor);
      } else {
        // For predefined gradients (rainbow, classic, prism)
        audioMotionInstance.setOptions({ gradient: gradientToUse });
      }
    }
  }, [
    audioMotionInstance,
    customizationState.gradient,
    customizationState.userGradientStart,
    customizationState.userGradientEnd,
    albumColors,
  ]);

  useEffect(() => {
    if (audioMotionInstance) {
      const options: Partial<AudioMotionAnalyzer["options"]> = {
        mode: customizationState.mode,
        mirror: customizationState.mirror ? parseInt(customizationState.mirror) : undefined,
        barSpace: customizationState.barSpace ? parseFloat(customizationState.barSpace) : undefined,
        ledBars: customizationState.ledBars,
        lumiBars: customizationState.lumiBars,
        lineWidth: customizationState.lineWidth,
        fillAlpha: customizationState.fillAlpha,
        showPeaks: customizationState.showPeaks,
        splitGradient: customizationState.splitGradient,
        alphaBars: customizationState.alphaBars,
        reflexRatio: customizationState.reflexRatio
          ? parseFloat(customizationState.reflexRatio)
          : undefined,
        reflexAlpha: customizationState.reflexAlpha,
        reflexBright: customizationState.reflexBright,
      };

      audioMotionInstance.setOptions(options);
    }
  }, [customizationState, audioMotionInstance]);

  useEffect(() => {
    const toggleMic = async () => {
      if (audioMotionInstance && customizationState.micEnabled) {
        try {
          const constraints = customizationState.selectedMicId
            ? {
                audio: {
                  deviceId: { exact: customizationState.selectedMicId },
                },
              }
            : { audio: true };

          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          const micStreamRef = audioMotionInstance.audioCtx.createMediaStreamSource(stream);
          audioMotionInstance.connectInput(micStreamRef);
          audioMotionInstance.volume = 0;
        } catch (err) {
          console.error("Microphone access was denied or failed", err);
        }
      } else if (audioMotionInstance && customizationState.micEnabled === false) {
        audioMotionInstance.disconnectInput();
      }
    };

    toggleMic();

    return () => {
      if (audioMotionInstance) {
        audioMotionInstance.disconnectInput();
      }
    };
  }, [audioMotionInstance, customizationState.micEnabled, customizationState.selectedMicId]);

  return audioMotionRef;
};
