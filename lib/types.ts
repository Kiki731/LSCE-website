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
          linkedin_url: string | null
          twitter_url: string | null
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
          linkedin_url: string | null
          twitter_url: string | null
          quote: string | null
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
      orders: {
        Row: {
          id: string
          buyer_name: string
          buyer_email: string
          buyer_phone: string | null
          ticket_type: 'bronze' | 'silver' | 'gold'
          quantity: number
          unit_price: number
          discount_code: string | null
          discount_amount: number
          total_amount: number
          paystack_reference: string | null
          payment_status: 'pending' | 'completed' | 'failed'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      coupons: {
        Row: {
          id:           string
          code:         string
          description:  string | null
          discount_pct: number
          max_uses:     number | null
          times_used:   number
          valid_from:   string | null
          valid_until:  string | null
          is_active:    boolean
          ticket_types: string[] | null
          created_by:   string | null
          created_at:   string
          updated_at:   string
        }
        Insert: Omit<Database['public']['Tables']['coupons']['Row'], 'id' | 'times_used' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['coupons']['Insert']>
      }
      attendees: {
        Row: {
          id: string
          order_id: string
          name: string | null
          email: string
          phone: string | null
          ticket_code: string
          checked_in: boolean
          checked_in_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['attendees']['Row'], 'id' | 'ticket_code' | 'created_at'>
        Update: Partial<Database['public']['Tables']['attendees']['Insert']>
      }
    }
  }
}

/* Convenience types */
export type Speaker      = Database['public']['Tables']['speakers']['Row']
export type TeamMember   = Database['public']['Tables']['team_members']['Row']
export type Ambassador   = Database['public']['Tables']['ambassadors']['Row']
export type Partner      = Database['public']['Tables']['partners']['Row']
export type GalleryImage = Database['public']['Tables']['gallery_images']['Row']
export type TicketPurchase = Database['public']['Tables']['ticket_purchases']['Row']
export type Order        = Database['public']['Tables']['orders']['Row']
export type Attendee     = Database['public']['Tables']['attendees']['Row']
export type Coupon       = Database['public']['Tables']['coupons']['Row']

export type TicketTier     = 'bronze' | 'silver' | 'gold'
export type SpeakerCategory = 'keynote' | 'general'
export type TeamDepartment  = 'organizing' | 'partnerships' | 'design' | 'social' | 'programs'
