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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      budget_categories: {
        Row: {
          budget_id: string
          category: string
          created_at: string
          id: string
          limit: number
          updated_at: string
        }
        Insert: {
          budget_id: string
          category: string
          created_at?: string
          id?: string
          limit?: number
          updated_at?: string
        }
        Update: {
          budget_id?: string
          category?: string
          created_at?: string
          id?: string
          limit?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_categories_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          month: number | null
          name: string | null
          period_type: string
          start_date: string | null
          total_limit: number
          updated_at: string
          user_id: string
          year: number | null
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          month?: number | null
          name?: string | null
          period_type: string
          start_date?: string | null
          total_limit?: number
          updated_at?: string
          user_id: string
          year?: number | null
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          month?: number | null
          name?: string | null
          period_type?: string
          start_date?: string | null
          total_limit?: number
          updated_at?: string
          user_id?: string
          year?: number | null
        }
        Relationships: []
      }
      monthly_summaries: {
        Row: {
          balance: number
          created_at: string
          expenses: number
          id: string
          income: number
          month: number
          transaction_count: number
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          balance?: number
          created_at?: string
          expenses?: number
          id?: string
          income?: number
          month: number
          transaction_count?: number
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          balance?: number
          created_at?: string
          expenses?: number
          id?: string
          income?: number
          month?: number
          transaction_count?: number
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      page_headers: {
        Row: {
          alt_text: string
          created_at: string
          height_desktop: string
          height_mobile: string
          id: string
          image_url: string
          is_active: boolean
          mobile_image_url: string | null
          overlay_opacity: number
          page_identifier: string
          subtitle: string | null
          text_color: string
          title: string
          updated_at: string
        }
        Insert: {
          alt_text: string
          created_at?: string
          height_desktop?: string
          height_mobile?: string
          id?: string
          image_url: string
          is_active?: boolean
          mobile_image_url?: string | null
          overlay_opacity?: number
          page_identifier: string
          subtitle?: string | null
          text_color?: string
          title: string
          updated_at?: string
        }
        Update: {
          alt_text?: string
          created_at?: string
          height_desktop?: string
          height_mobile?: string
          id?: string
          image_url?: string
          is_active?: boolean
          mobile_image_url?: string | null
          overlay_opacity?: number
          page_identifier?: string
          subtitle?: string | null
          text_color?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          preferred_name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          preferred_name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          preferred_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      susu_goals: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          saved: number
          target: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          saved?: number
          target: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          saved?: number
          target?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          date: string
          id: string
          note: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          date?: string
          id?: string
          note?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          date?: string
          id?: string
          note?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      recalculate_monthly_summary: {
        Args: { p_month: number; p_user_id: string; p_year: number }
        Returns: undefined
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
    Enums: {},
  },
} as const
