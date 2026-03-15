-- AgendaMoz Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Businesses table
CREATE TABLE businesses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT CHECK (type IN ('clinic', 'salon', 'other')) DEFAULT 'other',
  phone TEXT,
  address TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  price_mzn DECIMAL(10,2) NOT NULL DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Businesses policies
CREATE POLICY "Owners can manage their businesses"
  ON businesses FOR ALL
  USING (auth.uid() = owner_id);

CREATE POLICY "Public can view businesses"
  ON businesses FOR SELECT
  USING (true);

-- Services policies
CREATE POLICY "Business owners can manage services"
  ON services FOR ALL
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Public can view active services"
  ON services FOR SELECT
  USING (is_active = true);

-- Appointments policies
CREATE POLICY "Business owners can manage appointments"
  ON appointments FOR ALL
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create an appointment"
  ON appointments FOR INSERT
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_businesses_owner ON businesses(owner_id);
CREATE INDEX idx_appointments_business ON appointments(business_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_services_business ON services(business_id);
