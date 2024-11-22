import React, { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/utils/toast";
import { DriftReport } from "@/components/gamepad/DriftReport";

interface DriftCollectorProps {
  isEnabled: boolean;
  axes: number[];
  deadzone: number;
  isUserInteracting: boolean;
}

export function DriftCollector({
  isEnabled,
  axes,
  deadzone,
  isUserInteracting,
}: DriftCollectorProps) {
  const [driftReports, setDriftReports] = useState<DriftReport[]>([]);
  const [isCollecting, setIsCollecting] = useState(false);
  const collectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCollectionTimeRef = useRef<number>(Date.now());

  // Update the data collection effect
  useEffect(() => {
    if (!isEnabled || !isCollecting || !axes) return;

    // Cleanup previous interval
    if (collectionIntervalRef.current) {
      clearInterval(collectionIntervalRef.current);
      collectionIntervalRef.current = null;
    }

    const collectData = () => {
      const now = Date.now();
      // Only collect if at least 1 second has passed since last collection
      if (now - lastCollectionTimeRef.current >= 1000) {
        const report = generateDriftReport(axes, deadzone, isUserInteracting);
        if (report) {
          setDriftReports((prev) => [...prev, report]);
          lastCollectionTimeRef.current = now;
        }
      }
    };

    // Initial collection
    collectData();

    // Set up interval for subsequent collections
    collectionIntervalRef.current = setInterval(collectData, 1000);

    return () => {
      if (collectionIntervalRef.current) {
        clearInterval(collectionIntervalRef.current);
        collectionIntervalRef.current = null;
      }
    };
  }, [isCollecting, axes, deadzone, isEnabled, isUserInteracting]);

  // Clear collected data when disabled
  useEffect(() => {
    if (!isEnabled) {
      setDriftReports([]);
      setIsCollecting(false);
      if (collectionIntervalRef.current) {
        clearInterval(collectionIntervalRef.current);
        collectionIntervalRef.current = null;
      }
    }
  }, [isEnabled]);

  const handleCollectionToggle = useCallback(() => {
    if (!isEnabled) return;

    setIsCollecting((prev) => {
      const newState = !prev;
      if (newState) {
        setDriftReports([]);
        lastCollectionTimeRef.current = Date.now();
      }
      return newState;
    });
  }, [isEnabled]);

  return (
    <div className="mt-6 border-t border-border/50 pt-4">
      <div className="mb-4 flex items-center justify-between rounded-lg bg-card/50 p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Samples:</span>
          <Badge variant="secondary">{driftReports.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isCollecting ? "destructive" : "default"}
            onClick={handleCollectionToggle}
            className={cn(
              "transition-colors duration-200",
              isCollecting
                ? "bg-red-600 hover:bg-red-700"
                : "bg-violet-600 hover:bg-violet-700"
            )}
          >
            {isCollecting ? (
              <>
                <span className="mr-2 animate-pulse">●</span>
                Stop Collection ({driftReports.length})
              </>
            ) : (
              "Start Collection"
            )}
          </Button>
        </div>
      </div>

      <DriftReport
        reports={driftReports}
        onClearReports={() => setDriftReports([])}
      />
    </div>
  );
}
