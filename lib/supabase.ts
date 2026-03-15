import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export type Business = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  type: "clinic" | "salon" | "other";
  phone: string;
  address: string;
  description: string;
  is_active: boolean;
  plan: string | null;
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
  created_at: string;
};

export type Service = {
  id: string;
  business_id: string;
  name: string;
  duration_minutes: number;
  price_mzn: number;
  description: string;
};

export type Appointment = {
  id: string;
  business_id: string;
  service_id: string;
  service?: Service;
  client_name: string;
  client_phone: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes: string;
  created_at: string;
};
