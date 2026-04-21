export type EmailStatus =
  | "delivered"
  | "opened"
  | "clicked"
  | "hard_bounced"
  | "soft_bounced"
  | "unsubscribed"
  | null;

export type LeadRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  city: string | null;
  county: string | null;
  state: string | null;
  license_number: string | null;
  email_status: EmailStatus;
  is_emailed: boolean;
  created_at: string;
  updated_at: string;
};

export type LeadInsert = Omit<LeadRow, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type CampaignConfigRow = {
  id: string;
  name: string;
  is_active: boolean;
  max_sends_per_day: number;
  days_between_steps: number;
  timezone: string;
  send_window_start_hour: number;
  send_window_end_hour: number;
  /** CRM user whose Gmail is used for automated batch / cron sends */
  sender_user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type CampaignConfigInsert = Omit<
  CampaignConfigRow,
  "id" | "created_at" | "updated_at"
> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type CampaignConfigUpdate = Partial<
  Omit<CampaignConfigRow, "id" | "created_at">
> & { updated_at?: string };

export type CampaignStepRow = {
  id: string;
  campaign_id: string;
  step_index: number;
  subject: string;
  body: string;
};

export type CampaignStepInsert = Omit<CampaignStepRow, "id"> & {
  id?: string;
};

export type LeadSequenceStateRow = {
  lead_id: string;
  last_completed_step: number;
  next_eligible_at: string | null;
  updated_at: string;
};

export type LeadSequenceStateInsert = {
  lead_id: string;
  last_completed_step?: number;
  next_eligible_at?: string | null;
  updated_at?: string;
};

export type OutboundSendLogRow = {
  id: string;
  lead_id: string;
  step_index: number;
  campaign_id: string | null;
  sent_at: string;
  send_calendar_day: string;
  subject_line: string | null;
  body_text: string | null;
};

export type OutboundSendLogInsert = Omit<OutboundSendLogRow, "id"> & {
  id?: string;
};

export type GmailIntegrationRow = {
  user_id: string;
  google_email: string | null;
  refresh_token: string | null;
  connected_at: string | null;
  updated_at: string;
};

export type GmailIntegrationInsert = Omit<GmailIntegrationRow, "updated_at"> & {
  updated_at?: string;
};

export type GmailIntegrationUpdate = Partial<
  Omit<GmailIntegrationRow, "user_id" | "updated_at">
> & { updated_at?: string };

export type Database = {
  public: {
    Tables: {
      leads: {
        Row: LeadRow;
        Insert: LeadInsert;
        Update: Partial<LeadInsert>;
        Relationships: [];
      };
      campaign_config: {
        Row: CampaignConfigRow;
        Insert: CampaignConfigInsert;
        Update: CampaignConfigUpdate;
        Relationships: [];
      };
      campaign_steps: {
        Row: CampaignStepRow;
        Insert: CampaignStepInsert;
        Update: Partial<Omit<CampaignStepRow, "id">>;
        Relationships: [];
      };
      lead_sequence_state: {
        Row: LeadSequenceStateRow;
        Insert: LeadSequenceStateInsert;
        Update: Partial<LeadSequenceStateRow>;
        Relationships: [];
      };
      outbound_send_log: {
        Row: OutboundSendLogRow;
        Insert: OutboundSendLogInsert;
        Update: Partial<Omit<OutboundSendLogRow, "id">>;
        Relationships: [];
      };
      gmail_integration: {
        Row: GmailIntegrationRow;
        Insert: GmailIntegrationInsert;
        Update: GmailIntegrationUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
