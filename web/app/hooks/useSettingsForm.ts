import { useCallback, useState, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { useDebouncedCallback } from "use-debounce";
import { toast } from "@/utils/toast";
import { z } from "zod";
import type { UseSettingsFormConfig } from "@/utils/form";

interface UseSettingsFormProps<T extends Record<string, any>> {
  form: UseFormReturn<T>;
  settings: T;
  onSettingsChange: (settings: T) => Promise<void>;
  onPreviewUpdate: (settings: T) => void;
  schema: z.ZodType<T>;
  defaultSettings: T;
}

export function useSettingsForm<T extends object>({
  form,
  settings,
  onSettingsChange,
  onPreviewUpdate,
  schema,
  defaultSettings,
}: UseSettingsFormProps<T>) {
  const [state, setState] = useState({
    isSaving: false,
    lastSaved: null as Date | null,
    changingField: null as string | null,
    hasPendingChanges: false,
  });

  const dialogRef = useRef<HTMLButtonElement>(null);

  // Debounced save with memoized callback
  const debouncedSave = useDebouncedCallback(
    useCallback(
      async (data: T) => {
        try {
          setState((prev) => ({ ...prev, isSaving: true }));
          await onSettingsChange(data);
          setState((prev) => ({
            ...prev,
            lastSaved: new Date(),
            isSaving: false,
            hasPendingChanges: false,
          }));
        } catch (error) {
          console.error("Failed to save settings:", error);
          setState((prev) => ({ ...prev, isSaving: false }));
        }
      },
      [onSettingsChange]
    ),
    500
  );

  // Optimized setting change handler
  const handleSettingChange = useCallback(
    (name: string, value: any) => {
      setState((prev) => ({
        ...prev,
        changingField: name,
        hasPendingChanges: true,
      }));

      // Batch updates
      form.setValue(name, value, { shouldDirty: true });
      const newSettings = {
        ...form.getValues(),
        [name]: value,
      };

      onPreviewUpdate(newSettings);
      debouncedSave(newSettings);
    },
    [form, debouncedSave, onPreviewUpdate]
  );

  return {
    ...state,
    handleSettingChange,
    handleResetToDefaults: useCallback(() => {
      form.reset(defaultSettings);
      onPreviewUpdate(defaultSettings);
      debouncedSave(defaultSettings);
      dialogRef.current?.click();
      setState((prev) => ({
        ...prev,
        hasPendingChanges: false,
        changingField: null,
      }));
    }, [form, defaultSettings, onPreviewUpdate, debouncedSave]),
    handleSubmit: form.handleSubmit((data: T) => debouncedSave(data)),
    dialogRef,
  };
}
