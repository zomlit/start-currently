export interface UseSettingsFormConfig<T> {
  defaultValues: T;
  mode?: "onChange" | "onBlur" | "onSubmit";
  reValidateMode?: "onChange" | "onBlur" | "onSubmit";
  shouldFocusError?: boolean;
  criteriaMode?: "firstError" | "all";
}

export function createFormConfig<T>(
  config: Partial<UseSettingsFormConfig<T>> = {}
) {
  return {
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: false,
    criteriaMode: "firstError",
    ...config,
  };
}
