export interface UserCommand {
  id: string;
  user_id: string;
  c_category: string | null;
  c_name: string;
  c_command: string;
  c_placement: string;
  c_roles: string;
  c_user_cooldown: number;
  c_global_cooldown: number;
  c_enabled: boolean;
  created_at: string;
  updated_at: string;
}
