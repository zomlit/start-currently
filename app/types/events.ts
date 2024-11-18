export interface Event {
  id: string;
  type: string;
  data: {
    displayName: string;
    amount?: number | string;
  };
  timestamp: number;
}

export interface Alert {
  type: string;
  data: {
    displayName: string;
    amount?: number | string;
  };
}
