// Custom debounce function
export const debounce = (func, wait) => {
  let timeout;

  function debounced(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  }

  debounced.cancel = () => {
    clearTimeout(timeout);
  };

  return debounced;
};

export const rgbaToString = (color: string | { r: number; g: number; b: number; a: number }) => {
  if (typeof color === "string") return color;
  if (typeof color === "object" && color !== null) {
    const { r, g, b, a = 1 } = color;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return "rgba(255, 255, 255, 0.7)";
};

export const rgbaToTailwindClass = (
  color: string | { r: number; g: number; b: number; a: number },
): string => {
  if (typeof color === "string") {
    return color;
  }

  if (typeof color === "object" && color !== null) {
    const { r, g, b, a = 1 } = color;
    const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).padStart(6, "0")}`;
    const opacity = Math.round(a * 100);
    return `${hex}/${opacity}`;
  }

  // Default fallback
  return "#ffffff/10";
};

export const rgbToHsb = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h,
    s,
    v = max;

  const d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.floor(h * 65535), Math.floor(s * 254), Math.floor(v * 254)];
};

export const hexToRgb = (hex: string) => {
  let r = 0,
    g = 0,
    b = 0;
  // 3 digits
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } // 6 digits
  else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }
  return [r, g, b];
};

export const formatTime = (time: number): string => {
  // Convert to milliseconds if the input is in seconds
  const ms = time > 1000 ? time : time * 1000;

  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const formatProgress = (progress: number) => {
  return progress.toFixed(2) + "%";
};

export const hexToRgba = (hex: string | any[], alpha = 1.0) => {
  let r = 0;
  let g = 0;
  let b = 0;
  // Remove the hash at the start if it's there
  hex = typeof hex === "string" ? hex.replace(/^#/, "") : hex;

  if (typeof hex === "string" && hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (typeof hex === "string" && hex.length === 6) {
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  }

  return { r, g, b, a: alpha };
};
