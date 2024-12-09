import React from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, X, Save, CircleCheck } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CircleDot } from "@/components/icons";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type SaveButtonState = "saving" | "error" | "saved" | "dirty" | "idle";

interface SettingsFormFooterProps {
  onReset: () => void;
  hasPendingChanges: boolean;
  dialogRef?: React.RefObject<HTMLButtonElement | null>;
  resetDialogTitle?: string;
  resetDialogDescription?: string;
  isSaving?: boolean;
  saveError?: string | null;
  lastSaved?: Date | null;
}

const SaveButtonContent = ({ state }: { state: SaveButtonState }) => {
  const icons = {
    saving: <Spinner className="w-8 h-8 absolute inset-0 fill-white" />,
    error: (
      <X className="absolute inset-0 text-destructive animate-in zoom-in-50 duration-200" />
    ),
    saved: (
      <CircleCheck className="absolute inset-0 text-muted-foreground animate-in zoom-in-50 duration-200" />
    ),
    dirty: <Save className="absolute inset-0 animate-pulse" />,
    idle: <Save className="absolute inset-0 text-muted-foreground" />,
  };

  const labels = {
    saving: "Saving...",
    error: "Retry Save",
    saved: "Saved",
    dirty: "Save Changes",
    idle: "No Changes",
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative size-4">{icons[state]}</div>
      <span>{labels[state]}</span>
    </div>
  );
};

export function SettingsFormFooter({
  onReset,
  hasPendingChanges,
  dialogRef,
  resetDialogTitle = "Reset Settings?",
  resetDialogDescription = "This will reset all settings to their default values. This action cannot be undone.",
  isSaving = false,
  saveError = null,
  lastSaved = null,
}: SettingsFormFooterProps) {
  const saveButtonState: SaveButtonState = isSaving
    ? "saving"
    : saveError
      ? "error"
      : lastSaved && !hasPendingChanges
        ? "saved"
        : hasPendingChanges
          ? "dirty"
          : "idle";

  const buttonStyles = {
    saving: "bg-blue-500 hover:bg-blue-600 cursor-wait text-white",
    error: "bg-destructive hover:bg-destructive/90 text-white",
    saved: "bg-muted hover:bg-muted/90 text-muted-foreground",
    dirty: "bg-primary hover:bg-primary/90 text-white",
    idle: "bg-muted hover:bg-muted/90 text-muted-foreground",
  };

  return (
    <div className="flex items-center gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full rounded p-2 text-center bg-destructive hover:bg-destructive/90 shadow-sm hover:shadow-md transition-shadow duration-200 text-white hover:text-white"
            ref={dialogRef}
          >
            <RotateCcw className="size-4" />
            Reset
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-background/95 backdrop-blur-md border-0">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <div className="relative rounded-full p-3 border-2 border-pink-500 animate-pulse">
                <CircleDot className="h-5 w-5 text-pink-500 fill-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.7)] animate-glow" />
              </div>
            </div>
            <AlertDialogHeader className="text-left">
              <AlertDialogTitle className="text-lg font-semibold">
                {resetDialogTitle}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-muted-foreground">
                {resetDialogDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-medium">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onReset}
              className="bg-destructive hover:bg-destructive/90"
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
          <div className="absolute rounded-md border-2 border-pink-500 animate-pulse -z-50 inset-0 bg-gradient-to-tr from-pink-500/10 to-violet-500/10 blur-xl" />
        </AlertDialogContent>
      </AlertDialog>

      <Button
        type="submit"
        className={cn(
          "w-full transition-all duration-300",
          buttonStyles[saveButtonState],
          !hasPendingChanges && !saveError && "opacity-50"
        )}
        disabled={(!hasPendingChanges && !saveError) || isSaving}
        title={saveError || undefined}
      >
        <SaveButtonContent state={saveButtonState} />
      </Button>

      {saveError && (
        <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-destructive animate-in slide-in-from-top">
          {saveError}
        </div>
      )}
    </div>
  );
}
