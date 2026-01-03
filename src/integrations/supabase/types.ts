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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      countries: {
        Row: {
          code: string
          continent: string
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          name_pt: string | null
        }
        Insert: {
          code: string
          continent: string
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          name_pt?: string | null
        }
        Update: {
          code?: string
          continent?: string
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          name_pt?: string | null
        }
        Relationships: []
      }
      ev_stations: {
        Row: {
          city: string | null
          connector_types: string[] | null
          country_code: string
          created_at: string
          id: string
          installed_at: string | null
          latitude: number
          longitude: number
          num_chargers: number | null
          operator: string | null
          power_kw: number | null
          state: string | null
          status: string | null
        }
        Insert: {
          city?: string | null
          connector_types?: string[] | null
          country_code: string
          created_at?: string
          id?: string
          installed_at?: string | null
          latitude: number
          longitude: number
          num_chargers?: number | null
          operator?: string | null
          power_kw?: number | null
          state?: string | null
          status?: string | null
        }
        Update: {
          city?: string | null
          connector_types?: string[] | null
          country_code?: string
          created_at?: string
          id?: string
          installed_at?: string | null
          latitude?: number
          longitude?: number
          num_chargers?: number | null
          operator?: string | null
          power_kw?: number | null
          state?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ev_stations_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
        ]
      }
      indicadores_energia: {
        Row: {
          created_at: string
          distancia_km_mais_proximo: number | null
          eletropostos_por_100k_hab: number | null
          id: string
          is_vazio_territorial: boolean
          justificativa_vazio: string | null
          municipio_id: string
          populacao_ref: number
          potencia_total_kw: number | null
          qtd_eletropostos: number
          status_cobertura: string
          ultima_analise: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          distancia_km_mais_proximo?: number | null
          eletropostos_por_100k_hab?: number | null
          id?: string
          is_vazio_territorial?: boolean
          justificativa_vazio?: string | null
          municipio_id: string
          populacao_ref?: number
          potencia_total_kw?: number | null
          qtd_eletropostos?: number
          status_cobertura?: string
          ultima_analise?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          distancia_km_mais_proximo?: number | null
          eletropostos_por_100k_hab?: number | null
          id?: string
          is_vazio_territorial?: boolean
          justificativa_vazio?: string | null
          municipio_id?: string
          populacao_ref?: number
          potencia_total_kw?: number | null
          qtd_eletropostos?: number
          status_cobertura?: string
          ultima_analise?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "indicadores_energia_municipio_id_fkey"
            columns: ["municipio_id"]
            isOneToOne: true
            referencedRelation: "municipios"
            referencedColumns: ["id"]
          },
        ]
      }
      municipios: {
        Row: {
          area_km2: number | null
          codigo_ibge: string
          created_at: string
          estado: string
          id: string
          latitude: number | null
          longitude: number | null
          nome: string
          populacao: number
          regiao: string
          updated_at: string
        }
        Insert: {
          area_km2?: number | null
          codigo_ibge: string
          created_at?: string
          estado: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome: string
          populacao?: number
          regiao: string
          updated_at?: string
        }
        Update: {
          area_km2?: number | null
          codigo_ibge?: string
          created_at?: string
          estado?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome?: string
          populacao?: number
          regiao?: string
          updated_at?: string
        }
        Relationships: []
      }
      plan_modules: {
        Row: {
          description: string | null
          id: string
          modules: Database["public"]["Enums"]["app_module"][]
          plan: Database["public"]["Enums"]["app_plan"]
        }
        Insert: {
          description?: string | null
          id?: string
          modules: Database["public"]["Enums"]["app_module"][]
          plan: Database["public"]["Enums"]["app_plan"]
        }
        Update: {
          description?: string | null
          id?: string
          modules?: Database["public"]["Enums"]["app_module"][]
          plan?: Database["public"]["Enums"]["app_plan"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      towers: {
        Row: {
          city: string | null
          country_code: string
          created_at: string
          frequency: string | null
          id: string
          installed_at: string | null
          latitude: number
          longitude: number
          operator: string | null
          state: string | null
          status: string | null
          technology: string | null
        }
        Insert: {
          city?: string | null
          country_code: string
          created_at?: string
          frequency?: string | null
          id?: string
          installed_at?: string | null
          latitude: number
          longitude: number
          operator?: string | null
          state?: string | null
          status?: string | null
          technology?: string | null
        }
        Update: {
          city?: string | null
          country_code?: string
          created_at?: string
          frequency?: string | null
          id?: string
          installed_at?: string | null
          latitude?: number
          longitude?: number
          operator?: string | null
          state?: string | null
          status?: string | null
          technology?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "towers_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
        ]
      }
      user_plans: {
        Row: {
          created_at: string
          id: string
          modules_enabled: Database["public"]["Enums"]["app_module"][]
          plan: Database["public"]["Enums"]["app_plan"]
          updated_at: string
          user_id: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          modules_enabled?: Database["public"]["Enums"]["app_module"][]
          plan?: Database["public"]["Enums"]["app_plan"]
          updated_at?: string
          user_id: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          modules_enabled?: Database["public"]["Enums"]["app_module"][]
          plan?: Database["public"]["Enums"]["app_plan"]
          updated_at?: string
          user_id?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_plan: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_plan"]
      }
      has_module_access: {
        Args: {
          _module: Database["public"]["Enums"]["app_module"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_module:
        | "torres_5g"
        | "eletropostos"
        | "viabilidade"
        | "ambiental"
        | "cenarios"
        | "relatorios"
        | "ia_assistant"
      app_plan: "free" | "telecom" | "ev" | "governo" | "pro"
      app_role: "admin" | "user"
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
      app_module: [
        "torres_5g",
        "eletropostos",
        "viabilidade",
        "ambiental",
        "cenarios",
        "relatorios",
        "ia_assistant",
      ],
      app_plan: ["free", "telecom", "ev", "governo", "pro"],
      app_role: ["admin", "user"],
    },
  },
} as const
