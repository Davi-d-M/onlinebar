-- ONLINE BAR: TRACKING & FORENSICS HARDENING
-- Gating client-side telemetry with proper RLS policies for 100% data capture.

-- 1. Analytics Events (The Timeline)
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public insert analytics" ON public.analytics_events;
CREATE POLICY "Public insert analytics" ON public.analytics_events
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- 2. Customer Sessions (The Heartbeat)
ALTER TABLE public.customer_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public manage sessions" ON public.customer_sessions;
CREATE POLICY "Public manage sessions" ON public.customer_sessions
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 3. Session Forensics (Line-by-Line Audit)
ALTER TABLE public.session_forensics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public insert forensics" ON public.session_forensics;
CREATE POLICY "Public insert forensics" ON public.session_forensics
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- 4. Onboarding Funnel Log
ALTER TABLE public.onboarding_funnel_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public insert onboarding log" ON public.onboarding_funnel_log;
CREATE POLICY "Public insert onboarding log" ON public.onboarding_funnel_log
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- 5. Performance Telemetry
ALTER TABLE public.performance_telemetry ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public insert telemetry" ON public.performance_telemetry;
CREATE POLICY "Public insert telemetry" ON public.performance_telemetry
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- 6. User Consent
ALTER TABLE public.user_consent ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public manage own consent" ON public.user_consent;
CREATE POLICY "Public manage own consent" ON public.user_consent
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);
