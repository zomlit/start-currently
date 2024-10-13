import { toast as sonnerToast } from "sonner";
import { CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

type ToastOptions = {
  title: string;
  description?: string;
};

export const toast = {
  success: ({ title, description }: ToastOptions) => {
    sonnerToast.success(title, {
      description,
      className: "bg-green-500 text-white",
      // icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    });
  },
  error: ({ title, description }: ToastOptions) => {
    sonnerToast.error(title, {
      description,
      className: "text-white",
      // icon: <AlertCircle className="h-5 w-5 text-red-500" />,
    });
  },
  warning: ({ title, description }: ToastOptions) => {
    sonnerToast.warning(title, {
      description,
      className: "text-white",
      // icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    });
  },
  info: ({ title, description }: ToastOptions) => {
    sonnerToast.info(title, {
      description,
      className: "text-white",
      // icon: <Info className="h-5 w-5 text-blue-500" />,
    });
  },
};
