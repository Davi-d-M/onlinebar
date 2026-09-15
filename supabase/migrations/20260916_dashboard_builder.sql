-- ONLINE BAR: INTELLIGENCE DASHBOARD BUILDER
-- System to allow admins to create and customize their own analytics workspaces.

-- 1. DASHBOARDS (The Container)
CREATE TABLE IF NOT EXISTS public.intel_dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    role_access TEXT[] DEFAULT ARRAY['admin', 'owner']::TEXT[],
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. WIDGETS (The Visual Nodes)
CREATE TABLE IF NOT EXISTS public.intel_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id UUID REFERENCES public.intel_dashboards(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- 'KPI', 'CHART_BAR', 'CHART_LINE', 'CHART_PIE', 'TABLE', 'INSIGHT', 'MAP'
    data_source TEXT NOT NULL, -- The metric key or table name
    config JSONB DEFAULT '{}'::JSONB, -- Filters, labels, colors, column settings

    -- Layout Grid (12-column system)
    layout_x INTEGER DEFAULT 0,
    layout_y INTEGER DEFAULT 0,
    layout_w INTEGER DEFAULT 4,
    layout_h INTEGER DEFAULT 2,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. METRIC CATALOG (Definition Registry)
CREATE TABLE IF NOT EXISTS public.intel_metrics_catalog (
    metric_key TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT,
    data_type TEXT DEFAULT 'NUMBER', -- 'CURRENCY', 'PERCENTAGE', 'NUMBER'
    sql_template TEXT -- Optional: for automated resolution
);

-- 4. Seed Initial Dashboard
INSERT INTO public.intel_dashboards (name, slug, description, is_default)
VALUES ('Product War Room', 'product-war-room', 'High-fidelity product performance and conversion audit.', true)
ON CONFLICT (slug) DO NOTHING;

-- 5. Seed Initial Metrics
INSERT INTO public.intel_metrics_catalog (metric_key, label, description, data_type)
VALUES
('TOTAL_REVENUE', 'Total Revenue', 'Gross revenue before costs', 'CURRENCY'),
('UNITS_SOLD', 'Units Sold', 'Total item count dispatched', 'NUMBER'),
('CONVERSION_RATE', 'Purchase conversion', 'View to purchase ratio', 'PERCENTAGE'),
('CART_ABANDON_RATE', 'Cart Abandonment', 'Users who added but did not buy', 'PERCENTAGE'),
('ACTIVE_TIME_AVG', 'Avg. Engagement', 'Active time on product pages', 'NUMBER')
ON CONFLICT (metric_key) DO NOTHING;

-- 6. Security (RLS)
ALTER TABLE public.intel_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intel_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intel_metrics_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage dashboards" ON public.intel_dashboards FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins manage intel_widgets" ON public.intel_widgets FOR ALL TO authenticated USING (true);
CREATE POLICY "Public read metrics" ON public.intel_metrics_catalog FOR SELECT TO authenticated USING (true);
