-- ONLINE BAR: FINAL SYSTEM HARDENING & SCHEMA ALIGNMENT
-- Ensures all columns required by the Master Controller exist and triggers are sanitized.

-- 1. Analytics Events Schema Alignment
ALTER TABLE public.analytics_events
ADD COLUMN IF NOT EXISTS correlation_id TEXT,
ADD COLUMN IF NOT EXISTS request_id TEXT,
ADD COLUMN IF NOT EXISTS device_category TEXT,
ADD COLUMN IF NOT EXISTS page_url TEXT,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'WEB';

-- 2. Profiles Schema Alignment
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS membership_tier TEXT DEFAULT 'Standard',
ADD COLUMN IF NOT EXISTS onboarding_step TEXT DEFAULT 'INTRO';

-- 3. Hardened Identity Trigger (NULLIF Sanitization)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone_number, address)
  VALUES (
    new.id,
    new.email,
    NULLIF(new.raw_user_meta_data->>'full_name', ''),
    NULLIF(new.raw_user_meta_data->>'phone_number', ''),
    NULLIF(new.raw_user_meta_data->>'address', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup potential duplicate triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Global Tracking Permissions
GRANT INSERT ON public.analytics_events TO anon, authenticated;
GRANT ALL ON public.customer_sessions TO anon, authenticated;
GRANT INSERT ON public.session_forensics TO anon, authenticated;
GRANT INSERT ON public.performance_telemetry TO anon, authenticated;
GRANT INSERT ON public.onboarding_funnel_log TO anon, authenticated;

-- 5. RLS Policies Refresh
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public insert analytics" ON public.analytics_events;
CREATE POLICY "Public insert analytics" ON public.analytics_events FOR INSERT TO anon, authenticated WITH CHECK (true);

ALTER TABLE public.customer_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public manage sessions" ON public.customer_sessions;
CREATE POLICY "Public manage sessions" ON public.customer_sessions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
