import { ColorTheme, ThemePreset } from '../types/team-picker';

export const colorThemes: Record<ThemePreset, ColorTheme> = {
  random: {
    name: 'Random Dark',
    description: 'Random dark colors with subtle variations',
    generateColors: () => {
      const hue = Math.floor(Math.random() * 360);
      const saturation = 30 + Math.floor(Math.random() * 20);
      const lightness = 15 + Math.floor(Math.random() * 10);
      const alpha = 0.3 + Math.random() * 0.2;
      
      return {
        background: `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`,
        border: `hsla(${hue}, ${saturation}%, ${Math.min(lightness + 10, 35)}%, ${Math.min(alpha + 0.2, 0.7)})`
      };
    }
  },
  holiday: {
    name: 'Holiday',
    description: 'Festive red and green colors',
    generateColors: () => {
      const isRed = Math.random() > 0.5;
      const hue = isRed ? 0 : 120; // Red or Green
      return {
        background: `hsla(${hue}, 50%, 20%, 0.3)`,
        border: `hsla(${hue}, 60%, 30%, 0.5)`
      };
    }
  },
  neon: {
    name: 'Neon',
    description: 'Bright neon colors',
    generateColors: () => {
      const neonHues = [280, 180, 130, 330]; // Purple, Cyan, Yellow, Pink
      const hue = neonHues[Math.floor(Math.random() * neonHues.length)];
      return {
        background: `hsla(${hue}, 80%, 20%, 0.3)`,
        border: `hsla(${hue}, 90%, 40%, 0.5)`
      };
    }
  },
  pastel: {
    name: 'Pastel',
    description: 'Soft pastel colors',
    generateColors: () => {
      const pastelHues = [350, 160, 200, 40, 280]; // Pink, Mint, Sky, Yellow, Lavender
      const hue = pastelHues[Math.floor(Math.random() * pastelHues.length)];
      return {
        background: `hsla(${hue}, 30%, 25%, 0.3)`,
        border: `hsla(${hue}, 40%, 35%, 0.5)`
      };
    }
  },
  ocean: {
    name: 'Ocean',
    description: 'Deep sea blues and teals',
    generateColors: () => {
      const oceanHues = [200, 180, 220]; // Blue, Teal, Deep Blue
      const hue = oceanHues[Math.floor(Math.random() * oceanHues.length)];
      return {
        background: `hsla(${hue}, 50%, 20%, 0.3)`,
        border: `hsla(${hue}, 60%, 30%, 0.5)`
      };
    }
  },
  forest: {
    name: 'Forest',
    description: 'Natural green and brown tones',
    generateColors: () => {
      const forestHues = [120, 90, 45]; // Green, Yellow-Green, Brown
      const hue = forestHues[Math.floor(Math.random() * forestHues.length)];
      return {
        background: `hsla(${hue}, 40%, 20%, 0.3)`,
        border: `hsla(${hue}, 50%, 30%, 0.5)`
      };
    }
  }
}; 