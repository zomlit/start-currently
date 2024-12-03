export interface DriftReport {
  timestamp: string;
  leftStick: {
    drift: number;
    x: number;
    y: number;
    exceedsDeadzone: boolean;
  };
  rightStick: {
    drift: number;
    x: number;
    y: number;
    exceedsDeadzone: boolean;
  };
  deadzone: number;
}

export function generateDriftReport(
  axes: number[],
  deadzone: number,
  isUserInteracting: boolean
): DriftReport | null {
  // Skip if no axes data
  if (!axes || axes.length < 4) {
    console.log("Skipping report - invalid axes data");
    return null;
  }

  // Skip if user is interacting
  if (isUserInteracting) {
    console.log("Skipping report - user interacting");
    return null;
  }

  const leftDrift = Math.max(Math.abs(axes[0]), Math.abs(axes[1]));
  const rightDrift = Math.max(Math.abs(axes[2]), Math.abs(axes[3]));

  // Always generate a report if we have valid data
  const report = {
    timestamp: new Date().toISOString(),
    leftStick: {
      drift: leftDrift,
      x: axes[0],
      y: axes[1],
      exceedsDeadzone: leftDrift > deadzone,
    },
    rightStick: {
      drift: rightDrift,
      x: axes[2],
      y: axes[3],
      exceedsDeadzone: rightDrift > deadzone,
    },
    deadzone,
  };

  console.log("Generated report:", {
    leftDrift: leftDrift.toFixed(3),
    rightDrift: rightDrift.toFixed(3),
    axes: axes.map((a) => a.toFixed(3)),
  });

  return report;
}

export function exportDriftReportAsCSV(reports: DriftReport[]): string {
  const headers = [
    "Timestamp",
    "Left Stick Drift",
    "Left Stick X",
    "Left Stick Y",
    "Left Exceeds Deadzone",
    "Right Stick Drift",
    "Right Stick X",
    "Right Stick Y",
    "Right Exceeds Deadzone",
    "Deadzone",
  ].join(",");

  const rows = reports.map((report) =>
    [
      report.timestamp,
      report.leftStick.drift.toFixed(4),
      report.leftStick.x.toFixed(4),
      report.leftStick.y.toFixed(4),
      report.leftStick.exceedsDeadzone,
      report.rightStick.drift.toFixed(4),
      report.rightStick.x.toFixed(4),
      report.rightStick.y.toFixed(4),
      report.rightStick.exceedsDeadzone,
      report.deadzone.toFixed(4),
    ].join(",")
  );

  return [headers, ...rows].join("\n");
}
