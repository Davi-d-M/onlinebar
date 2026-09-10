-- ONLINE BAR: WIDGET ORCHESTRATION LAYER
-- Registry for all platform components to allow dynamic Admin management.

-- 1. Widget Registry
CREATE TABLE IF NOT EXISTS public.system_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    widget_key TEXT UNIQUE NOT NULL, -- e.g. 'HERO_CAROUSEL', 'CITY_PULSE'
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

-- 2. Seed Initial Widgets (High-Fidelity)
INSERT INTO public.system_widgets (widget_key, label, page_route, rank, config)
VALUES
('HERO_WIDGET', 'Executive Campaign Hero', '/', 1, '{"variant": "CINEMATIC", "overlay": true}'),
('TRENDING_WIDGET', 'Trending Tonight (Live Demand)', '/', 2, '{"rows": 1, "auto_rotate": true}'),
('CITY_PULSE_WIDGET', 'The Buzz: Real-time Pulse', '/', 3, '{"show_map": true}'),
('CONCIERGE_WIDGET', 'AI Concierge: Build My Night', '/', 4, '{"occasions_enabled": true}'),
('PERSONALIZED_WIDGET', 'Picked For You (Memory Loop)', '/', 5, '{"logic": "CategoryAffinity"}'),
('BAR_LIBRARY_WIDGET', 'The Bar: Mixology Guides', '/', 6, '{"layout": "Editorial"}')
ON CONFLICT (widget_key) DO NOTHING;

-- 3. Security (RLS)
ALTER TABLE public.system_widgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public select active widgets" ON public.system_widgets
FOR SELECT USING (status = 'ACTIVE' OR (status = 'SCHEDULED' AND now() BETWEEN start_time AND end_time));

CREATE POLICY "Admins full control widgets" ON public.system_widgets
FOR ALL TO authenticated USING (true);

-- 4. Audit Link
CREATE TRIGGER tr_audit_widget_changes
AFTER UPDATE ON public.system_widgets
FOR EACH ROW EXECUTE FUNCTION public.log_audit_trigger(); -- Assumes existing audit function
