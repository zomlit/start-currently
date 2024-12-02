import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGamepadProvider } from "@/providers/GamepadProvider";

interface WidgetCTAProps {
  title: string;
  description: string;
  icon: LucideIcon;
  primaryAction: {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
  };
  className?: string;
}

export function WidgetCTA({
  title,
  description,
  icon: Icon,
  primaryAction,
  className,
}: WidgetCTAProps) {
  const { isExtensionEnabled, toggleExtension, extensionId } =
    useGamepadProvider();

  // Determine button state based on if extension is enabled
  const buttonProps = isExtensionEnabled
    ? {
        label: "Disable Extension",
        variant: "default" as const,
        className:
          "gap-2 whitespace-nowrap bg-pink-500/20 hover:bg-pink-500/20 text-white w-full mt-4 md:mt-0",
        onClick: toggleExtension,
      }
    : {
        label: primaryAction.label,
        variant: "ghost" as const,
        className:
          "gap-2 whitespace-nowrap bg-blue-500/10 hover:bg-blue-500/20",
        onClick: primaryAction.onClick,
      };

  return (
    <div
      className={cn(
        "w-full relative overflow-hidden shadow-md my-2 dark:my-2 rounded-lg transition-all duration-300 hover:shadow-lg group",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 via-purple-500/10 to-blue-500/5 opacity-100 group-hover:opacity-0 transition-all" />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/15 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity animate-gradient" />

      <div className="relative py-3 px-4">
        <div className="md:flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
              <Icon className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{title}</h3>
              <p className="text-md font-light dark:text-white/70">
                {description}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={buttonProps.variant}
              size="sm"
              className={buttonProps.className}
              onClick={buttonProps.onClick}
            >
              {primaryAction.icon && <primaryAction.icon className="h-4 w-4" />}
              {buttonProps.label}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
