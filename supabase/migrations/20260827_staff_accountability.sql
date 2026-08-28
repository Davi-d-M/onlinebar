-- ONLINE BAR: STAFF ACCOUNTABILITY & SYSTEM INCIDENTS
-- Hardens workforce management and technical observability.

-- 1. STAFF TABLE EXTENSION
ALTER TABLE public.staff
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Offline', -- 'Online', 'Idle', 'Offline'
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS completed_tasks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS overdue_tasks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sla_rating NUMERIC DEFAULT 100.0;

-- 2. SYSTEM INCIDENTS (Technical outages)
CREATE TABLE IF NOT EXISTS public.system_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    severity TEXT DEFAULT 'Minor', -- 'Minor', 'Major', 'Critical'
    affected_nodes TEXT[], -- ['PAYMENTS', 'WHATSAPP', 'DATABASE']
    status TEXT DEFAULT 'Investigating', -- 'Investigating', 'Identified', 'Monitoring', 'Resolved'
    description TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. ACTIVITY TRACKER TRIGGER
-- Updates last_activity_at whenever a staff record is "touched" by an audit event
CREATE OR REPLACE FUNCTION public.track_staff_heartbeat()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.staff
    SET
        last_activity_at = NOW(),
        status = 'Online'
    WHERE email = NEW.staff_email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_staff_heartbeat ON public.audit_logs;
CREATE TRIGGER tr_staff_heartbeat
AFTER INSERT ON public.audit_logs
FOR EACH ROW EXECUTE PROCEDURE public.track_staff_heartbeat();

-- 4. SECURITY (RLS)
ALTER TABLE public.system_incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage incidents" ON public.system_incidents FOR ALL TO authenticated USING (true);
