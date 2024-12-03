import React from "react";
import { useFormContext } from "react-hook-form";

interface ColorPickerProps {
  name: string;
  label: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ name, label }) => {
  const { register, watch } = useFormContext();

  return (
    <div className="form-group">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type="color"
        id={name}
        {...register(name)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
      />
      <span className="mt-1 block text-sm text-gray-500">{watch(name)}</span>
    </div>
  );
};
