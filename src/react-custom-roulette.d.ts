declare module 'react-custom-roulette' {
  export interface WheelData {
    option: string;
  }

  export interface WheelProps {
    mustStartSpinning: boolean;
    prizeNumber: number;
    data: WheelData[];
    onStopSpinning: () => void;
    backgroundColors?: string[];
    textColors?: string[];
    outerBorderColor?: string;
    outerBorderWidth?: number;
    innerRadius?: number;
    innerBorderColor?: string;
    innerBorderWidth?: number;
    radiusLineColor?: string;
    radiusLineWidth?: number;
    fontSize?: number;
    textDistance?: number;
    perpendicularText?: boolean;
  }

  export const Wheel: React.FC<WheelProps>;
}
