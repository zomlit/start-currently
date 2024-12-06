"use client";

import { ChromePicker, type ColorResult } from "@uiw/react-color";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ color, onChange }: ColorPickerProps) {
  return (
    <ChromePicker
      color={color}
      onChange={(color: ColorResult) => onChange(color.hex)}
    />
  );
}
