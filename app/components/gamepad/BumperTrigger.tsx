import { cn } from "@/lib/utils";

interface ButtonProps {
  pressed?: boolean | number;
  className?: string;
  side?: "left" | "right";
}

export function Bumper({ pressed, className }: ButtonProps) {
  return (
    <svg className={cn("w-full h-full", className)} viewBox="0 0 98.9 22.4">
      <g>
        <path
          className="cls-1"
          d="M0,15.5a2.14,2.14,0,0,1,1.1-1.9C5.6,10.7,24.4,0,52.6,0,79.5,0,93.7,5.9,97.7,8a2.2,2.2,0,0,1,1.2,2S89.1,7.1,51.4,7.1,0,15.5,0,15.5Z"
          fill={pressed ? "var(--button-pressed-color)" : "var(--button-color)"}
          opacity={pressed ? 1 : 0.8}
        />
        <path
          className="cls-2"
          d="M0,22.4H0V15.5S13.7,7.1,51.4,7.1,98.9,10,98.9,10V21h0c-7.7-1.3-21.2-2.6-44.1-2.6C26.3,18.4,8.9,20.7,0,22.4Z"
          fill={pressed ? "var(--button-pressed-color)" : "var(--button-color)"}
          opacity={pressed ? 1 : 0.8}
        />
      </g>
    </svg>
  );
}
