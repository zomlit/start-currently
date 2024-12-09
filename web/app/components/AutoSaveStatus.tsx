import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Create simple SVG components
const LoaderIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

interface AutosaveStatusProps {
  lastSaved: Date | null;
  isSaving: boolean;
  className?: string;
  changingField: string | null | undefined;
}

const AutosaveStatus: React.FC<AutosaveStatusProps> = ({
  lastSaved,
  isSaving,
  className,
  changingField,
}) => {
  const [showSaved, setShowSaved] = useState(false);
  const [batchSaving, setBatchSaving] = useState(false);
  const [saveTimer, setSaveTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isSaving) {
      setBatchSaving(true);
      if (saveTimer) {
        clearTimeout(saveTimer);
      }
      const timer = setTimeout(() => {
        setBatchSaving(false);
        setShowSaved(true);
        const hideTimer = setTimeout(() => setShowSaved(false), 5000);
        return () => clearTimeout(hideTimer);
      }, 1000);
      setSaveTimer(timer);
    }
  }, [isSaving]);

  return (
    <AnimatePresence>
      {(batchSaving || showSaved) && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{
            duration: 0.2,
            ease: "easeOut",
          }}
          className={cn(
            "flex items-center gap-2 rounded-md bg-background/80 px-4 py-2 shadow-lg backdrop-blur-sm border border-border/50",
            className
          )}
        >
          <div className="flex-shrink-0">
            {batchSaving ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <LoaderIcon className="h-4 w-4 text-blue-400" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.3 }}
              >
                <CheckIcon className="h-4 w-4 text-green-400" />
              </motion.div>
            )}
          </div>

          <div>
            <AnimatePresence mode="wait">
              {batchSaving ? (
                <motion.div
                  key="saving"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center text-blue-400"
                >
                  <span className="whitespace-nowrap text-xs">
                    Saving {changingField && `"${changingField}"`}
                  </span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 1, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      times: [0, 0.3, 0.7, 1],
                    }}
                  >
                    ...
                  </motion.span>
                </motion.div>
              ) : (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-green-400 whitespace-nowrap text-xs"
                >
                  Saved {changingField && `"${changingField}"`}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AutosaveStatus;
