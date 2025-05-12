export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      config: {
        Row: {
          id: string
          studio_name: string
          studio_address: string
          consent_text: string
          tutor_consent_text: string
          footer_text: string
          contact_info: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          studio_name: string
          studio_address: string
          consent_text: string
          tutor_consent_text: string
          footer_text: string
          contact_info?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          studio_name?: string
          studio_address?: string
          consent_text?: string
          tutor_consent_text?: string
          footer_text?: string
          contact_info?: Json
          created_at?: string
          updated_at?: string
        }
      }
      artists: {
        Row: {
          id: string
          name: string
          active: boolean
          image_url: string | null
          config_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          active: boolean
          image_url?: string | null
          config_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          active?: boolean
          image_url?: string | null
          config_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      health_questions: {
        Row: {
          id: string
          question: string
          default_answer: boolean
          show_additional_field: boolean
          additional_field_only_if_yes: boolean
          config_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question: string
          default_answer?: boolean
          show_additional_field?: boolean
          additional_field_only_if_yes?: boolean
          config_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question?: string
          default_answer?: boolean
          show_additional_field?: boolean
          additional_field_only_if_yes?: boolean
          config_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      consents: {
        Row: {
          id: string
          code: string
          client_info: Json
          tutor_info: Json | null
          artist_id: string
          client_signature: string
          tutor_signature: string | null
          archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          client_info: Json
          tutor_info?: Json | null
          artist_id: string
          client_signature: string
          tutor_signature?: string | null
          archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          client_info?: Json
          tutor_info?: Json | null
          artist_id?: string
          client_signature?: string
          tutor_signature?: string | null
          archived?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      consent_health_answers: {
        Row: {
          id: string
          consent_id: string
          question_id: string
          answer: boolean
          additional_info: string | null
          created_at: string
        }
        Insert: {
          id?: string
          consent_id: string
          question_id: string
          answer: boolean
          additional_info?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          consent_id?: string
          question_id?: string
          answer?: boolean
          additional_info?: string | null
          created_at?: string
        }
      }
    }
  }
}