-- ONLINE BAR: WIDGET ORCHESTRATION LAYER (FIXED)
-- konsolideret skript til at etablere widget-registret og audit-logning.

-- 1. Widget Registry Table
CREATE TABLE IF NOT EXISTS public.system_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    widget_key TEXT UNIQUE NOT NULL, -- e.g. 'HERO_WIDGET', 'CITY_PULSE_WIDGET'
    label TEXT NOT NULL,
    page_route TEXT DEFAULT '/', -- '/', '/shop', '/admin'
    status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE', 'SCHEDULED', 'DRAFT'
    config JSONB DEFAULT '{}'::JSONB, -- Style, specific settings
    rank INTEGER DEFAULT 0, -- Display order
    visibility_rules JSONB DEFAULT '{"audience": "ALL", "device": "ALL"}'::JSONB,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Audit Link Function (CRITICAL FIX)
-- This function must exist before the trigger can be created.
CREATE OR REPLACE FUNCTION public.log_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (actor_id, action, details)
    VALUES (
        auth.uid(),
        'UPDATE_' || TG_TABLE_NAME,
        jsonb_build_object(
            'id', NEW.id,
            'old_status', OLD.status,
            'new_status', NEW.status,
            'label', NEW.label
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-establish Trigger
DROP TRIGGER IF EXISTS tr_audit_widget_changes ON public.system_widgets;
CREATE TRIGGER tr_audit_widget_changes
AFTER UPDATE ON public.system_widgets
FOR EACH ROW EXECUTE FUNCTION public.log_audit_trigger();

-- 4. Seed Initial Widgets
INSERT INTO public.system_widgets (widget_key, label, page_route, rank, config)
VALUES
('HERO_WIDGET', 'Executive Campaign Hero', '/', 1, '{"variant": "CINEMATIC", "overlay": true}'),
('TRENDING_WIDGET', 'Trending Tonight (Live Demand)', '/', 2, '{"rows": 1, "auto_rotate": true}'),
('CITY_PULSE_WIDGET', 'The Buzz: Real-time Pulse', '/', 3, '{"show_map": true}'),
('CONCIERGE_WIDGET', 'AI Concierge: Build My Night', '/', 4, '{"occasions_enabled": true}'),
('PERSONALIZED_WIDGET', 'Picked For You (Memory Loop)', '/', 5, '{"logic": "CategoryAffinity"}'),
('BAR_LIBRARY_WIDGET', 'The Bar: Mixology Guides', '/', 6, '{"layout": "Editorial"}')
ON CONFLICT (widget_key) DO NOTHING;

-- 5. Security (RLS)
ALTER TABLE public.system_widgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select active widgets" ON public.system_widgets;
CREATE POLICY "Public select active widgets" ON public.system_widgets
FOR SELECT USING (status = 'ACTIVE' OR (status = 'SCHEDULED' AND now() BETWEEN start_time AND end_time));

DROP POLICY IF EXISTS "Admins full control widgets" ON public.system_widgets;
CREATE POLICY "Admins full control widgets" ON public.system_widgets
FOR ALL TO authenticated USING (true);
