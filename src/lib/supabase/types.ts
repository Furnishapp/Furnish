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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      organizations: {
        Row: {
          id:             string
          owner_id:       string
          name:           string
          slug:           string
          type:           string
          logo_url:       string | null
          primary_color:  string | null
          metadata:       Json
          created_at:     string
          updated_at:     string
          deleted_at:     string | null
        }
        Insert: {
          id?:            string
          owner_id:       string
          name:           string
          slug:           string
          type?:          string
          logo_url?:      string | null
          primary_color?: string | null
          metadata?:      Json
          created_at?:    string
          updated_at?:    string
          deleted_at?:    string | null
        }
        Update: {
          id?:            string
          owner_id?:      string
          name?:          string
          slug?:          string
          type?:          string
          logo_url?:      string | null
          primary_color?: string | null
          metadata?:      Json
          created_at?:    string
          updated_at?:    string
          deleted_at?:    string | null
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          id:              string
          organization_id: string
          user_id:         string
          role:            string
          invited_by:      string | null
          joined_at:       string
        }
        Insert: {
          id?:             string
          organization_id: string
          user_id:         string
          role?:           string
          invited_by?:     string | null
          joined_at?:      string
        }
        Update: {
          id?:             string
          organization_id?: string
          user_id?:        string
          role?:           string
          invited_by?:     string | null
          joined_at?:      string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      links: {
        Row: {
          created_at: string
          description: string
          id: string
          image: string
          price: string
          title: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          image?: string
          price?: string
          title?: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          image?: string
          price?: string
          title?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          cover_url:       string | null
          created_at:      string
          description:     string
          id:              string
          name:            string
          organization_id: string
          status:          string
          updated_at:      string
          user_id:         string
        }
        Insert: {
          cover_url?:       string | null
          created_at?:      string
          description?:     string
          id?:              string
          name:             string
          organization_id:  string
          status?:          string
          updated_at?:      string
          user_id?:         string
        }
        Update: {
          cover_url?:       string | null
          created_at?:      string
          description?:     string
          id?:              string
          name?:            string
          organization_id?: string
          status?:          string
          updated_at?:      string
          user_id?:         string
        }
        Relationships: [
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      room_links: {
        Row: {
          created_at: string
          height: number
          id: string
          link_id: string
          position_x: number
          position_y: number
          room_id: string
          show_caption: boolean
          status: string
          width: number
        }
        Insert: {
          created_at?: string
          height?: number
          id?: string
          link_id: string
          position_x?: number
          position_y?: number
          room_id: string
          show_caption?: boolean
          status?: string
          width?: number
        }
        Update: {
          created_at?: string
          height?: number
          id?: string
          link_id?: string
          position_x?: number
          position_y?: number
          room_id?: string
          show_caption?: boolean
          status?: string
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "room_links_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_links_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          created_at: string
          description: string
          id: string
          mood_colors: string[]
          mood_images: string[]
          name: string
          position_x: number
          position_y: number
          project_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          mood_colors?: string[]
          mood_images?: string[]
          name: string
          position_x?: number
          position_y?: number
          project_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          mood_colors?: string[]
          mood_images?: string[]
          name?: string
          position_x?: number
          position_y?: number
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_presentations: {
        Row: {
          created_at: string
          created_by: string
          id: string
          project_id: string
          share_token: string
          slides_data: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          project_id: string
          share_token?: string
          slides_data?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          project_id?: string
          share_token?: string
          slides_data?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_presentations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_projects: {
        Args: never
        Returns: {
          product_count: number
          project_created_at: string
          project_id: string
          project_name: string
          user_id: string
        }[]
      }
      get_admin_stats: {
        Args: never
        Returns: {
          product_count: number
          project_count: number
          user_created_at: string
          user_email: string
          user_id: string
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
