export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      achievement_definitions: {
        Row: {
          description: string
          key: string
          name: string
          sort_order: number
          teaser: string
          xp_reward: number
        }
        Insert: {
          description: string
          key: string
          name: string
          sort_order: number
          teaser: string
          xp_reward?: number
        }
        Update: {
          description?: string
          key?: string
          name?: string
          sort_order?: number
          teaser?: string
          xp_reward?: number
        }
        Relationships: []
      }
      captures: {
        Row: {
          content: string
          created_at: string | null
          decision: Database["public"]["Enums"]["capture_decision"] | null
          id: string
          status: Database["public"]["Enums"]["capture_status"]
          triaged_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          decision?: Database["public"]["Enums"]["capture_decision"] | null
          id?: string
          status?: Database["public"]["Enums"]["capture_status"]
          triaged_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          decision?: Database["public"]["Enums"]["capture_decision"] | null
          id?: string
          status?: Database["public"]["Enums"]["capture_status"]
          triaged_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_commitments: {
        Row: {
          completed_sessions: number | null
          created_at: string | null
          date: string
          id: string
          target_sessions: number
          user_id: string
        }
        Insert: {
          completed_sessions?: number | null
          created_at?: string | null
          date: string
          id?: string
          target_sessions: number
          user_id: string
        }
        Update: {
          completed_sessions?: number | null
          created_at?: string | null
          date?: string
          id?: string
          target_sessions?: number
          user_id?: string
        }
        Relationships: []
      }
      parking_lot: {
        Row: {
          capture_id: string | null
          content: string
          id: string
          parked_at: string | null
          user_id: string
        }
        Insert: {
          capture_id?: string | null
          content: string
          id?: string
          parked_at?: string | null
          user_id: string
        }
        Update: {
          capture_id?: string | null
          content?: string
          id?: string
          parked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parking_lot_capture_id_fkey"
            columns: ["capture_id"]
            isOneToOne: false
            referencedRelation: "captures"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_records: {
        Row: {
          achieved_on: string
          created_at: string | null
          id: string
          metadata: Json | null
          record_type: Database["public"]["Enums"]["record_type"]
          user_id: string
          value: number
        }
        Insert: {
          achieved_on: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          record_type: Database["public"]["Enums"]["record_type"]
          user_id: string
          value: number
        }
        Update: {
          achieved_on?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          record_type?: Database["public"]["Enums"]["record_type"]
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      projects: {
        Row: {
          accuracy: Database["public"]["Enums"]["project_accuracy"] | null
          benefit: number
          category: Database["public"]["Enums"]["project_category"]
          completed_at: string | null
          confidence: Database["public"]["Enums"]["project_confidence"]
          cost: number
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          is_boss_battle: boolean | null
          name: string
          priority: Database["public"]["Enums"]["project_priority"]
          status: Database["public"]["Enums"]["project_status"]
          tags: string[] | null
          user_id: string
          was_boss_battle: boolean | null
          x: number
          y: number
        }
        Insert: {
          accuracy?: Database["public"]["Enums"]["project_accuracy"] | null
          benefit: number
          category: Database["public"]["Enums"]["project_category"]
          completed_at?: string | null
          confidence: Database["public"]["Enums"]["project_confidence"]
          cost: number
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_boss_battle?: boolean | null
          name: string
          priority: Database["public"]["Enums"]["project_priority"]
          status?: Database["public"]["Enums"]["project_status"]
          tags?: string[] | null
          user_id: string
          was_boss_battle?: boolean | null
          x: number
          y: number
        }
        Update: {
          accuracy?: Database["public"]["Enums"]["project_accuracy"] | null
          benefit?: number
          category?: Database["public"]["Enums"]["project_category"]
          completed_at?: string | null
          confidence?: Database["public"]["Enums"]["project_confidence"]
          cost?: number
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_boss_battle?: boolean | null
          name?: string
          priority?: Database["public"]["Enums"]["project_priority"]
          status?: Database["public"]["Enums"]["project_status"]
          tags?: string[] | null
          user_id?: string
          was_boss_battle?: boolean | null
          x?: number
          y?: number
        }
        Relationships: []
      }
      sessions: {
        Row: {
          completed: boolean | null
          date: string
          duration: number
          ended_at: string | null
          id: string
          mindset: Database["public"]["Enums"]["session_mindset"] | null
          project_id: string
          started_at: string | null
          user_id: string
          willpower: Database["public"]["Enums"]["session_willpower"]
          xp_breakdown: Json | null
          xp_earned: number | null
        }
        Insert: {
          completed?: boolean | null
          date?: string
          duration: number
          ended_at?: string | null
          id?: string
          mindset?: Database["public"]["Enums"]["session_mindset"] | null
          project_id: string
          started_at?: string | null
          user_id: string
          willpower: Database["public"]["Enums"]["session_willpower"]
          xp_breakdown?: Json | null
          xp_earned?: number | null
        }
        Update: {
          completed?: boolean | null
          date?: string
          duration?: number
          ended_at?: string | null
          id?: string
          mindset?: Database["public"]["Enums"]["session_mindset"] | null
          project_id?: string
          started_at?: string | null
          user_id?: string
          willpower?: Database["public"]["Enums"]["session_willpower"]
          xp_breakdown?: Json | null
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_key: string
          id: string
          unlocked_at: string | null
          user_id: string
          xp_awarded: number
        }
        Insert: {
          achievement_key: string
          id?: string
          unlocked_at?: string | null
          user_id: string
          xp_awarded: number
        }
        Update: {
          achievement_key?: string
          id?: string
          unlocked_at?: string | null
          user_id?: string
          xp_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_key_fkey"
            columns: ["achievement_key"]
            isOneToOne: false
            referencedRelation: "achievement_definitions"
            referencedColumns: ["key"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          current_streak: number | null
          display_name: string | null
          id: string
          is_beta_user: boolean | null
          onboarded_at: string | null
          preferences: Json | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          display_name?: string | null
          id?: string
          is_beta_user?: boolean | null
          onboarded_at?: string | null
          preferences?: Json | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          display_name?: string | null
          id?: string
          is_beta_user?: boolean | null
          onboarded_at?: string | null
          preferences?: Json | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      week_streaks: {
        Row: {
          created_at: string | null
          has_session: boolean | null
          id: string
          sessions_count: number | null
          total_minutes: number | null
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string | null
          has_session?: boolean | null
          id?: string
          sessions_count?: number | null
          total_minutes?: number | null
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string | null
          has_session?: boolean | null
          id?: string
          sessions_count?: number | null
          total_minutes?: number | null
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      xp_tracking: {
        Row: {
          earned_at: string | null
          id: string
          points: number
          source_id: string | null
          source_type: Database["public"]["Enums"]["xp_source"]
          user_id: string
          week_start: string
        }
        Insert: {
          earned_at?: string | null
          id?: string
          points: number
          source_id?: string | null
          source_type: Database["public"]["Enums"]["xp_source"]
          user_id: string
          week_start: string
        }
        Update: {
          earned_at?: string | null
          id?: string
          points?: number
          source_id?: string | null
          source_type?: Database["public"]["Enums"]["xp_source"]
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_project_xp: {
        Args: { p_benefit: number; p_cost: number; p_is_boss_battle: boolean }
        Returns: number
      }
      calculate_session_xp: {
        Args: {
          p_duration: number
          p_willpower: Database["public"]["Enums"]["session_willpower"]
        }
        Returns: number
      }
      calculate_ui_coordinates: {
        Args: { p_benefit: number; p_cost: number }
        Returns: {
          x: number
          y: number
        }[]
      }
      check_and_unlock_achievements: {
        Args: { p_user_id: string }
        Returns: {
          achievement_key: string
          newly_unlocked: boolean
        }[]
      }
      get_user_achievement_stats: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_week_start: {
        Args: { p_date: string; p_timezone: string }
        Returns: string
      }
      increment_daily_sessions: {
        Args: { p_target_date: string; p_user_id: string }
        Returns: undefined
      }
      set_boss_battle: {
        Args: { p_project_id: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      capture_decision:
        | "project"
        | "parking_lot"
        | "doing_now"
        | "routing"
        | "deleted"
      capture_status: "pending" | "triaged" | "deleted"
      project_accuracy: "1" | "2" | "3" | "4" | "5"
      project_category: "work" | "learn" | "build" | "manage"
      project_confidence: "very_high" | "high" | "medium" | "low" | "very_low"
      project_priority: "must" | "should" | "nice"
      project_status: "active" | "inactive" | "completed" | "abandoned"
      record_type:
        | "best_day_sessions"
        | "best_week_sessions"
        | "max_week_points"
        | "longest_streak"
      session_mindset: "excellent" | "good" | "challenging"
      session_willpower: "high" | "medium" | "low"
      xp_source: "project_completion" | "session_completion" | "achievement"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      capture_decision: [
        "project",
        "parking_lot",
        "doing_now",
        "routing",
        "deleted",
      ],
      capture_status: ["pending", "triaged", "deleted"],
      project_accuracy: ["1", "2", "3", "4", "5"],
      project_category: ["work", "learn", "build", "manage"],
      project_confidence: ["very_high", "high", "medium", "low", "very_low"],
      project_priority: ["must", "should", "nice"],
      project_status: ["active", "inactive", "completed", "abandoned"],
      record_type: [
        "best_day_sessions",
        "best_week_sessions",
        "max_week_points",
        "longest_streak",
      ],
      session_mindset: ["excellent", "good", "challenging"],
      session_willpower: ["high", "medium", "low"],
      xp_source: ["project_completion", "session_completion", "achievement"],
    },
  },
} as const