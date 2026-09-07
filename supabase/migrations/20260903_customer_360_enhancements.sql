-- ONLINE BAR: CUSTOMER 360 ENHANCEMENTS
-- Implementing custom Public IDs and acquisition attribution.

-- 1. Add Public ID to Profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS public_id TEXT UNIQUE;

-- 2. Function to generate OB-CUS- format IDs
CREATE OR REPLACE FUNCTION public.generate_ob_customer_id()
RETURNS trigger AS $$
BEGIN
    NEW.public_id := 'OB-CUS-' || upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 12));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_generate_public_id ON public.profiles;
CREATE TRIGGER tr_generate_public_id
    BEFORE INSERT ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.generate_ob_customer_id();

-- 3. ACQUISITION ATTRIBUTION TRIGGER (Layer 7)
CREATE OR REPLACE FUNCTION public.attribute_customer_acquisition()
RETURNS trigger AS $$
DECLARE
    v_source TEXT;
    v_campaign TEXT;
BEGIN
    -- Pull from the first session recorded for this user
    SELECT source_channel, (device_info->>'campaign')
    INTO v_source, v_campaign
    FROM public.customer_sessions
    WHERE user_id = NEW.id
    ORDER BY created_at ASC
    LIMIT 1;

    NEW.first_touch_source := v_source;
    NEW.first_touch_campaign := v_campaign;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_attribute_acquisition ON public.profiles;
CREATE TRIGGER tr_attribute_acquisition
    BEFORE UPDATE OF conversion_date ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.attribute_customer_acquisition();

-- 4. AFFINITY SCORE UPDATER (Layer 4)
CREATE OR REPLACE FUNCTION public.update_category_affinity()
RETURNS trigger AS $$
DECLARE
    v_category TEXT;
BEGIN
    -- Logic to extract category from metadata or page_url
    v_category := NEW.metadata->>'category';

    IF v_category IS NOT NULL AND NEW.user_id IS NOT NULL THEN
        INSERT INTO public.customer_product_preferences (user_id, category_id, view_count, last_interaction_at)
        VALUES (NEW.user_id, v_category, 1, NOW())
        ON CONFLICT (user_id, category_id)
        DO UPDATE SET
            view_count = public.customer_product_preferences.view_count + 1,
            affinity_score = LEAST(public.customer_product_preferences.affinity_score + 2, 100),
            last_interaction_at = EXCLUDED.last_interaction_at;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_affinity ON public.session_forensics;
CREATE TRIGGER tr_update_affinity
    AFTER INSERT ON public.session_forensics
    FOR EACH ROW WHEN (NEW.action_type = 'PRODUCT_VIEW')
    EXECUTE PROCEDURE public.update_category_affinity();
