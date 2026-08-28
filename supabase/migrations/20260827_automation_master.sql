-- ONLINE BAR: AUTOMATION ENGINE MASTER SCHEMA
-- Powers the "No-Finger" architecture for autonomous operations.

-- 1. AUTOMATION RULES (The Logic)
CREATE TABLE IF NOT EXISTS public.automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    event_type TEXT NOT NULL, -- e.g., 'ORDER_DELAYED', 'PAYMENT_FAILED'
    conditions JSONB DEFAULT '{}'::JSONB, -- e.g., {"delay_minutes": 15}
    actions JSONB DEFAULT '[]'::JSONB, -- e.g., [{"type": "NOTIFY_CUSTOMER"}, {"type": "ALERT_OPS"}]
    is_active BOOLEAN DEFAULT true,
    manual_override_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. AUTOMATION RUNS (The Audit Trail)
CREATE TABLE IF NOT EXISTS public.automation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID REFERENCES public.automation_rules(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.event_log(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'EXECUTED', 'FAILED', 'BLOCKED'
    executed_actions JSONB DEFAULT '[]'::JSONB,
    errors TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    executed_at TIMESTAMP WITH TIME ZONE
);

-- 3. GLOBAL AUTONOMOUS STATE
CREATE TABLE IF NOT EXISTS public.system_autonomous_state (
    engine_name TEXT PRIMARY KEY, -- 'DISPATCH', 'PAYMENTS', 'MARKETING', 'NOTIFICATIONS'
    is_autonomous BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Initial State
INSERT INTO public.system_autonomous_state (engine_name, is_autonomous)
VALUES
('DISPATCH', true),
('PAYMENTS', true),
('MARKETING', true),
('NOTIFICATIONS', true)
ON CONFLICT (engine_name) DO NOTHING;

-- 4. SECURITY (RLS)
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_autonomous_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage automations" ON public.automation_rules FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins view automation runs" ON public.automation_runs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage system state" ON public.system_autonomous_state FOR ALL TO authenticated USING (true);
