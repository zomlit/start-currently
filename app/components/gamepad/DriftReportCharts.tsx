import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
  Legend,
  ScatterChart,
  Scatter,
  Cell,
} from "recharts";
import type { DriftReport } from "@/lib/gamepad-utils";
import { cn } from "@/lib/utils";

interface DriftReportChartsProps {
  reports: DriftReport[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-md">
        <p className="text-xs text-muted-foreground">{label}</p>
        {payload.map((entry: any) => (
          <div
            key={entry.name}
            className="flex items-center justify-between gap-2"
          >
            <span
              className={cn("text-sm font-medium", {
                "text-red-500": entry.value > entry.payload.deadzone,
                "text-emerald-500": entry.value <= entry.payload.deadzone,
              })}
            >
              {entry.name}:
            </span>
            <span
              className={cn("text-sm", {
                "text-red-500": entry.value > entry.payload.deadzone,
                "text-emerald-500": entry.value <= entry.payload.deadzone,
              })}
            >
              {entry.value.toFixed(3)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const getHeatmapColor = (value: number, deadzone: number) => {
  if (value <= deadzone * 0.5) return "#22c55e"; // Green for very low drift
  if (value <= deadzone * 0.75) return "#84cc16"; // Light green for low drift
  if (value <= deadzone) return "#eab308"; // Yellow for near deadzone
  if (value <= deadzone * 1.5) return "#f97316"; // Orange for above deadzone
  return "#ef4444"; // Red for high drift
};

const getHeatmapOpacity = (value: number, deadzone: number) => {
  return Math.min(value / (deadzone * 2), 1) * 0.8 + 0.2; // Min opacity of 0.2
};

export function DriftReportCharts({ reports }: DriftReportChartsProps) {
  // Format data for time series with temperature-like status
  const timeSeriesData = reports.map((report) => ({
    timestamp: new Date(report.timestamp).toLocaleTimeString(),
    leftDrift: report.leftStick.drift,
    rightDrift: report.rightStick.drift,
    deadzone: report.deadzone,
    status:
      Math.max(report.leftStick.drift, report.rightStick.drift) >
      report.deadzone
        ? "critical"
        : "normal",
  }));

  // Format data for stick positions
  const stickPositionsData = reports.map((report) => ({
    timestamp: new Date(report.timestamp).toLocaleTimeString(),
    leftX: report.leftStick.x,
    leftY: report.leftStick.y,
    rightX: report.rightStick.x,
    rightY: report.rightStick.y,
    deadzone: report.deadzone,
  }));

  // Calculate max drift for scaling
  const maxDrift = Math.max(
    ...reports.map((r) => Math.max(r.leftStick.drift, r.rightStick.drift))
  );

  // Add heatmap data formatting
  const heatmapData = reports.map((report, index) => ({
    index,
    x: report.leftStick.x,
    y: report.leftStick.y,
    drift: report.leftStick.drift,
    deadzone: report.deadzone,
  }));

  const rightHeatmapData = reports.map((report, index) => ({
    index,
    x: report.rightStick.x,
    y: report.rightStick.y,
    drift: report.rightStick.drift,
    deadzone: report.deadzone,
  }));

  return (
    <Card className="mt-6 border-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Drift Analysis</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Tabs defaultValue="drift" className="space-y-4">
          <TabsList>
            <TabsTrigger value="drift">Drift Over Time</TabsTrigger>
            <TabsTrigger value="heatmap">Drift Heatmap</TabsTrigger>
            <TabsTrigger value="positions">Stick Positions</TabsTrigger>
          </TabsList>

          <TabsContent value="drift" className="space-y-4">
            <div className="h-[350px] mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData}>
                  <defs>
                    <linearGradient id="leftDrift" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="rightDrift" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="timestamp"
                    fontSize={12}
                    tickFormatter={(value) => value.split(" ")[1]}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    fontSize={12}
                    domain={[0, Math.ceil(maxDrift * 10) / 10]}
                    className="text-muted-foreground"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine
                    y={reports[0]?.deadzone}
                    stroke="#dc2626"
                    strokeDasharray="3 3"
                    label={{
                      value: "Deadzone",
                      position: "right",
                      className: "text-xs text-red-500",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="leftDrift"
                    stroke="#8b5cf6"
                    fill="url(#leftDrift)"
                    name="Left Stick"
                    strokeWidth={2}
                    dot={{
                      fill: "#8b5cf6",
                      r: 2,
                    }}
                    activeDot={{
                      r: 4,
                      strokeWidth: 0,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rightDrift"
                    stroke="#06b6d4"
                    fill="url(#rightDrift)"
                    name="Right Stick"
                    strokeWidth={2}
                    dot={{
                      fill: "#06b6d4",
                      r: 2,
                    }}
                    activeDot={{
                      r: 4,
                      strokeWidth: 0,
                    }}
                  />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">Below Deadzone</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-muted-foreground">Above Deadzone</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Left Stick Heatmap */}
              <div>
                <h3 className="text-sm font-medium mb-2">
                  Left Stick Drift Pattern
                </h3>
                <div className="h-[350px] bg-muted/50 rounded-lg p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis
                        type="number"
                        dataKey="x"
                        domain={[-1, 1]}
                        ticks={[-1, -0.5, 0, 0.5, 1]}
                        fontSize={12}
                      />
                      <YAxis
                        type="number"
                        dataKey="y"
                        domain={[-1, 1]}
                        ticks={[-1, -0.5, 0, 0.5, 1]}
                        fontSize={12}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-md">
                                <p className="text-xs font-medium">Position</p>
                                <p className="text-xs text-muted-foreground">
                                  X: {data.x.toFixed(3)}, Y: {data.y.toFixed(3)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Drift: {data.drift.toFixed(3)}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      {/* Deadzone circle */}
                      <circle
                        cx="50%"
                        cy="50%"
                        r={`${reports[0]?.deadzone * 100}%`}
                        fill="none"
                        stroke="#dc2626"
                        strokeDasharray="5,5"
                        className="opacity-50"
                      />
                      <Scatter data={heatmapData} shape="circle">
                        {heatmapData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getHeatmapColor(entry.drift, entry.deadzone)}
                            fillOpacity={getHeatmapOpacity(
                              entry.drift,
                              entry.deadzone
                            )}
                          />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right Stick Heatmap */}
              <div>
                <h3 className="text-sm font-medium mb-2">
                  Right Stick Drift Pattern
                </h3>
                <div className="h-[350px] bg-muted/50 rounded-lg p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis
                        type="number"
                        dataKey="x"
                        domain={[-1, 1]}
                        ticks={[-1, -0.5, 0, 0.5, 1]}
                        fontSize={12}
                      />
                      <YAxis
                        type="number"
                        dataKey="y"
                        domain={[-1, 1]}
                        ticks={[-1, -0.5, 0, 0.5, 1]}
                        fontSize={12}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-md">
                                <p className="text-xs font-medium">Position</p>
                                <p className="text-xs text-muted-foreground">
                                  X: {data.x.toFixed(3)}, Y: {data.y.toFixed(3)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Drift: {data.drift.toFixed(3)}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      {/* Deadzone circle */}
                      <circle
                        cx="50%"
                        cy="50%"
                        r={`${reports[0]?.deadzone * 100}%`}
                        fill="none"
                        stroke="#dc2626"
                        strokeDasharray="5,5"
                        className="opacity-50"
                      />
                      <Scatter data={rightHeatmapData} shape="circle">
                        {rightHeatmapData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getHeatmapColor(entry.drift, entry.deadzone)}
                            fillOpacity={getHeatmapOpacity(
                              entry.drift,
                              entry.deadzone
                            )}
                          />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Legend */}
              <div className="col-span-2 mb-4">
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="grid grid-cols-5 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-emerald-500" />
                      <span className="text-muted-foreground">Very Low</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-lime-500" />
                      <span className="text-muted-foreground">Low</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-yellow-500" />
                      <span className="text-muted-foreground">
                        Near Deadzone
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-orange-500" />
                      <span className="text-muted-foreground">
                        Above Deadzone
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                      <span className="text-muted-foreground">High Drift</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="positions" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stickPositionsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      fontSize={12}
                      tickFormatter={(value) => value.split(" ")[1]}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="leftX"
                      stackId="1"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      name="Left X"
                    />
                    <Area
                      type="monotone"
                      dataKey="leftY"
                      stackId="2"
                      stroke="#06b6d4"
                      fill="#06b6d4"
                      name="Left Y"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stickPositionsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      fontSize={12}
                      tickFormatter={(value) => value.split(" ")[1]}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="rightX"
                      stackId="1"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      name="Right X"
                    />
                    <Area
                      type="monotone"
                      dataKey="rightY"
                      stackId="2"
                      stroke="#06b6d4"
                      fill="#06b6d4"
                      name="Right Y"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
