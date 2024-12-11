// import type { VisualizerSettings } from "@/schemas/visualizer";
// import { SettingsForm } from "./SettingsForm";
// import { useEffect, useCallback } from "react";

// interface VisualizerSettingsFormProps {
//   settings: VisualizerSettings;
//   onSettingsChange: (settings: Partial<VisualizerSettings>) => Promise<void>;
//   isLoading?: boolean;
// }

// export function VisualizerSettingsForm({
//   settings,
//   onSettingsChange,
//   isLoading,
// }: VisualizerSettingsFormProps) {
//   const methods = useForm<VisualizerSettings>({
//     defaultValues: settings,
//     mode: "onChange",
//   });

//   const handleSettingChange = useCallback(
//     (key: keyof VisualizerSettings, value: any) => {
//       console.log("🔄 Setting Change:", { key, value });
//       try {
//         // Update form state
//         methods.setValue(key, value, { shouldDirty: true });

//         // Update parent
//         const updatedSettings = { [key]: value };
//         console.log("📤 Updating Settings:", updatedSettings);
//         onSettingsChange(updatedSettings).catch((error) => {
//           console.error("❌ Error in handleSettingChange:", error);
//         });
//       } catch (error) {
//         console.error("❌ Error in handleSettingChange:", error);
//       }
//     },
//     [methods, onSettingsChange]
//   );

//   // Log form state changes
//   useEffect(() => {
//     const subscription = methods.watch((value) => {
//       console.log("📊 Form State Updated:", value);
//     });
//     return () => subscription.unsubscribe();
//   }, [methods]);

//   return (
//     <FormProvider {...methods}>
//       <form className="space-y-6">
//         <SettingsForm
//           handleSettingChange={handleSettingChange}
//           handleSettingCommit={handleSettingChange}
//           currentProfile={settings}
//           colorSyncEnabled={false}
//         />
//       </form>
//     </FormProvider>
//   );
// }
