export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      AlertWidget: {
        Row: {
          alertTypes: Json
          customSounds: Json | null
          duration: number
          id: string
          user_id: string
          volume: number
        }
        Insert: {
          alertTypes: Json
          customSounds?: Json | null
          duration: number
          id?: string
          user_id?: string
          volume: number
        }
        Update: {
          alertTypes?: Json
          customSounds?: Json | null
          duration?: number
          id?: string
          user_id?: string
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "AlertWidget_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Bracket: {
        Row: {
          assigned_users: string[] | null
          created_at: string
          data: Json
          id: string
          is_complete: boolean
          name: string
          owner_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_users?: string[] | null
          created_at?: string
          data: Json
          id?: string
          is_complete?: boolean
          name: string
          owner_id: string
          updated_at: string
          user_id?: string
        }
        Update: {
          assigned_users?: string[] | null
          created_at?: string
          data?: Json
          id?: string
          is_complete?: boolean
          name?: string
          owner_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Bracket_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      BTTVEmoteCache: {
        Row: {
          channelId: string
          emotes: Json
          updatedAt: string
        }
        Insert: {
          channelId: string
          emotes: Json
          updatedAt?: string
        }
        Update: {
          channelId?: string
          emotes?: Json
          updatedAt?: string
        }
        Relationships: []
      }
      ChannelBadgeCache: {
        Row: {
          badges: Json
          broadcasterId: string
          updatedAt: string
        }
        Insert: {
          badges: Json
          broadcasterId: string
          updatedAt?: string
        }
        Update: {
          badges?: Json
          broadcasterId?: string
          updatedAt?: string
        }
        Relationships: []
      }
      ChatMessage: {
        Row: {
          avatar: string
          badges: Json
          channel: string
          color: string
          emotes: Json
          id: string
          message: string
          timestamp: string
          user_id: string
          username: string
          userStatus: Json
        }
        Insert: {
          avatar: string
          badges: Json
          channel: string
          color: string
          emotes: Json
          id: string
          message: string
          timestamp?: string
          user_id?: string
          username: string
          userStatus: Json
        }
        Update: {
          avatar?: string
          badges?: Json
          channel?: string
          color?: string
          emotes?: Json
          id?: string
          message?: string
          timestamp?: string
          user_id?: string
          username?: string
          userStatus?: Json
        }
        Relationships: []
      }
      ChatWidget: {
        Row: {
          customCss: string | null
          emoteSize: number
          id: string
          layout: string
          showBadges: boolean
          user_id: string
        }
        Insert: {
          customCss?: string | null
          emoteSize: number
          id?: string
          layout: string
          showBadges: boolean
          user_id?: string
        }
        Update: {
          customCss?: string | null
          emoteSize?: number
          id?: string
          layout?: string
          showBadges?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ChatWidget_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      ConfigWidget: {
        Row: {
          configType: string
          id: string
          settings: Json
          user_id: string
        }
        Insert: {
          configType: string
          id?: string
          settings: Json
          user_id?: string
        }
        Update: {
          configType?: string
          id?: string
          settings?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ConfigWidget_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      GameOverlayWidget: {
        Row: {
          customization: Json
          game: string
          id: string
          overlayType: string
          user_id: string
        }
        Insert: {
          customization: Json
          game: string
          id?: string
          overlayType: string
          user_id?: string
        }
        Update: {
          customization?: Json
          game?: string
          id?: string
          overlayType?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "GameOverlayWidget_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      GamepadWidget: {
        Row: {
          id: string
          layout: Json
          showPressedButtons: boolean
          style: string
          user_id: string
        }
        Insert: {
          id?: string
          layout: Json
          showPressedButtons: boolean
          style: string
          user_id?: string
        }
        Update: {
          id?: string
          layout?: Json
          showPressedButtons?: boolean
          style?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "GamepadWidget_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      GameStatWidget: {
        Row: {
          game: string
          id: string
          stats: Json
          updateInterval: number
          user_id: string
        }
        Insert: {
          game: string
          id?: string
          stats: Json
          updateInterval: number
          user_id?: string
        }
        Update: {
          game?: string
          id?: string
          stats?: Json
          updateInterval?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "GameStatWidget_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      GlobalBadgeCache: {
        Row: {
          badges: Json
          id: number
          updatedAt: string
        }
        Insert: {
          badges: Json
          id?: number
          updatedAt?: string
        }
        Update: {
          badges?: Json
          id?: number
          updatedAt?: string
        }
        Relationships: []
      }
      Layout: {
        Row: {
          created_at: string
          id: string
          layout: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          layout: Json
          updated_at: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          layout?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Layout_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Profiles: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_current: boolean | null
          name: string
          settings: Json
          updated_at: string | null
          user_id: string
          widget_type: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_current?: boolean | null
          name: string
          settings: Json
          updated_at?: string | null
          user_id?: string
          widget_type: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_current?: boolean | null
          name?: string
          settings?: Json
          updated_at?: string | null
          user_id?: string
          widget_type?: string
        }
        Relationships: []
      }
      SectionProfiles: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          name: string
          section_id: string
          settings: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          section_id: string
          settings?: Json
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          section_id?: string
          settings?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Profile_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      SevenTVEmoteCache: {
        Row: {
          channelId: string
          emotes: Json
          updatedAt: string
        }
        Insert: {
          channelId: string
          emotes: Json
          updatedAt?: string
        }
        Update: {
          channelId?: string
          emotes?: Json
          updatedAt?: string
        }
        Relationships: []
      }
      table_metadata: {
        Row: {
          real_time_enabled: boolean
          table_name: string
        }
        Insert: {
          real_time_enabled: boolean
          table_name: string
        }
        Update: {
          real_time_enabled?: boolean
          table_name?: string
        }
        Relationships: []
      }
      TimerWidget: {
        Row: {
          duration: number | null
          endTime: string | null
          format: string
          id: string
          timerType: string
          user_id: string
        }
        Insert: {
          duration?: number | null
          endTime?: string | null
          format: string
          id?: string
          timerType: string
          user_id?: string
        }
        Update: {
          duration?: number | null
          endTime?: string | null
          format?: string
          id?: string
          timerType?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "TimerWidget_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      TwitchUserCache: {
        Row: {
          broadcaster_type: string
          createdAt: string
          description: string
          display_name: string
          id: string
          login: string
          profile_image_url: string
          updatedAt: string
        }
        Insert: {
          broadcaster_type: string
          createdAt?: string
          description: string
          display_name: string
          id: string
          login: string
          profile_image_url: string
          updatedAt: string
        }
        Update: {
          broadcaster_type?: string
          createdAt?: string
          description?: string
          display_name?: string
          id?: string
          login?: string
          profile_image_url?: string
          updatedAt?: string
        }
        Relationships: []
      }
      User: {
        Row: {
          created_at: string
          email: string | null
          id: string
          session: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          session?: Json | null
          updated_at: string
          user_id?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          session?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      UserCommands: {
        Row: {
          c_category: string | null
          c_command: string
          c_enabled: boolean
          c_global_cooldown: number
          c_name: string
          c_placement: string
          c_roles: string
          c_user_cooldown: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          c_category?: string | null
          c_command: string
          c_enabled?: boolean
          c_global_cooldown: number
          c_name: string
          c_placement: string
          c_roles: string
          c_user_cooldown: number
          created_at?: string
          id?: string
          updated_at: string
          user_id?: string
        }
        Update: {
          c_category?: string | null
          c_command?: string
          c_enabled?: boolean
          c_global_cooldown?: number
          c_name?: string
          c_placement?: string
          c_roles?: string
          c_user_cooldown?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "UserCommands_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      UserProfile: {
        Row: {
          avatarUrl: string | null
          bio: string | null
          broadcastChannel: string | null
          created_at: string
          displayName: string | null
          google_tokens: Json | null
          id: string
          is_active: boolean
          refreshToken: string | null
          s_access_token: string | null
          s_client_id: string | null
          s_client_secret: string | null
          s_expires_at: string | null
          s_refresh_token: string | null
          s_sp_dc: string | null
          selectedUsername: string | null
          selectedUsernameToken: string | null
          session: Json | null
          socialLinks: Json | null
          streamelements_jwt: string | null
          twitch_tokens: Json | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatarUrl?: string | null
          bio?: string | null
          broadcastChannel?: string | null
          created_at?: string
          displayName?: string | null
          google_tokens?: Json | null
          id?: string
          is_active?: boolean
          refreshToken?: string | null
          s_access_token?: string | null
          s_client_id?: string | null
          s_client_secret?: string | null
          s_expires_at?: string | null
          s_refresh_token?: string | null
          s_sp_dc?: string | null
          selectedUsername?: string | null
          selectedUsernameToken?: string | null
          session?: Json | null
          socialLinks?: Json | null
          streamelements_jwt?: string | null
          twitch_tokens?: Json | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatarUrl?: string | null
          bio?: string | null
          broadcastChannel?: string | null
          created_at?: string
          displayName?: string | null
          google_tokens?: Json | null
          id?: string
          is_active?: boolean
          refreshToken?: string | null
          s_access_token?: string | null
          s_client_id?: string | null
          s_client_secret?: string | null
          s_expires_at?: string | null
          s_refresh_token?: string | null
          s_sp_dc?: string | null
          selectedUsername?: string | null
          selectedUsernameToken?: string | null
          session?: Json | null
          socialLinks?: Json | null
          streamelements_jwt?: string | null
          twitch_tokens?: Json | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "UserProfile_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      VisualizerWidget: {
        Row: {
          colorScheme: string
          id: string
          sensitivity: number
          track: Json | null
          type: string
          user_id: string
          visualization: Json
        }
        Insert: {
          colorScheme: string
          id?: string
          sensitivity: number
          track?: Json | null
          type: string
          user_id?: string
          visualization: Json
        }
        Update: {
          colorScheme?: string
          id?: string
          sensitivity?: number
          track?: Json | null
          type?: string
          user_id?: string
          visualization?: Json
        }
        Relationships: [
          {
            foreignKeyName: "VisualizerWidget_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Waitlist: {
        Row: {
          createdAt: string
          email: string
          id: string
        }
        Insert: {
          createdAt?: string
          email: string
          id: string
        }
        Update: {
          createdAt?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_policy_if_not_exists: {
        Args: {
          table_name: string
          policy_name: string
          policy_type: string
          policy_using: string
        }
        Returns: undefined
      }
      ensure_user_id_column: {
        Args: {
          target_table: string
        }
        Returns: undefined
      }
      get_user_tables: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
        }[]
      }
      requesting_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      test_userprofile_rls: {
        Args: Record<PropertyKey, never>
        Returns: {
          operation: string
          result: boolean
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
