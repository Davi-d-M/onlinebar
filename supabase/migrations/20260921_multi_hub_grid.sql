-- ONLINE BAR: ENTERPRISE MULTI-HUB GRID
-- Infrastructure for branch cellars, regional inventory, and multi-city dispatch.

-- 1. HUBS (Cellar Locations)
CREATE TABLE IF NOT EXISTS public.hubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL, -- e.g. 'Nairobi Central', 'Mombasa Coast'
    city TEXT NOT NULL,
    address TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    manager_phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. HUB INVENTORY (Stock per Location)
CREATE TABLE IF NOT EXISTS public.hub_inventory (
    hub_id UUID REFERENCES public.hubs(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
    stock_level INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (hub_id, product_id)
);

-- 3. ENRICH ORDERS & RIDERS
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS hub_id UUID REFERENCES public.hubs(id);

ALTER TABLE public.rider_status
ADD COLUMN IF NOT EXISTS hub_id UUID REFERENCES public.hubs(id);

-- 4. Initial Seed
INSERT INTO public.hubs (name, city, latitude, longitude)
VALUES
('Nairobi Central Cellar', 'Nairobi', -1.2841, 36.8155),
('Mombasa Port Base', 'Mombasa', -4.0435, 39.6682),
('Kisumu Grid Node', 'Kisumu', -0.0917, 34.7680)
ON CONFLICT (name) DO NOTHING;

-- 5. RLS
ALTER TABLE public.hubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hub_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read hubs" ON public.hubs FOR SELECT USING (true);
CREATE POLICY "Admins manage hubs" ON public.hubs FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins manage hub inventory" ON public.hub_inventory FOR ALL TO authenticated USING (true);

-- 6. Trigger for updated_at on hubs
CREATE TRIGGER update_hubs_updated_at
    BEFORE UPDATE ON public.hubs
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
