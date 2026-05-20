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
      speakers: {
        Row: {
          id: string
          name: string
          role: string
          bio: string | null
          image_url: string | null
          category: 'keynote' | 'general'
          display_order: number
          is_visible: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['speakers']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['speakers']['Insert']>
      }
      team_members: {
        Row: {
          id: string
          name: string
          role: string
          image_url: string | null
          department: 'organizing' | 'partnerships' | 'design' | 'social' | 'programs'
          display_order: number
          is_visible: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['team_members']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['team_members']['Insert']>
      }
      ambassadors: {
        Row: {
          id: string
          name: string
          school: string | null
          bio: string | null
          image_url: string | null
          display_order: number
          is_visible: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['ambassadors']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['ambassadors']['Insert']>
      }
      partners: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          website_url: string | null
          display_order: number
          is_visible: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['partners']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['partners']['Insert']>
      }
      gallery_images: {
        Row: {
          id: string
          image_url: string
          caption: string | null
          display_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['gallery_images']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['gallery_images']['Insert']>
      }
      ticket_purchases: {
        Row: {
          id: string
          paystack_reference: string
          tier: 'bronze' | 'silver' | 'gold'
          buyer_name: string
          buyer_email: string
          amount: number
          status: 'pending' | 'success' | 'failed'
          checked_in: boolean
          checked_in_at: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['ticket_purchases']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['ticket_purchases']['Insert']>
      }
      site_config: {
        Row: {
          key: string
          value: string
          updated_at: string
        }
        Insert: Database['public']['Tables']['site_config']['Row']
        Update: Partial<Database['public']['Tables']['site_config']['Row']>
      }
    }
  }
}

/* Convenience types */
export type Speaker = Database['public']['Tables']['speakers']['Row']
export type TeamMember = Database['public']['Tables']['team_members']['Row']
export type Ambassador = Database['public']['Tables']['ambassadors']['Row']
export type Partner = Database['public']['Tables']['partners']['Row']
export type GalleryImage = Database['public']['Tables']['gallery_images']['Row']
export type TicketPurchase = Database['public']['Tables']['ticket_purchases']['Row']

export type TicketTier = 'bronze' | 'silver' | 'gold'
export type SpeakerCategory = 'keynote' | 'general'
export type TeamDepartment = 'organizing' | 'partnerships' | 'design' | 'social' | 'programs'
