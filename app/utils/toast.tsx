import { toast as sonnerToast } from "sonner";
import debounce from "lodash/debounce";

interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const debouncedToast = debounce(
  (type: "success" | "error" | "info", options: ToastOptions) => {
    sonnerToast[type](options.title, {
      description: options.description,
      duration: options.duration || 3000,
      action: options.action && {
        label: options.action.label,
        onClick: options.action.onClick,
      },
      className: "font-sofia text-[16px]",
      descriptionClassName: "font-sofia text-muted-foreground",
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
