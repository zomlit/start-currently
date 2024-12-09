interface SliderFieldProps {
  name: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  value: number;
  onBlur?: () => void;
}

export function SliderField({
  name,
  label,
  min,
  max,
  step,
  onChange,
  value,
  onBlur,
}: SliderFieldProps) {
  return (
    <FormField
      name={name}
      render={() => (
        <FormItem>
          <SliderWithInput
            label={label}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            min={min}
            max={max}
            step={step}
          />
        </FormItem>
      )}
    />
  );
}
