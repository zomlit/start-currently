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

export function Trigger({ pressed, className, side = "right" }: ButtonProps) {
  const pressure = typeof pressed === "number" ? pressed : pressed ? 1 : 0;

  if (side === "right") {
    return (
      <svg className={cn("w-full h-full", className)} viewBox="0 0 200 90.8">
        <g>
          <g>
            <path
              className="cls-1"
              d="M199.9,90.8s-32.7-3.2-50.6-3.2S100.9,90,100.9,90s3.1-44.7,4.8-52,7.7-21.3,16.9-27.9S134.6,0,145.4,0,170.8,6.4,180,21.4,199.9,90.8,199.9,90.8Z"
              transform="translate(0.1 0)"
              fill="var(--button-color)"
              opacity={pressure}
            />
            <path
              className="cls-2"
              d="M101.4,83.2s26.1-4.4,49-4.4,47.9,4.4,47.9,4.4c1,4.7,1.6,7.6,1.6,7.6s-32.7-3.2-50.6-3.2S100.9,90,100.9,90S101.1,87.3,101.4,83.2Z"
              transform="translate(0.1 0)"
              fill="var(--button-color)"
              opacity={pressure}
            />
          </g>
          <g className="cls-3">
            <path
              d="M151.4,65.7l-3.2,2.6a6.71,6.71,0,0,0-2,4.5H156V70.2h-6.2a6.71,6.71,0,0,1,2.1-1.9,12.47,12.47,0,0,0,2.7-2.1,4.77,4.77,0,0,0,1.3-3.3,4.22,4.22,0,0,0-1.4-3.3,5.13,5.13,0,0,0-3.5-1.2c-3.1,0-4.7,1.7-4.7,5H149q0-2.7,2.1-2.7a1.83,1.83,0,0,1,2,2.1C153.2,63.9,152.6,64.8,151.4,65.7Z"
              transform="translate(0.1 0)"
              fill="var(--button-color)"
              opacity={0.08}
            />
            <path
              d="M133.9,67.2h3c1.5,0,2.3.6,2.4,1.9s.2,2.5.3,3.8h3.3v-.4c-.5-.2-.7-.7-.7-1.5a2.81,2.81,0,0,1,.1-.8v-.7a3.56,3.56,0,0,0-1.8-3.5,3.25,3.25,0,0,0,2.2-3.4,3.54,3.54,0,0,0-1.3-3,4.72,4.72,0,0,0-3.2-1h-7.3V72.9h3Zm0-6.2h3.7c1.4,0,2.1.6,2.1,1.9s-.8,1.9-2.3,1.9h-3.5Z"
              transform="translate(0.1 0)"
              fill="var(--button-color)"
              opacity={0.08}
            />
          </g>
        </g>
      </svg>
    );
  }

  return (
    <svg className={cn("w-full h-full", className)} viewBox="0 0 200 90.8">
      <g>
        <g>
          <path
            className="cls-1"
            d="M0,90.8s32.7-3.2,50.6-3.2S98.9,90,98.9,90s-3.1-44.7-4.8-52S86.4,16.7,77.2,10.1,65.3,0,54.5,0,29.1,6.4,19.9,21.4,0,90.8,0,90.8Z"
            transform="translate(0.1 0)"
            fill="var(--button-color)"
            opacity={pressure}
          />
          <path
            className="cls-2"
            d="M98.4,83.2s-26.1-4.4-49-4.4S1.5,83.2,1.5,83.2c-1,4.7-1.6,7.6-1.6,7.6s32.7-3.2,50.6-3.2S98.9,90,98.9,90S98.8,87.3,98.4,83.2Z"
            transform="translate(0.1 0)"
            fill="var(--button-color)"
            opacity={pressure}
          />
        </g>
        <g className="cls-3">
          <path
            d="M64.5,65.7l-3.2,2.6a6.71,6.71,0,0,0-2,4.5H69V70.2H62.8a6.71,6.71,0,0,1,2.1-1.9,12.47,12.47,0,0,0,2.7-2.1,4.77,4.77,0,0,0,1.3-3.3,4.22,4.22,0,0,0-1.4-3.3A5.13,5.13,0,0,0,64,58.4c-3.1,0-4.7,1.7-4.7,5H62q0-2.7,2.1-2.7a1.83,1.83,0,0,1,2,2.1A3.17,3.17,0,0,1,64.5,65.7Z"
            transform="translate(0.1 0)"
            fill="var(--button-color)"
            opacity={0.08}
          />
          <polygon
            points="56.1 70.2 49 70.2 49 58.5 46 58.5 46 72.8 56.1 72.8 56.1 70.2"
            fill="var(--button-color)"
            opacity={0.08}
          />
        </g>
      </g>
    </svg>
  );
}
