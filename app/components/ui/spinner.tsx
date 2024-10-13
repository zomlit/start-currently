import * as React from "react";
import { CircleDot } from "../../components/icons";

interface SpinnerProps {
  className?: string;
  message?: string;
  show?: boolean;
  wait?: `delay-${number}`;
}

export function Spinner({
  className,
  message,
  show = true,
  wait = "delay-300",
}: SpinnerProps) {
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center transition ${
        show
          ? `opacity-1 duration-500 ${wait}`
          : "duration-500 opacity-0 delay-0"
      }`}
    >
      <CircleDot className={`animate-spin ${className}`} />
      {message && <p className="mt-2 text-sm text-gray-200">{message}</p>}
    </div>
  );
}
