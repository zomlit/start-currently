interface SwitchFieldProps {
  name: string;
  label: string;
  description?: string;
  onChange: (value: boolean) => void;
  value: boolean;
}

export function SwitchField({
  name,
  label,
  description,
  onChange,
  value,
}: SwitchFieldProps) {
  return (
    <FormField
      name={name}
      render={() => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <div className="space-y-0.5">
            <FormLabel>{label}</FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
          </div>
          <FormControl>
            <Switch checked={value} onCheckedChange={onChange} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
