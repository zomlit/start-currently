import { toast as sonnerToast } from "sonner";
import debounce from "lodash/debounce";

interface PromiseToastOptions {
  loading: string;
  success: string;
  error: string;
}

const debouncedToast = debounce(
  (
    type: "success" | "error" | "info",
    message: string | { title: string; description?: string }
  ) => {
    if (typeof message === "string") {
      sonnerToast[type](message, {
        duration: 3000,
        className: "font-sofia text-[16px]",
      });
    } else {
      sonnerToast[type](message.title, {
        description: message.description,
        duration: 3000,
        className: "font-sofia text-[16px]",
      });
    }
  },
  1000,
  { leading: true, trailing: false }
);

export const toast = {
  success: (message: string | { title: string; description?: string }) =>
    debouncedToast("success", message),
  error: (message: string | { title: string; description?: string }) =>
    debouncedToast("error", message),
  info: (message: string | { title: string; description?: string }) =>
    debouncedToast("info", message),
  promise: function <T>(promise: Promise<T>, options: PromiseToastOptions) {
    return sonnerToast.promise(promise, {
      loading: options.loading,
      success: options.success,
      error: options.error,
    });
  },
};
