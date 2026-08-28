-- ONLINE BAR: CAMPAIGN COMMAND CENTER SCHEMA
-- Powers unified marketing across WhatsApp, Instagram, and Facebook.

-- 1. CAMPAIGNS (The Mission)
CREATE TABLE IF NOT EXISTS public.marketing_campaigns_v2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    base_message TEXT,
    media_url TEXT,
    cta_link TEXT,
    target_audience TEXT DEFAULT 'ALL', -- 'ALL', 'RETURNING', 'INACTIVE'
    scheduled_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'DRAFT', -- 'DRAFT', 'SCHEDULED', 'PUBLISHED', 'FAILED'
    ai_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. CAMPAIGN CHANNELS (The Deployment)
CREATE TABLE IF NOT EXISTS public.campaign_deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.marketing_campaigns_v2(id) ON DELETE CASCADE,
    channel TEXT NOT NULL, -- 'WHATSAPP', 'INSTAGRAM', 'FACEBOOK', 'EMAIL'
    platform_post_id TEXT,
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'SENT', 'FAILED'
    metrics JSONB DEFAULT '{"reach": 0, "clicks": 0, "conversions": 0}'::JSONB,
    errors TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. AUDIENCE ENGINE (The Targeting)
CREATE TABLE IF NOT EXISTS public.audiences (
    id TEXT PRIMARY KEY, -- 'NEW_CUSTOMERS', 'HIGH_VALUE_PATRONS'
    name TEXT NOT NULL,
    query_logic JSONB NOT NULL,
    member_count INTEGER DEFAULT 0,
    last_computed_at TIMESTAMP WITH TIME ZONE
);

-- 4. SECURITY (RLS)
ALTER TABLE public.marketing_campaigns_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_deployments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage campaigns" ON public.marketing_campaigns_v2 FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins view deployments" ON public.campaign_deployments FOR SELECT TO authenticated USING (true);
