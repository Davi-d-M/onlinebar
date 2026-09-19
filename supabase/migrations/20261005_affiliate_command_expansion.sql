-- ONLINE BAR: AFFILIATE OS COMMAND EXPANSION (ULTRA-RESILIENT REPAIR NODE)
-- This script ensures all tables, columns, and views for the Affiliate OS are synchronized.

-- 1. ENSURE BASE TABLES EXIST (Fallback for missing Core migrations)
CREATE TABLE IF NOT EXISTS public.affiliates (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    referral_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.affiliate_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    entry_type TEXT NOT NULL, -- 'COMMISSION', 'PAYOUT', 'ADJUSTMENT', 'REVERSAL'
    status TEXT DEFAULT 'Pending', -- 'Pending', 'Approved', 'Paid', 'Cancelled'
    amount NUMERIC NOT NULL,
    reference_id TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. REPAIR NODE: Harmonize columns (Schema Agnostic)
DO $$
BEGIN
    -- Add affiliate_tier if missing (migration from current_level)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='affiliates' AND column_name='affiliate_tier') THEN
        ALTER TABLE public.affiliates ADD COLUMN affiliate_tier TEXT DEFAULT 'Bronze';
        -- Sync data if old column exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='affiliates' AND column_name='current_level') THEN
            UPDATE public.affiliates SET affiliate_tier = current_level;
        END IF;
    END IF;

    -- Add verification_status if missing (migration from status)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='affiliates' AND column_name='verification_status') THEN
        ALTER TABLE public.affiliates ADD COLUMN verification_status TEXT DEFAULT 'Pending';
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='affiliates' AND column_name='status') THEN
            UPDATE public.affiliates SET verification_status = status;
        END IF;
    END IF;

    -- Add Operational Intelligence columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='affiliates' AND column_name='commission_rate_override') THEN
        ALTER TABLE public.affiliates ADD COLUMN commission_rate_override NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='affiliates' AND column_name='business_name') THEN
        ALTER TABLE public.affiliates ADD COLUMN business_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='affiliates' AND column_name='payout_details') THEN
        ALTER TABLE public.affiliates ADD COLUMN payout_details TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='affiliates' AND column_name='primary_channels') THEN
        ALTER TABLE public.affiliates ADD COLUMN primary_channels TEXT[];
    END IF;
END $$;

-- 3. ENHANCE COUPONS FOR PARTNER ATTRIBUTION
ALTER TABLE public.coupons
ADD COLUMN IF NOT EXISTS affiliate_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS commission_percent NUMERIC DEFAULT 0;

-- 4. COMMISSION OVERRIDE HISTORY
CREATE TABLE IF NOT EXISTS public.affiliate_commission_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    previous_rate NUMERIC,
    new_rate NUMERIC NOT NULL,
    reason TEXT,
    actor_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. REVENUE ATTRIBUTION VIEW (V2 - SCHEMA AGNOSTIC)
DROP VIEW IF EXISTS public.affiliate_performance_summary;
CREATE OR REPLACE VIEW public.affiliate_performance_summary AS
SELECT
    p.id as affiliate_id,
    p.full_name,
    p.email,
    p.referral_code,
    COALESCE(a.affiliate_tier, 'Bronze') as affiliate_tier,
    COALESCE(a.verification_status, 'Pending') as status,
    COALESCE(p.referral_clicks, 0) as clicks,
    (SELECT COUNT(*) FROM public.orders o WHERE o.referred_by_code = p.referral_code) as conversions,
    (SELECT COALESCE(SUM(total_price), 0) FROM public.orders o WHERE o.referred_by_code = p.referral_code AND o.status = 'Delivered') as total_revenue,
    (SELECT COALESCE(SUM(amount), 0) FROM public.affiliate_ledger al WHERE al.affiliate_id = p.id AND al.entry_type = 'COMMISSION' AND al.status = 'Approved') as available_earnings,
    (SELECT COALESCE(SUM(amount), 0) FROM public.affiliate_ledger al WHERE al.affiliate_id = p.id AND al.entry_type = 'COMMISSION' AND al.status = 'Pending') as pending_earnings,
    (SELECT MAX(created_at) FROM public.orders o WHERE o.referred_by_code = p.referral_code) as last_conversion_at
FROM public.profiles p
LEFT JOIN public.affiliates a ON p.id = a.id
WHERE p.referral_code IS NOT NULL;

-- 6. SECURITY (RLS)
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_commission_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins view commission history" ON public.affiliate_commission_history;
CREATE POLICY "Admins view commission history" ON public.affiliate_commission_history
FOR SELECT TO authenticated USING (true);

-- Ensure coupons policy allows admin management
DROP POLICY IF EXISTS "Admins manage all coupons" ON public.coupons;
CREATE POLICY "Admins manage all coupons" ON public.coupons FOR ALL TO authenticated USING (true);
