import { useCallback, useState, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { useDebouncedCallback } from "use-debounce";
import { toast } from "@/utils/toast";
import { z } from "zod";

interface UseSettingsFormProps<T> {
  form: UseFormReturn<T>;
  settings: T;
  onSettingsChange: (settings: T) => Promise<void>;
  onPreviewUpdate: (settings: T) => void;
  schema: z.ZodType<T>;
  defaultSettings: T;
}

export function useSettingsForm<T>({
  form,
  settings,
  onSettingsChange,
  onPreviewUpdate,
  schema,
  defaultSettings,
}: UseSettingsFormProps<T>) {
  const dialogRef = useRef<HTMLButtonElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [changingField, setChangingField] = useState<string>("");
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  // Handle debounced settings changes
  const debouncedSettingsChange = useDebouncedCallback(
    async (updatedSettings: T, fieldName: string) => {
      try {
        setIsSaving(true);
        setChangingField(fieldName);
        await onSettingsChange(updatedSettings);
        setLastSaved(new Date());
        setHasPendingChanges(false);
      } catch (error) {
        console.error("Error saving settings:", error);
        setHasPendingChanges(true);
        toast.error({
          title: "Error saving settings",
          description: "Your changes couldn't be saved. Please try again.",
        });
      } finally {
        setIsSaving(false);
        setChangingField("");
      }
    },
    500
  );

  const handleSettingChange = useCallback(
    async (field: string, value: any) => {
      try {
        // Update form state
        form.setValue(field, value, {
          shouldDirty: true,
          shouldTouch: true,
        });

        // Create updated settings by handling nested paths
        const updateNestedValue = (
          obj: any,
          path: string[],
          value: any
        ): any => {
          const [current, ...rest] = path;
          if (rest.length === 0) {
            return { ...obj, [current]: value };
          }
          return {
            ...obj,
            [current]: updateNestedValue(obj[current], rest, value),
          };
        };

        const pathParts = field.split(".");
        const updatedSettings = updateNestedValue(settings, pathParts, value);

        // Immediately update preview
        onPreviewUpdate(updatedSettings);

        // Mark as having pending changes until debounced save completes
        setHasPendingChanges(true);

        // Debounce the save
        debouncedSettingsChange(updatedSettings, field);
      } catch (error) {
        console.error("Error in handleSettingChange:", error);
      }
    },
    [settings, form, debouncedSettingsChange, onPreviewUpdate]
  );

  const handleResetToDefaults = useCallback(async () => {
    try {
      // Close dialog
      dialogRef.current?.click();

      // Reset form to defaults
      form.reset(defaultSettings);

      // Update server state with all default settings
      await onSettingsChange(defaultSettings);

      // Update preview
      onPreviewUpdate(defaultSettings);

      setHasPendingChanges(false);
      setLastSaved(new Date());

      toast.success({
        title: "Settings Reset",
        description: "Your settings have been reset to defaults",
      });
    } catch (error) {
      console.error("Failed to reset settings:", error);
      toast.error({
        title: "Reset Failed",
        description: "Failed to reset settings. Please try again.",
      });
    }
  }, [defaultSettings, form, onSettingsChange, onPreviewUpdate]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!hasPendingChanges) return;

      try {
        const data = form.getValues();
        await onSettingsChange(data);
        setHasPendingChanges(false);
        setLastSaved(new Date());
        toast.success({
          title: "Settings saved",
          description: "Your changes have been saved successfully.",
        });
      } catch (error) {
        console.error("Error saving settings:", error);
        toast.error({
          title: "Error saving settings",
          description: "Your changes couldn't be saved. Please try again.",
        });
      }
    },
    [form, onSettingsChange, hasPendingChanges]
  );

  return {
    handleSettingChange,
    handleResetToDefaults,
    handleSubmit,
    dialogRef,
    isSaving,
    lastSaved,
    changingField,
    hasPendingChanges,
  };
}
