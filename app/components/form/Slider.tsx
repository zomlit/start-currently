import React from "react";
import { useFormContext } from "react-hook-form";
import { Slider as ShadcnSlider } from "@/components/ui/slider";

interface SliderProps {
  name: string;
  label: string;
  min: number;
  max: number;
  step?: number;
}

export const Slider: React.FC<SliderProps> = ({
  name,
  label,
  min,
  max,
  step = 1,
}) => {
  const { register, watch, setValue } = useFormContext();

  return (
    <div className="form-group">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <ShadcnSlider
        min={min}
        max={max}
        step={step}
        value={[watch(name)]}
        onValueChange={(value) => setValue(name, value[0])}
        className="mt-1"
      />
      <span className="mt-1 block text-sm text-gray-500">{watch(name)}</span>
    </div>
  );
};
