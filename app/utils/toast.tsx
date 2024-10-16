import { toast as sonnerToast } from "sonner";
import debounce from "lodash/debounce";

interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
}

const debouncedToast = debounce(
  (type: "success" | "error" | "info", options: ToastOptions) => {
    sonnerToast[type](options.title, {
      description: options.description,
      duration: options.duration || 3000,
    });
  },
  1000,
  { leading: true, trailing: false }
);

export const toast = {
  success: (options: ToastOptions) => debouncedToast("success", options),
  error: (options: ToastOptions) => debouncedToast("error", options),
  info: (options: ToastOptions) => debouncedToast("info", options),
};
