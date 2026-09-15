-- ONLINE BAR: NEURAL LOOP FOUNDATION (Phases 10-12)
-- Loyalty tiers, batching infrastructure, and predictive analytics.

-- 1. LOYALTY TIERS & PAYOUTS
CREATE TABLE IF NOT EXISTS public.loyalty_tiers (
    id TEXT PRIMARY KEY, -- 'EXPLORER', 'SILVER', 'GOLD', 'DIAMOND', 'LEGEND'
    label TEXT NOT NULL,
    min_xp INTEGER NOT NULL,
    multiplier NUMERIC DEFAULT 1.0,
    perks TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.loyalty_tiers (id, label, min_xp, multiplier, perks)
VALUES
('EXPLORER', 'Explorer', 0, 1.0, ARRAY['Standard Dispatch']),
('SILVER', 'Silver Patron', 500, 1.1, ARRAY['5% Points Bonus', 'Priority Support']),
('GOLD', 'Gold Legend', 1000, 1.2, ARRAY['10% Points Bonus', 'Zero Delivery Fee (Westlands)', 'Early Buzz Access']),
('DIAMOND', 'Diamond Elite', 2500, 1.5, ARRAY['20% Points Bonus', 'VIP Cellar Access', 'Express Dispatch']),
('LEGEND', 'Bar Legend', 5000, 2.0, ARRAY['Double Points', 'Personal Concierge', 'Invitational Events'])
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.affiliate_payouts
ADD COLUMN IF NOT EXISTS mpesa_receipt TEXT,
ADD COLUMN IF NOT EXISTS batch_id UUID,
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;

-- 2. BATCHING INFRASTRUCTURE
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS batch_id UUID,
ADD COLUMN IF NOT EXISTS batch_index INTEGER DEFAULT 0; -- Order in the delivery sequence

-- 3. PREDICTIVE ANALYTICS VIEWS
-- Calculates average frequency of purchase per category per user
CREATE OR REPLACE VIEW public.vw_purchase_frequency AS
WITH purchase_intervals AS (
    SELECT
        o.user_id,
        p.category,
        o.created_at,
        LAG(o.created_at) OVER (PARTITION BY o.user_id, p.category ORDER BY o.created_at) as prev_purchase
    FROM public.orders o
    JOIN public.order_items oi ON o.id = oi.order_id
    JOIN public.products p ON oi.product_id = p.id
    WHERE o.status IN ('Paid', 'Delivered') AND o.user_id IS NOT NULL
)
SELECT
    user_id,
    category,
    COUNT(*) as total_purchases,
    AVG(EXTRACT(EPOCH FROM (created_at - prev_purchase)) / 86400)::NUMERIC(10,2) as avg_days_between,
    MAX(created_at) as last_purchase_at
FROM purchase_intervals
WHERE prev_purchase IS NOT NULL
GROUP BY user_id, category;

-- 4. PREDICTIVE ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.predictive_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT,
    alert_type TEXT NOT NULL, -- 'RESTOCK', 'UPSELL', 'CHURN_RISK'
    target_date DATE NOT NULL,
    is_dispatched BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RLS
ALTER TABLE public.loyalty_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read tiers" ON public.loyalty_tiers FOR SELECT USING (true);
CREATE POLICY "Admins manage alerts" ON public.predictive_alerts FOR ALL TO authenticated USING (true);
CREATE POLICY "Users view own alerts" ON public.predictive_alerts FOR SELECT USING (auth.uid() = user_id);
