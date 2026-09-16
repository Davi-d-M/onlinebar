-- ONLINE BAR: PRODUCT KNOWLEDGE DOSSIER CORE v2
-- The definitive source for beverage research, sensory profiles, and hierarchy.

-- 1. PRODUCT CATEGORIES (Hierarchical: Whisky -> Scotch -> Single Malt)
CREATE TABLE IF NOT EXISTS public.product_categories_v2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.product_categories_v2(id),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCT BRANDS (Johnnie Walker, Gordon's, etc.)
CREATE TABLE IF NOT EXISTS public.product_brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    owner_company TEXT, -- e.g., 'Asahi', 'Diageo', 'EABL'
    distributor_kenya TEXT,
    origin_country TEXT,
    logo_url TEXT,
    description TEXT,
    website_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCT SOURCES (Live Retailers, Manufacturer Catalogues)
CREATE TABLE IF NOT EXISTS public.product_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- e.g., 'DrinkSasa', 'EABL Official', 'WSET'
    url TEXT,
    source_type TEXT, -- 'RETAILER', 'MANUFACTURER', 'EDUCATIONAL'
    last_crawled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCT DOSSIERS (The Research source of truth for an SKU)
CREATE TABLE IF NOT EXISTS public.product_dossiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE UNIQUE,
    brand_id UUID REFERENCES public.product_brands(id),
    category_v2_id UUID REFERENCES public.product_categories_v2(id),

    -- Identity & Origin
    brand_identity TEXT,
    producer_name TEXT,
    country_of_origin TEXT,
    region_of_origin TEXT,
    appellation TEXT,
    abv_actual TEXT,
    volume_ml INTEGER,

    -- Composition
    base_ingredients TEXT[] DEFAULT ARRAY[]::TEXT[],
    botanicals TEXT[] DEFAULT ARRAY[]::TEXT[],
    grape_varieties TEXT[] DEFAULT ARRAY[]::TEXT[],
    grain_mash_bill JSONB DEFAULT '{}'::JSONB,

    -- Sensory Profile (0-100)
    sensory_dna JSONB DEFAULT '{
        "sweetness": 0,
        "body": 0,
        "oak": 0,
        "smoke": 0,
        "intensity": 0,
        "acidity": 0,
        "tannin": 0,
        "bitterness": 0
    }'::JSONB,

    -- Descriptive Notes
    colour_visual TEXT,
    aroma_profile TEXT,
    taste_profile TEXT,
    finish_character TEXT,

    -- The Story
    origin_story TEXT,
    production_method TEXT,
    maturation_details TEXT,
    age_statement TEXT,
    cask_type TEXT,

    -- Serving Protocols
    serving_temp TEXT,
    recommended_glassware TEXT,
    serve_suggestions TEXT[],
    food_pairings TEXT[],
    cocktail_uses TEXT[],

    -- Compliance & Logistics
    constituents_statement TEXT,
    statutory_warning_required BOOLEAN DEFAULT true,
    kenyan_availability_status TEXT DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'OUT_OF_STOCK', 'DISCONTINUED'

    -- Source Confidence (JSONB mapping of field -> confidence_level)
    source_verification JSONB DEFAULT '{}'::JSONB,

    last_verified_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PRODUCT MEDIA HUB
CREATE TABLE IF NOT EXISTS public.product_media_hub (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dossier_id UUID REFERENCES public.product_dossiers(id) ON DELETE CASCADE,

    media_type TEXT NOT NULL, -- 'VIDEO_OFFICIAL', 'VIDEO_TASTING', 'ARTICLE', 'AWARD', 'CERTIFICATION'
    title TEXT NOT NULL,
    source_name TEXT,
    source_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration_sec INTEGER,

    is_embed_allowed BOOLEAN DEFAULT true,
    published_at DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RLS
ALTER TABLE public.product_categories_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_media_hub ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read categories" ON public.product_categories_v2 FOR SELECT USING (true);
CREATE POLICY "Public read brands" ON public.product_brands FOR SELECT USING (true);
CREATE POLICY "Public read dossiers" ON public.product_dossiers FOR SELECT USING (true);
CREATE POLICY "Public read media" ON public.product_media_hub FOR SELECT USING (true);

CREATE POLICY "Admins manage categories" ON public.product_categories_v2 FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins manage brands" ON public.product_brands FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins manage sources" ON public.product_sources FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins manage dossiers" ON public.product_dossiers FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins manage media" ON public.product_media_hub FOR ALL TO authenticated USING (true);

-- 7. Trigger for updated_at
CREATE TRIGGER update_product_dossiers_updated_at
    BEFORE UPDATE ON public.product_dossiers
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
