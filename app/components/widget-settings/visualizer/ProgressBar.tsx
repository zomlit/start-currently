import React, { useEffect, useRef } from "react";
import { rgbaToString } from "@/utils/index";

interface ProgressBarProps {
  progress: number;
  progressBarForegroundColor: string;
  progressBarBackgroundColor: string;
  duration: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  progressBarForegroundColor,
  progressBarBackgroundColor,
  duration,
}) => {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.width = `${progress}%`;
    }
  }, [progress]);

  return (
    <div
      className="relative bottom-0 h-2 w-full overflow-hidden rounded-full"
      style={{ backgroundColor: rgbaToString(progressBarBackgroundColor) }}
    >
      <div
        ref={progressRef}
        className="absolute left-0 top-0 h-full"
        style={{
          backgroundColor: rgbaToString(progressBarForegroundColor),
          transition: `width ${duration}ms linear`,
        }}
      />
    </div>
  );
};

export default ProgressBar;
