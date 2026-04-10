-- ============================================================
-- AgendaMoz — Schema Update (run as a migration)
-- Add these ALTER TABLE statements to your existing schema
-- ============================================================

-- 1. Add page_meta to businesses (stores Empresarial customization as JSON)
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS page_meta TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'none' CHECK (plan IN ('none','basico','profissional','empresarial')),
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Update payments table to support multiple payment methods
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'mpesa' CHECK (payment_method IN ('mpesa','emola','card')),
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','rejected'));

-- Full payments table (if creating from scratch)
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  plan TEXT NOT NULL,
  amount_mzn DECIMAL(10,2) NOT NULL,
  mpesa_reference TEXT UNIQUE,
  payment_method TEXT DEFAULT 'mpesa',
  status TEXT DEFAULT 'pending',
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Team members (if not already created)
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('owner','member')) DEFAULT 'member',
  status TEXT CHECK (status IN ('pending','active','removed')) DEFAULT 'pending',
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE
);

-- 4. RLS for payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Owners can view their payments"
  ON payments FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Anyone can insert a payment"
  ON payments FOR INSERT
  WITH CHECK (true);

-- 5. RLS for team_members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Business owners can manage team"
  ON team_members FOR ALL
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Team members can view their own record"
  ON team_members FOR SELECT
  USING (user_id = auth.uid());

-- 6. Index for faster reminder queries
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(date, time);
