import React, { ChangeEvent } from "react";
import { UseFormRegister } from "react-hook-form"; // Import UseFormRegister from react-hook-form

interface InputFieldProps {
  id: string;
  label: string;
  placeholder: string;
  name: string;
  value?: string; // Make value optional
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  description?: string;
  includePrefix?: boolean; // New property to include prefix
  error?: string | undefined; // Error message from react-hook-form
  register?: UseFormRegister<any>; // Register function from react-hook-form
  hasIcon?: boolean; // New property to indicate if there's an icon
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  placeholder,
  name,
  value = "", // Default value for value
  onChange,
  type = "text",
  description,
  includePrefix = false, // Default value for includePrefix
  error,
  register,
  hasIcon = false, // Default value for hasIcon
}) => {
  const prefix = "!";
  const prefixedValue = includePrefix ? (value.startsWith(prefix) ? value : `${value}`) : value;

  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="mt-2 block text-sm font-medium dark:text-white">
        {label}
      </label>
      <div className="mt-2 flex">
        {includePrefix && (
          <div className="relative flex  w-10 items-center justify-center rounded-l-md bg-primary py-2 text-primary-foreground">
            <span className="font-bold">{prefix}</span>
          </div>
        )}
        <input
          id={id}
          type={type}
          name={name}
          value={prefixedValue}
          placeholder={placeholder}
          onChange={onChange}
          {...register} // Spread register function to bind with react-hook-form
          className={`flex-1 ${includePrefix ? "rounded-l-none" : "rounded-md"} ${hasIcon ? "pl-10" : ""} w-full rounded-r-md border ${error ? "border-red-500" : "border-primary"} text-md p-[10px] outline-none focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-900/75 dark:focus:ring-blue-600 `}
          data-description={description}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;
