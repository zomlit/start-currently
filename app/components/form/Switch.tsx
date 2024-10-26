import React from "react";
import { useFormContext } from "react-hook-form";
import { Switch as ShadcnSwitch } from "@/components/ui/switch";

interface SwitchProps {
  name: string;
  label: string;
}

export const Switch: React.FC<SwitchProps> = ({ name, label }) => {
  const { register, watch, setValue } = useFormContext();

  return (
    <div className="form-group flex items-center">
      <ShadcnSwitch
        id={name}
        checked={watch(name)}
        onCheckedChange={(checked) => setValue(name, checked)}
        className="mr-2"
      />
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
      </label>
    </div>
  );
};
