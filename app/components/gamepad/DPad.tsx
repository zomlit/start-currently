import { cn } from "@/lib/utils";

interface DPadProps {
  pressed: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  };
  color?: string;
  pressedColor?: string;
}

export function DPad({ pressed, color, pressedColor }: DPadProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 174 173"
      className="w-full h-full"
    >
      {/* Right Arrow */}
      <path
        fill={
          pressed.right ? "var(--button-pressed-color)" : "var(--button-color)"
        }
        d="m163.5 96.1 9.5-8.9a1.144 1.144 0 0 0 .375-.85 1.144 1.144 0 0 0-.375-.85l-9.5-8.9a1.121 1.121 0 0 0-1.9.8v17.8a1.152 1.152 0 0 0 1.9.9Z"
        opacity={pressed.right ? 0.1 : 0.2}
      />

      {/* Up Arrow */}
      <path
        fill={
          pressed.up ? "var(--button-pressed-color)" : "var(--button-color)"
        }
        d="M78.1 11.8h17.8a1.12 1.12 0 0 0 .8-1.9L87.8.4a1.15 1.15 0 0 0-1.7 0l-8.9 9.5a1.17 1.17 0 0 0 .9 1.9Z"
        opacity={pressed.up ? 0.1 : 0.2}
      />

      {/* Left Arrow */}
      <path
        fill={
          pressed.left ? "var(--button-pressed-color)" : "var(--button-color)"
        }
        d="M10.6 76.6l-9.5 8.9a1.15 1.15 0 0 0 0 1.7l9.5 8.9a1.12 1.12 0 0 0 1.9-.8V77.5a1.15 1.15 0 0 0-1.9-.9Z"
        opacity={pressed.left ? 0.1 : 0.2}
      />

      {/* Down Arrow */}
      <path
        fill={
          pressed.down ? "var(--button-pressed-color)" : "var(--button-color)"
        }
        d="M95.9 160.8H78.1a1.121 1.121 0 0 0-.8 1.9l8.9 9.5a1.145 1.145 0 0 0 .85.375 1.144 1.144 0 0 0 .85-.375l8.9-9.5a1.168 1.168 0 0 0-.283-1.715 1.175 1.175 0 0 0-.617-.185Z"
        opacity={pressed.down ? 0.1 : 0.2}
      />

      {/* Left D-Pad */}
      <path
        fill={
          pressed.left ? "var(--button-pressed-color)" : "var(--button-color)"
        }
        d="M74.3 89.2c1.4-2 1.2-2.9 1.2-2.9s.2-.9-1.2-2.9-15-13.6-15.7-14c-.7-.4-28.5-2.2-31.4 1.3-2.9 3.5-2.6 15.6-2.6 15.6s-.3 12.1 2.6 15.6 30.7 1.7 31.4 1.3c.7-.4 14.3-12 15.7-14Z"
        opacity={pressed.left ? 1 : 0.8}
      />

      {/* Up D-Pad */}
      <path
        fill={
          pressed.up ? "var(--button-pressed-color)" : "var(--button-color)"
        }
        d="M84.1 73.6c2 1.4 2.9 1.2 2.9 1.2s.9.2 2.9-1.2 13.6-15 14-15.7c.4-.7 2.2-28.5-1.3-31.4-3.5-2.9-15.6-2.6-15.6-2.6s-12.1-.3-15.6 2.6-1.7 30.7-1.3 31.4c.4.7 12 14.3 14 15.7Z"
        opacity={pressed.up ? 1 : 0.8}
      />

      {/* Right D-Pad */}
      <path
        fill={
          pressed.right ? "var(--button-pressed-color)" : "var(--button-color)"
        }
        d="M146.8 70.8c-2.9-3.5-30.7-1.7-31.4-1.3-.7.4-14.3 12-15.7 14-1.4 2-1.2 2.9-1.2 2.9s-.2.9 1.2 2.9 15 13.6 15.7 14c.7.4 28.5 2.2 31.4-1.3 2.9-3.5 2.6-15.6 2.6-15.6s.3-12.1-2.6-15.6Z"
        opacity={pressed.right ? 1 : 0.8}
      />

      {/* Down D-Pad */}
      <path
        fill={
          pressed.down ? "var(--button-pressed-color)" : "var(--button-color)"
        }
        d="M89.9 99.1c-2-1.4-2.9-1.2-2.9-1.2s-.9-.2-2.9 1.2-13.6 15-14 15.7c-.4.7-2.2 28.5 1.3 31.4 3.5 2.9 15.6 2.6 15.6 2.6s12.1.3 15.6-2.6 1.7-30.7 1.3-31.4c-.4-.7-12-14.3-14-15.7Z"
        opacity={pressed.down ? 1 : 0.8}
      />

      {/* Shadow effects */}
      <path
        fill="#000"
        d="M74.3 89.2c1.4-2 1.2-2.9 1.2-2.9s.2-.9-1.2-2.9c-.9-1.3-6.9-6.6-11.2-10.3a27.84 27.84 0 0 0-3.4 13.2 26.73 26.73 0 0 0 3.4 13.2c4.3-3.7 10.3-9 11.2-10.3Z"
        opacity=".25"
      />
      <path
        fill="#000"
        d="M84.1 73.6c2 1.4 2.9 1.2 2.9 1.2s.9.2 2.9-1.2c1.3-.9 6.6-6.9 10.3-11.2A27.84 27.84 0 0 0 87 59a26.73 26.73 0 0 0-13.2 3.4c3.8 4.3 9 10.3 10.3 11.2Z"
        opacity=".25"
      />
      <path
        fill="#000"
        d="M111 73.2c-4.3 3.7-10.3 9-11.2 10.3-1.4 2-1.2 2.9-1.2 2.9s-.2.9 1.2 2.9c.9 1.3 6.9 6.6 11.2 10.3a27.316 27.316 0 0 0 0-26.4Z"
        opacity=".25"
      />
      <path
        fill="#000"
        d="M89.9 99.1c-2-1.4-2.9-1.2-2.9-1.2s-.9-.2-2.9 1.2c-1.3.9-6.6 6.9-10.3 11.2a27.835 27.835 0 0 0 13.2 3.4 26.735 26.735 0 0 0 13.2-3.4c-3.7-4.3-9-10.3-10.3-11.2Z"
        opacity=".25"
      />
    </svg>
  );
}

export default DPad;
