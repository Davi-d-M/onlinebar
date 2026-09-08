-- ONLINE BAR: SETTINGS RLS FIX
-- Resolves "new row violates row-level security policy" in Bar OS Admin.

DO $$
BEGIN
    -- 1. Ensure RLS is enabled
    ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

    -- 2. Drop existing policies to avoid conflicts
    DROP POLICY IF EXISTS "Admins manage settings" ON public.settings;
    DROP POLICY IF EXISTS "Public view settings" ON public.settings;

    -- 3. Create Policy: Authenticated users (Admins) have full control
    CREATE POLICY "Admins manage settings"
    ON public.settings
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

    -- 4. Create Policy: Public can view published settings (required for storefront)
    CREATE POLICY "Public view settings"
    ON public.settings
    FOR SELECT
    TO anon, authenticated
    USING (is_published = true);

END $$;
