import { WidgetType, WidgetSettings } from "./widget";

export interface Profile {
  id: string;
  user_id: string;
  widget_type: WidgetType;
  name: string;
  settings: WidgetSettings;
  created_at: string;
  updated_at: string;
  color: string;
}
