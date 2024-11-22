import React, { useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/utils/toast";
import { DriftReportCharts } from "@/components/gamepad/DriftReportCharts";
import { exportDriftReportAsCSV } from "@/lib/gamepad-utils";
import type { DriftReport } from "@/lib/gamepad-utils";

interface DriftReportProps {
  reports: DriftReport[];
  onClearReports: () => void;
}

export function DriftReport({ reports, onClearReports }: DriftReportProps) {
  const handleExportReport = useCallback(() => {
    if (reports.length === 0) {
      toast.error({
        title: "No Data Available",
        description: "Start collecting data before exporting a report.",
      });
      return;
    }

    const csv = exportDriftReportAsCSV(reports);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gamepad-drift-report-${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success({
      title: "Report Exported Successfully",
      description: `Exported ${reports.length} samples to CSV file.`,
    });
  }, [reports]);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-violet-400">
          Monitoring & Reports
        </h3>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            disabled={reports.length === 0}
            onClick={handleExportReport}
            className={cn(
              "transition-colors duration-200",
              reports.length === 0 && "opacity-50"
            )}
          >
            Export Report
          </Button>
          <Button size="sm" variant="outline" onClick={onClearReports}>
            Clear Data
          </Button>
        </div>
      </div>

      {reports.length > 0 ? (
        <DriftReportCharts reports={reports} />
      ) : (
        <div className="flex h-[200px] items-center justify-center rounded-lg bg-card/50">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              No drift data collected yet
            </p>
            <p className="text-xs text-muted-foreground">
              Click "Start Collection" to begin monitoring
            </p>
          </div>
        </div>
      )}
    </>
  );
}
