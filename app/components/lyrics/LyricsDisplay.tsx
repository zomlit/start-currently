import React, { useRef, useEffect } from 'react';
import { LyricsSettings } from '@/types/lyrics';
import { cn } from '@/lib/utils';

interface LyricsDisplayProps {
  lyrics: string[];
  currentLine: number;
  settings: LyricsSettings;
}

export function LyricsDisplay({ lyrics, currentLine, settings }: LyricsDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentLineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentLineRef.current && containerRef.current) {
      currentLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentLine]);

  const getTextShadow = () => {
    const { textShadowColor, textShadowBlur, textShadowOffsetX, textShadowOffsetY } = settings;
    return `${textShadowOffsetX}px ${textShadowOffsetY}px ${textShadowBlur}px ${textShadowColor}`;
  };

  const getGlowEffect = () => {
    if (!settings.glowEffect) return '';
    return `0 0 ${settings.glowIntensity}px ${settings.glowColor}`;
  };

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden"
      style={{
        backgroundColor: settings.greenScreenMode ? '#00FF00' : settings.backgroundColor,
        padding: settings.padding,
      }}
    >
      <div className="relative h-full">
        {settings.showFade && (
          <>
            <div
              className="pointer-events-none absolute top-0 z-10 h-32 w-full"
              style={{
                background: `linear-gradient(to bottom, ${settings.backgroundColor}, transparent)`,
              }}
            />
            <div
              className="pointer-events-none absolute bottom-0 z-10 h-32 w-full"
              style={{
                background: `linear-gradient(to top, ${settings.backgroundColor}, transparent)`,
              }}
            />
          </>
        )}
        
        <div className="flex h-full flex-col items-start">
          {lyrics.map((line, index) => {
            const isCurrent = index === currentLine;
            return (
              <div
                key={index}
                ref={isCurrent ? currentLineRef : null}
                className={cn(
                  "w-full transition-all duration-300",
                  settings.textAlign === "center" && "text-center",
                  settings.textAlign === "right" && "text-right"
                )}
                style={{
                  color: isCurrent ? settings.currentTextColor : settings.textColor,
                  fontSize: settings.fontSize * (isCurrent ? settings.currentLineScale : 1),
                  lineHeight: settings.lineHeight,
                  fontFamily: settings.fontFamily,
                  textShadow: getTextShadow(),
                  ...(settings.glowEffect && isCurrent && {
                    filter: `drop-shadow(${getGlowEffect()})`,
                  }),
                }}
              >
                {line}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 