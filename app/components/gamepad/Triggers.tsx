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
  const safePressed = Math.min(Math.max(Number(pressed) || 0, 0), 1);

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
          opacity={0.8}
        />
        <path
          fill={pressedColor}
          d={
            side === "left"
              ? "M.9 90.8s32.7-3.2 50.6-3.2S99.8 90 99.8 90 96.7 45.3 95 38c-1.7-7.3-7.7-21.3-16.9-27.9C68.9 3.5 66.1 0 55.3 0S29.9 6.4 20.7 21.4C11.5 36.4.9 90.8.9 90.8Z"
              : "M99.2 90.8s-32.7-3.2-50.6-3.2S.3 90 .3 90s3.1-44.7 4.8-52c1.7-7.3 7.7-21.3 16.9-27.9C31.2 3.5 34 0 44.8 0s25.4 6.4 34.6 21.4c9.2 15 19.8 69.4 19.8 69.4Z"
          }
          style={{
            opacity: safePressed,
            transition: "opacity 50ms linear",
          }}
        />
        <path
          fill="#fff"
          opacity={0.08 * (1 - safePressed)}
          d={
            side === "left"
              ? "m65.4 65.7-3.2 2.6a6.71 6.71 0 0 0-2 4.5H70v-2.6h-6.2a6.71 6.71 0 0 1 2.1-1.9c.992-.573 1.9-1.28 2.7-2.1a4.77 4.77 0 0 0 1.3-3.3 4.219 4.219 0 0 0-1.4-3.3 5.13 5.13 0 0 0-3.5-1.2c-3.1 0-4.7 1.7-4.7 5H63c0-1.8.7-2.7 2.1-2.7a1.83 1.83 0 0 1 2 2.1 3.63 3.63 0 0 1-1.7 2.9Zm-8.5 4.4h-7.1V58.5h-3v14.3h10.1v-2.7Z"
              : "m50.8 65.7-3.2 2.6a6.71 6.71 0 0 0-2 4.5h9.8v-2.6h-6.3a6.71 6.71 0 0 1 2.1-1.9c.992-.573 1.9-1.28 2.7-2.1a4.77 4.77 0 0 0 1.3-3.3 4.22 4.22 0 0 0-1.4-3.3 5.13 5.13 0 0 0-3.5-1.2c-3.1 0-4.7 1.7-4.7 5h2.7c0-1.8.7-2.7 2.1-2.7a1.83 1.83 0 0 1 2 2.1 3.5 3.5 0 0 1-1.6 2.9Zm-17.6 1.5h3c1.5 0 2.3.6 2.4 1.9.1 1.3.2 2.5.3 3.8h3.3v-.4c-.5-.2-.7-.7-.7-1.5a2.81 2.81 0 0 1 .1-.8v-.7a3.56 3.56 0 0 0-1.8-3.5 3.25 3.25 0 0 0 2.2-3.4 3.541 3.541 0 0 0-1.3-3 4.72 4.72 0 0 0-3.2-1h-7.3v14.3h3v-5.7Zm0-6.3h3.7c1.4 0 2.1.6 2.1 1.9 0 1.3-.8 1.9-2.3 1.9h-3.5v-3.8Z"
          }
        />
      </svg>
    </div>
  );
}

export default Triggers;
