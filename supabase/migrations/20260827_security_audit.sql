-- ONLINE BAR: SECURITY AUDIT & RISK ENGINE SCHEMA
-- Monitors system integrity and flags suspicious behavioral patterns.

-- 1. SECURITY EVENTS (The Investigation Log)
CREATE TABLE IF NOT EXISTS public.security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- e.g., 'LOGIN_FAILED', 'NEW_DEVICE', 'LARGE_PAYMENT'
    severity TEXT DEFAULT 'INFO', -- 'INFO', 'WARNING', 'CRITICAL'
    ip_address TEXT,
    device_fingerprint TEXT,
    details JSONB DEFAULT '{}'::JSONB,
    risk_score_delta INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. IP BLACKLIST
CREATE TABLE IF NOT EXISTS public.ip_blacklist (
    ip_address TEXT PRIMARY KEY,
    reason TEXT,
    banned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 3. PROFILE RISK EXTENSION
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false;

-- 4. RISK SCORE TRIGGER
CREATE OR REPLACE FUNCTION public.update_profile_risk()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET
        risk_score = risk_score + NEW.risk_score_delta,
        is_flagged = CASE WHEN (risk_score + NEW.risk_score_delta) > 70 THEN true ELSE is_flagged END
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_risk ON public.security_events;
CREATE TRIGGER tr_update_risk
AFTER INSERT ON public.security_events
FOR EACH ROW EXECUTE PROCEDURE public.update_profile_risk();
