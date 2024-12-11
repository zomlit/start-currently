export function cleanVisualizerSettings(settings: any) {
  // Create a clean settings object with the correct structure
  const cleanSettings = {
    user_id: settings.user_id,
    type: "visualizer",
    sensitivity: 1.0,
    colorScheme: "default",
    visualizer_settings: {
      commonSettings: {
        backgroundColor:
          settings.visualizer_settings?.commonSettings?.backgroundColor ||
          "#000000",
        padding: settings.visualizer_settings?.commonSettings?.padding || 20,
        showBorders:
          settings.visualizer_settings?.commonSettings?.showBorders || false,
        fontFamily:
          settings.visualizer_settings?.commonSettings?.fontFamily ||
          "Sofia Sans Condensed",
        fontSize: settings.visualizer_settings?.commonSettings?.fontSize || 16,
        textColor:
          settings.visualizer_settings?.commonSettings?.textColor || "#ffffff",
        borderColor:
          settings.visualizer_settings?.commonSettings?.borderColor ||
          "#ffffff",
        borderWidth:
          settings.visualizer_settings?.commonSettings?.borderWidth || 0,
        borderRadius:
          settings.visualizer_settings?.commonSettings?.borderRadius || 8,
        lineHeight:
          settings.visualizer_settings?.commonSettings?.lineHeight || 1.8,
        letterSpacing:
          settings.visualizer_settings?.commonSettings?.letterSpacing || 0,
        textAlign:
          settings.visualizer_settings?.commonSettings?.textAlign || "left",
        gap: settings.visualizer_settings?.commonSettings?.gap || 2,
        colorSync:
          settings.visualizer_settings?.commonSettings?.colorSync ?? false,
      },
      visualSettings: {
        chartType:
          settings.visualizer_settings?.visualSettings?.chartType || "bar",
        barWidth: settings.visualizer_settings?.visualSettings?.barWidth || 2,
        barSpacing:
          settings.visualizer_settings?.visualSettings?.barSpacing || 1,
        barColor:
          settings.visualizer_settings?.visualSettings?.barColor || "#ffffff",
        smoothing:
          settings.visualizer_settings?.visualSettings?.smoothing || 0.5,
        sensitivity:
          settings.visualizer_settings?.visualSettings?.sensitivity || 1,
        colorSync:
          settings.visualizer_settings?.visualSettings?.colorSync ?? true,
        canvasEnabled:
          settings.visualizer_settings?.visualSettings?.canvasEnabled ?? true,
        micEnabled:
          settings.visualizer_settings?.visualSettings?.micEnabled ?? false,
        mode: settings.visualizer_settings?.visualSettings?.mode || 0,
        backgroundOpacity:
          settings.visualizer_settings?.visualSettings?.backgroundOpacity ||
          0.6,
        albumCanvas:
          settings.visualizer_settings?.visualSettings?.albumCanvas ?? true,
        backgroundCanvas:
          settings.visualizer_settings?.visualSettings?.backgroundCanvas ??
          false,
        backgroundCanvasOpacity:
          settings.visualizer_settings?.visualSettings
            ?.backgroundCanvasOpacity || 0.2,
        pauseEnabled:
          settings.visualizer_settings?.visualSettings?.pauseEnabled ?? true,
        hideOnDisabled:
          settings.visualizer_settings?.visualSettings?.hideOnDisabled ?? false,
        mirror: settings.visualizer_settings?.visualSettings?.mirror || 0,
        barSpace: settings.visualizer_settings?.visualSettings?.barSpace || 0,
        progressBarBackgroundColor:
          settings.visualizer_settings?.visualSettings
            ?.progressBarBackgroundColor || "#333333",
        progressBarForegroundColor:
          settings.visualizer_settings?.visualSettings
            ?.progressBarForegroundColor || "#ffffff",
      },
    },
  };

  return cleanSettings;
}
