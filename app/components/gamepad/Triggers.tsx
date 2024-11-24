import { cn } from "@/lib/utils";

interface TriggersProps {
  pressed: number;
  side: "left" | "right";
  color?: string;
  pressedColor?: string;
}

export function Triggers({
  pressed,
  side,
  color = "#1a1a1a",
  pressedColor = "#ffffff",
}: TriggersProps) {
  const pressure = Math.min(Math.max(Number(pressed) || 0, 0), 1);
  console.log("Trigger pressure:", pressure);

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox="0 0 100 100"
        className={cn(
          "absolute inset-0 w-full h-full",
          side === "left" ? "origin-left" : "origin-right"
        )}
        style={{
          transform: `scaleX(${side === "left" ? 1 : 1})`,
        }}
      >
        <path
          fill={color}
          d={
            side === "left"
              ? "M.9 90.8s32.7-3.2 50.6-3.2S99.8 90 99.8 90 96.7 45.3 95 38c-1.7-7.3-7.7-21.3-16.9-27.9C68.9 3.5 66.1 0 55.3 0S29.9 6.4 20.7 21.4C11.5 36.4.9 90.8.9 90.8Z"
              : "M99.2 90.8s-32.7-3.2-50.6-3.2S.3 90 .3 90s3.1-44.7 4.8-52c1.7-7.3 7.7-21.3 16.9-27.9C31.2 3.5 34 0 44.8 0s25.4 6.4 34.6 21.4c9.2 15 19.8 69.4 19.8 69.4Z"
          }
        />
        <path
          fill={pressedColor}
          d={
            side === "left"
              ? "M.9 90.8s32.7-3.2 50.6-3.2S99.8 90 99.8 90 96.7 45.3 95 38c-1.7-7.3-7.7-21.3-16.9-27.9C68.9 3.5 66.1 0 55.3 0S29.9 6.4 20.7 21.4C11.5 36.4.9 90.8.9 90.8Z"
              : "M99.2 90.8s-32.7-3.2-50.6-3.2S.3 90 .3 90s3.1-44.7 4.8-52c1.7-7.3 7.7-21.3 16.9-27.9C31.2 3.5 34 0 44.8 0s25.4 6.4 34.6 21.4c9.2 15 19.8 69.4 19.8 69.4Z"
          }
          style={{
            opacity: pressure,
            transition: "opacity 50ms linear",
          }}
        />
      </svg>
    </div>
  );
}

export default Triggers;
