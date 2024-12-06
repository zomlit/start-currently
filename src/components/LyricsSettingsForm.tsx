import { useCallback, useEffect, useRef } from "react";
import { FormField } from "./FormField";
import { ColorPicker } from "./ColorPicker";

interface LyricsSettingsFormProps {
  onSubmit: (data: any) => void;
  initialValues?: {
    color?: string;
  };
}

export function LyricsSettingsForm({
  onSubmit,
  initialValues,
}: LyricsSettingsFormProps) {
  // Use ref to store current color value without causing re-renders
  const colorRef = useRef(initialValues?.color || "#000000");

  // Create a stable debounced function
  const debouncedSubmit = useRef(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (color: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          try {
            const settings = {
              settings: {
                color,
              },
            };
            onSubmit(settings);
          } catch (error) {
            console.error("Error processing color update:", error);
          }
        }, 300);
      };
    })()
  ).current;

  const handleColorChange = useCallback(
    (newColor: string) => {
      try {
        // Validate color format
        if (!/^#[0-9A-F]{6}$/i.test(newColor)) {
          console.error("Invalid color format");
          return;
        }

        // Update ref
        colorRef.current = newColor;

        // Send update
        debouncedSubmit(newColor);
      } catch (error) {
        console.error("Error in color change handler:", error);
      }
    },
    [debouncedSubmit]
  );

  // Update colorRef when initialValues change
  useEffect(() => {
    if (initialValues?.color) {
      colorRef.current = initialValues.color;
    }
  }, [initialValues?.color]);

  return (
    <div>
      <FormField>
        <ColorPicker color={colorRef.current} onChange={handleColorChange} />
      </FormField>
    </div>
  );
}
