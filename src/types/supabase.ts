// Auto-generated Supabase types
// This file should be regenerated when the database schema changes

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
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          company_name: string | null;
          avatar_url: string | null;
          subscription_tier: 'free' | 'starter' | 'growth' | 'scale';
          subscription_status: 'active' | 'canceled' | 'past_due' | 'trialing';
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          company_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: 'free' | 'starter' | 'growth' | 'scale';
          subscription_status?: 'active' | 'canceled' | 'past_due' | 'trialing';
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          company_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: 'free' | 'starter' | 'growth' | 'scale';
          subscription_status?: 'active' | 'canceled' | 'past_due' | 'trialing';
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          color: string;
          icon: string;
          position: number;
          is_expanded: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          color?: string;
          icon?: string;
          position?: number;
          is_expanded?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          color?: string;
          icon?: string;
          position?: number;
          is_expanded?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      analyses: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          name: string;
          type: 'valuation' | 'whatsnext' | 'actionplan' | 'full';
          data: Json;
          is_favorite: boolean;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          name: string;
          type: 'valuation' | 'whatsnext' | 'actionplan' | 'full';
          data?: Json;
          is_favorite?: boolean;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string | null;
          name?: string;
          type?: 'valuation' | 'whatsnext' | 'actionplan' | 'full';
          data?: Json;
          is_favorite?: boolean;
          position?: number;
          created_at?: string;
          updated_at?: string;
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
      subscription_tier: 'free' | 'starter' | 'growth' | 'scale';
      subscription_status: 'active' | 'canceled' | 'past_due' | 'trialing';
      analysis_type: 'valuation' | 'whatsnext' | 'actionplan' | 'full';
    };
  };
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Project = Database['public']['Tables']['projects']['Row'];
export type Analysis = Database['public']['Tables']['analyses']['Row'];

export type SubscriptionTier = Database['public']['Enums']['subscription_tier'];
export type SubscriptionStatus = Database['public']['Enums']['subscription_status'];
