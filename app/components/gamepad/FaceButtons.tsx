import { cn } from "@/lib/utils";

interface FaceButtonProps {
  pressed?: boolean;
  className?: string;
  color?: string;
  pressedColor?: string;
}

const baseButtonStyles = {
  transition: "opacity 0.1s ease",
};

// PlayStation official button colors
const PS_COLORS = {
  cross: "#0072BC", // Blue
  circle: "#EE1F1F", // Red
  square: "#DF00FF", // Pink
  triangle: "#2ECC71", // Green
};

export function CircleButton({
  pressed,
  className,
  color,
  pressedColor,
}: FaceButtonProps) {
  return (
    <svg
      className={cn("w-full h-full transition-all", className)}
      viewBox="0 0 54 54"
      style={{
        ...baseButtonStyles,
      }}
    >
      {/* Background circle */}
      <path
        className="cls-1"
        d="M83.8,111.3A26.25,26.25,0,1,1,110,85.1,26.33,26.33,0,0,1,83.8,111.3Z"
        transform="translate(-57.55 -57.8)"
        fill={pressed ? "var(--button-pressed-color)" : "var(--button-color)"}
        opacity={0.8}
      />
      {/* PlayStation circle shape */}
      <path
        d="M83.8,66.2a18.9,18.9,0,1,0,18.9,18.9A18.95,18.95,0,0,0,83.8,66.2Zm0,34.9a16,16,0,1,1,16-16A16,16,0,0,1,83.8,101.1Z"
        transform="translate(-57.55 -57.8)"
        fill={
          pressed ? pressedColor || PS_COLORS.circle : color || PS_COLORS.circle
        }
        opacity={pressed ? 1 : 0.8}
      />
    </svg>
  );
}

export function CrossButton({
  pressed,
  className,
  color,
  pressedColor,
}: FaceButtonProps) {
  return (
    <svg
      className={cn("w-full h-full transition-all", className)}
      viewBox="0 0 54 54"
      style={{
        ...baseButtonStyles,
      }}
    >
      {/* Background circle */}
      <path
        className="cls-1"
        d="M27.2,111.3A26.2,26.2,0,1,1,53.6,85.1,26.23,26.23,0,0,1,27.2,111.3Z"
        transform="translate(-1 -57.8)"
        fill={pressed ? "var(--button-pressed-color)" : "var(--button-color)"}
        opacity={0.8}
      />
      {/* PlayStation cross shape */}
      <polygon
        points="41.6 72.7 39.6 70.7 27.3 83.1 14.9 70.7 12.9 72.7 25.2 85.1 12.9 97.4 14.9 99.5 27.3 87.1 39.6 99.5 41.6 97.4 29.3 85.1 41.6 72.7"
        transform="translate(-1 -57.8)"
        fill={
          pressed ? pressedColor || PS_COLORS.cross : color || PS_COLORS.cross
        }
        opacity={pressed ? 1 : 0.8}
      />
    </svg>
  );
}

export function SquareButton({
  pressed,
  className,
  color,
  pressedColor,
}: FaceButtonProps) {
  return (
    <svg
      className={cn("w-full h-full transition-all", className)}
      viewBox="0 0 54 54"
      style={{
        ...baseButtonStyles,
      }}
    >
      {/* Background circle */}
      <path
        className="cls-1"
        d="M140.3,111.3A26.25,26.25,0,1,1,166.6,85,26.25,26.25,0,0,1,140.3,111.3Z"
        transform="translate(-113.05 -57.8)"
        fill={pressed ? "var(--button-pressed-color)" : "var(--button-color)"}
        opacity={0.8}
      />
      {/* PlayStation square shape */}
      <path
        d="M151.8,70.7H126V99.3h28.6V70.7Zm0,25.9h-23v-23h23Z"
        transform="translate(-113.05 -57.8)"
        fill={
          pressed ? pressedColor || PS_COLORS.square : color || PS_COLORS.square
        }
        opacity={pressed ? 1 : 0.8}
      />
    </svg>
  );
}

export function TriangleButton({
  pressed,
  className,
  color,
  pressedColor,
}: FaceButtonProps) {
  return (
    <svg
      className={cn("w-full h-full transition-all", className)}
      viewBox="0 0 54 54"
      style={{
        ...baseButtonStyles,
      }}
    >
      {/* Background circle */}
      <path
        className="cls-1"
        d="M196.7,111.3A26.25,26.25,0,1,1,223,85.1,26.33,26.33,0,0,1,196.7,111.3Z"
        transform="translate(-169.45 -57.8)"
        fill={pressed ? "var(--button-pressed-color)" : "var(--button-color)"}
        opacity={0.8}
      />
      {/* PlayStation triangle shape */}
      <path
        d="M212.7,93.1l-16-27.6-16,27.6-1.6,2.8h35.2Zm-15.9,0H184.1l12.7-21.9,12.7,21.9Z"
        transform="translate(-169.45 -57.8)"
        fill={
          pressed
            ? pressedColor || PS_COLORS.triangle
            : color || PS_COLORS.triangle
        }
        opacity={pressed ? 1 : 0.8}
      />
    </svg>
  );
}
