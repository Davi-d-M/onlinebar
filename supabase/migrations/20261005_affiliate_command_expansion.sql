-- ONLINE BAR: AFFILIATE OS COMMAND EXPANSION
-- Hardening the partner management schema for professional operations.

-- 1. ENHANCE COUPONS FOR PARTNER ATTRIBUTION
ALTER TABLE public.coupons
ADD COLUMN IF NOT EXISTS affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS commission_percent NUMERIC DEFAULT 0;

-- 2. COMMISSION OVERRIDE HISTORY
CREATE TABLE IF NOT EXISTS public.affiliate_commission_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE,
    previous_rate NUMERIC,
    new_rate NUMERIC NOT NULL,
    reason TEXT,
    actor_email TEXT, -- Admin who made the change
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. REVENUE ATTRIBUTION VIEW (V2)
CREATE OR REPLACE VIEW public.affiliate_performance_summary AS
SELECT
    a.id as affiliate_id,
    p.full_name,
    p.email,
    p.referral_code,
    a.affiliate_tier,
    a.verification_status as status,
    p.referral_clicks as clicks,
    (SELECT COUNT(*) FROM public.orders o WHERE o.referred_by_code = p.referral_code) as conversions,
    (SELECT COALESCE(SUM(total_price), 0) FROM public.orders o WHERE o.referred_by_code = p.referral_code AND o.status = 'Delivered') as total_revenue,
    (SELECT COALESCE(SUM(amount), 0) FROM public.affiliate_ledger al WHERE al.affiliate_id = a.id AND al.entry_type = 'COMMISSION' AND al.status = 'Approved') as available_earnings,
    (SELECT COALESCE(SUM(amount), 0) FROM public.affiliate_ledger al WHERE al.affiliate_id = a.id AND al.entry_type = 'COMMISSION' AND al.status = 'Pending') as pending_earnings,
    (SELECT MAX(created_at) FROM public.orders o WHERE o.referred_by_code = p.referral_code) as last_conversion_at
FROM public.affiliates a
JOIN public.profiles p ON a.id = p.id;

-- 4. SECURITY (RLS)
ALTER TABLE public.affiliate_commission_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins view commission history" ON public.affiliate_commission_history;
CREATE POLICY "Admins view commission history" ON public.affiliate_commission_history
FOR SELECT TO authenticated USING (true);

-- Ensure coupons policy allows admin management
DROP POLICY IF EXISTS "Admins manage all coupons" ON public.coupons;
CREATE POLICY "Admins manage all coupons" ON public.coupons FOR ALL TO authenticated USING (true);
