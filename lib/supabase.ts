import { createBrowserClient } from "@supabase/ssr";

// @supabase/ssr é o pacote oficial para Next.js App Router
// Compatível com supabase-js v2.x — resolve o problema de cookies
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Plan limits
export const PLAN_LIMITS = {
  none:          { appointments: 0,  members: 1, sms: false, reports: false, whatsapp: false },
  basico:        { appointments: 50, members: 1, sms: false, reports: false, whatsapp: false },
  profissional:  { appointments: -1, members: 5, sms: true,  reports: true,  whatsapp: true  },
  empresarial:   { appointments: -1, members: -1, sms: true, reports: true,  whatsapp: true  },
} as const;

export type PlanKey = keyof typeof PLAN_LIMITS;

export function getPlanLimits(plan: string | null) {
  const key = (plan || "none") as PlanKey;
  return PLAN_LIMITS[key] ?? PLAN_LIMITS.none;
}

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

export type TeamMember = {
  id: string;
  business_id: string;
  user_id: string | null;
  email: string;
  name: string | null;
  role: "owner" | "member";
  status: "pending" | "active" | "removed";
  invited_at: string;
  joined_at: string | null;
};
