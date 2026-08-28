-- ONLINE BAR: SNACK SHOP ENGINE
-- Powers the mini-commerce engine for snack merchants and impulse buy logic.

-- 1. EXTEND PRODUCTS for snacks
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_snack BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sub_category TEXT; -- e.g., 'Crisps', 'Chocolate', 'Nuts'

-- 2. BUNDLES (The Movie Night Protocol)
CREATE TABLE IF NOT EXISTS public.bundles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bundle_items (
    bundle_id UUID REFERENCES public.bundles(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    PRIMARY KEY (bundle_id, product_id)
);

-- 3. INVENTORY PERISHABLES (Expiry Tracking)
ALTER TABLE public.inventory_units
ADD COLUMN IF NOT EXISTS expiry_date DATE,
ADD COLUMN IF NOT EXISTS batch_number TEXT;

-- 4. SPONSORED PLACEMENT (Impulse Buy Engine)
CREATE TABLE IF NOT EXISTS public.sponsored_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
    merchant_id BIGINT REFERENCES public.suppliers(id) ON DELETE CASCADE,
    bid_amount NUMERIC DEFAULT 0, -- KSh per click/view
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. AUTOMATION: Low Stock & Expiry Alerts
CREATE OR REPLACE FUNCTION public.check_snack_health()
RETURNS void AS $$
BEGIN
    -- Alert for stock below 5 units
    INSERT INTO public.exception_log (type, severity, title, description, details)
    SELECT 'INVENTORY', 'Warning', 'Low Snack Stock: ' || name,
           'Product ' || name || ' has ' || stock || ' units remaining.',
           jsonb_build_object('product_id', id, 'stock', stock)
    FROM public.products
    WHERE is_snack = true AND stock <= 5 AND status = 'Live';

    -- Alert for expiry within 7 days
    INSERT INTO public.exception_log (type, severity, title, description, details)
    SELECT 'INVENTORY', 'Critical', 'Snack Expiry Risk: ' || p.name,
           'Batch ' || iu.batch_number || ' expires on ' || iu.expiry_date,
           jsonb_build_object('product_id', p.id, 'batch', iu.batch_number)
    FROM public.inventory_units iu
    JOIN public.products p ON p.id = iu.product_id
    WHERE iu.status = 'Available' AND iu.expiry_date <= (CURRENT_DATE + INTERVAL '7 days');
END;
$$ LANGUAGE plpgsql;

-- 6. SECURITY (RLS)
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsored_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read bundles" ON public.bundles FOR SELECT USING (true);
CREATE POLICY "Public read sponsored" ON public.sponsored_products FOR SELECT USING (true);
