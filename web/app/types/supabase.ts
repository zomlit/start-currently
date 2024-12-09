export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      VisualizerWidget: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          visualizer_settings: Json | null;
          is_active: boolean;
          is_current: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          visualizer_settings?: Json | null;
          is_active?: boolean;
          is_current?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          visualizer_settings?: Json | null;
          is_active?: boolean;
          is_current?: boolean;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
