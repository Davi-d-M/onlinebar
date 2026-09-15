-- ONLINE BAR: APEX OS DISPATCH & FLEET CORE
-- Advanced infrastructure for motorcycle fleet optimization and traffic-aware routing.

-- 1. COORDINATE ENRICHMENT
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS customer_lat NUMERIC,
ADD COLUMN IF NOT EXISTS customer_lng NUMERIC,
ADD COLUMN IF NOT EXISTS pickup_lat NUMERIC DEFAULT -1.2841, -- Default Cellar
ADD COLUMN IF NOT EXISTS pickup_lng NUMERIC DEFAULT 36.8155;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC;

-- 2. RIDER VEHICLES (The Mechanical Profile)
CREATE TABLE IF NOT EXISTS public.rider_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rider_phone TEXT REFERENCES public.rider_status(rider_phone) ON DELETE CASCADE,
    make TEXT DEFAULT 'Honda',
    model TEXT DEFAULT 'Ace',
    plate_number TEXT UNIQUE,
    tank_capacity_l NUMERIC DEFAULT 10,
    avg_km_per_l NUMERIC DEFAULT 40.0,
    fuel_price_l NUMERIC DEFAULT 190.0,
    load_factor NUMERIC DEFAULT 1.05,
    traffic_factor NUMERIC DEFAULT 1.15,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DELIVERY ROUTES (Persistent Performance Log)
CREATE TABLE IF NOT EXISTS public.delivery_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id BIGINT REFERENCES public.orders(id) ON DELETE CASCADE,
    rider_phone TEXT REFERENCES public.rider_status(rider_phone) ON DELETE SET NULL,

    distance_meters INTEGER NOT NULL,
    duration_seconds INTEGER NOT NULL,
    encoded_polyline TEXT,

    fuel_estimated_l NUMERIC,
    fuel_cost_est NUMERIC,

    traffic_density_score INTEGER, -- 0-100
    route_confidence INTEGER DEFAULT 100, -- 0-100

    planned_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- 4. DISPATCH INTELLIGENCE LOGS (Decision Audit)
CREATE TABLE IF NOT EXISTS public.dispatch_intelligence_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id BIGINT REFERENCES public.orders(id) ON DELETE CASCADE,
    candidates JSONB, -- List of riders and their scores
    selected_rider_phone TEXT,
    selection_reason TEXT,
    algorithm_version TEXT DEFAULT 'APEX-1.0',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RLS (Row Level Security)
ALTER TABLE public.rider_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatch_intelligence_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage vehicles" ON public.rider_vehicles FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins view routes" ON public.delivery_routes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins view dispatch logs" ON public.dispatch_intelligence_logs FOR SELECT TO authenticated USING (true);

-- 6. Trigger for updated_at on vehicles
CREATE TRIGGER update_rider_vehicles_updated_at
    BEFORE UPDATE ON public.rider_vehicles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
