-- =============================================
-- COMSATS Event Hub - Supabase SQL Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  full_name TEXT NOT NULL,
  roll_no TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  venue TEXT,
  event_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create event_requests table
CREATE TABLE public.event_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, student_id)
);

-- =============================================
-- Enable Row Level Security
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_requests ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies: profiles
-- =============================================
-- Anyone authenticated can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can view all profiles (uses JWT metadata to avoid recursion)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    (auth.jwt()->'user_metadata'->>'role')::text = 'admin'
  );

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- =============================================
-- RLS Policies: events
-- =============================================
CREATE POLICY "Anyone can view events"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert events"
  ON public.events FOR INSERT
  WITH CHECK (
    (auth.jwt()->'user_metadata'->>'role')::text = 'admin'
  );

CREATE POLICY "Admins can update events"
  ON public.events FOR UPDATE
  USING (
    (auth.jwt()->'user_metadata'->>'role')::text = 'admin'
  );

CREATE POLICY "Admins can delete events"
  ON public.events FOR DELETE
  USING (
    (auth.jwt()->'user_metadata'->>'role')::text = 'admin'
  );

-- =============================================
-- RLS Policies: event_requests
-- =============================================
CREATE POLICY "Students can view own requests"
  ON public.event_requests FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Admins can view all requests"
  ON public.event_requests FOR SELECT
  USING (
    (auth.jwt()->'user_metadata'->>'role')::text = 'admin'
  );

CREATE POLICY "Students can insert own requests"
  ON public.event_requests FOR INSERT
  WITH CHECK (
    student_id = auth.uid()
  );

CREATE POLICY "Students can cancel own pending requests"
  ON public.event_requests FOR UPDATE
  USING (
    student_id = auth.uid() AND status = 'pending'
  );

CREATE POLICY "Students can delete own requests"
  ON public.event_requests FOR DELETE
  USING (
    student_id = auth.uid()
  );

CREATE POLICY "Admins can update any request"
  ON public.event_requests FOR UPDATE
  USING (
    (auth.jwt()->'user_metadata'->>'role')::text = 'admin'
  );

CREATE POLICY "Admins can delete any request"
  ON public.event_requests FOR DELETE
  USING (
    (auth.jwt()->'user_metadata'->>'role')::text = 'admin'
  );

-- =============================================
-- Trigger: Auto-create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, roll_no, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'roll_no',
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Enable Realtime for relevant tables
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_requests;

-- =============================================
-- Seed: Insert an admin user profile (manual)
-- After creating an admin via Supabase Auth, run:
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'your-admin-uuid';
-- =============================================
