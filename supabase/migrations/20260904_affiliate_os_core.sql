-- ONLINE BAR: AFFILIATE OPERATING SYSTEM (AFFILIATE OS)
-- Comprehensive architecture for scaling a professional creator network.

-- 1. AFFILIATE PROFILES (Extended Identity)
CREATE TABLE IF NOT EXISTS public.affiliates (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_name TEXT,
    bio TEXT,
    audience_size INTEGER DEFAULT 0,
    primary_channels TEXT[], -- ['Instagram', 'TikTok', 'WhatsApp', 'Website']
    preferred_payout_method TEXT DEFAULT 'M-Pesa',
    payout_details TEXT, -- e.g. Phone number for M-Pesa
    verification_status TEXT DEFAULT 'Pending', -- 'Pending', 'Verified', 'Rejected'
    affiliate_tier TEXT DEFAULT 'Bronze', -- 'Bronze', 'Silver', 'Gold', 'Elite'
    commission_rate_override NUMERIC, -- Custom rate if not default
    marketing_agreement_accepted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. AFFILIATE ASSET LIBRARY (Creative Vault)
CREATE TABLE IF NOT EXISTS public.affiliate_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- 'Image', 'Video', 'Copy', 'Banner'
    category TEXT, -- 'Vintage', 'Spirits', 'Generic'
    media_url TEXT NOT NULL,
    suggested_caption TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. AFFILIATE LEDGER (Financial Node)
CREATE TABLE IF NOT EXISTS public.affiliate_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE,
    entry_type TEXT NOT NULL, -- 'COMMISSION', 'PAYOUT', 'ADJUSTMENT', 'REVERSAL'
    status TEXT DEFAULT 'Pending', -- 'Pending', 'Approved', 'Paid', 'Cancelled'
    amount NUMERIC NOT NULL,
    reference_id TEXT, -- Order ID or Payout ID
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. AFFILIATE FRAUD MONITOR
CREATE TABLE IF NOT EXISTS public.affiliate_fraud_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE,
    signal_type TEXT NOT NULL, -- 'HIGH_CLICK_ZERO_CONV', 'SUSPICIOUS_VELOCITY', 'SELF_REFERRAL'
    risk_score INTEGER DEFAULT 0,
    details JSONB DEFAULT '{}'::JSONB,
    status TEXT DEFAULT 'Flagged', -- 'Flagged', 'Resolved', 'Dismissed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. VIEWS FOR PARTNER DASHBOARD
CREATE OR REPLACE VIEW public.affiliate_performance_summary AS
SELECT
    a.id as affiliate_id,
    p.referral_clicks as clicks,
    (SELECT COUNT(*) FROM public.orders o WHERE o.referred_by_code = p.referral_code) as conversions,
    (SELECT COALESCE(SUM(amount), 0) FROM public.affiliate_ledger al WHERE al.affiliate_id = a.id AND al.entry_type = 'COMMISSION' AND al.status = 'Approved') as available_earnings,
    (SELECT COALESCE(SUM(amount), 0) FROM public.affiliate_ledger al WHERE al.affiliate_id = a.id AND al.entry_type = 'COMMISSION' AND al.status = 'Pending') as pending_earnings
FROM public.affiliates a
JOIN public.profiles p ON a.id = p.id;

-- 6. SECURITY: RLS FOR AFFILIATE OS
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_fraud_signals ENABLE ROW LEVEL SECURITY;

-- 7. POLICIES
DROP POLICY IF EXISTS "Affiliates view own profile" ON public.affiliates;
CREATE POLICY "Affiliates view own profile" ON public.affiliates FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Affiliates view approved assets" ON public.affiliate_assets;
CREATE POLICY "Affiliates view approved assets" ON public.affiliate_assets FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Affiliates view own ledger" ON public.affiliate_ledger;
CREATE POLICY "Affiliates view own ledger" ON public.affiliate_ledger FOR SELECT USING (auth.uid() = affiliate_id);

DROP POLICY IF EXISTS "Admins manage all affiliates" ON public.affiliates;
CREATE POLICY "Admins manage all affiliates" ON public.affiliates FOR ALL TO authenticated USING (true);
