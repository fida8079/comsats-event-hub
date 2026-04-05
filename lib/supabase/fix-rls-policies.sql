-- =============================================
-- FIX: Drop old recursive RLS policies and recreate
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Drop ALL old policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 2. Drop ALL old policies on events
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
DROP POLICY IF EXISTS "Admins can delete events" ON public.events;

-- 3. Drop ALL old policies on event_requests
DROP POLICY IF EXISTS "Students can view own requests" ON public.event_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.event_requests;
DROP POLICY IF EXISTS "Students can insert own requests" ON public.event_requests;
DROP POLICY IF EXISTS "Students can cancel own pending requests" ON public.event_requests;
DROP POLICY IF EXISTS "Students can delete own requests" ON public.event_requests;
DROP POLICY IF EXISTS "Admins can update any request" ON public.event_requests;
DROP POLICY IF EXISTS "Admins can delete any request" ON public.event_requests;

-- =============================================
-- RECREATE: profiles policies (NO recursion)
-- =============================================
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    (auth.jwt()->'user_metadata'->>'role')::text = 'admin'
  );

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- =============================================
-- RECREATE: events policies (uses JWT, no recursion)
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
-- RECREATE: event_requests policies (uses JWT, no recursion)
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
