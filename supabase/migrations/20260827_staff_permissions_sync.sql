-- ONLINE BAR: STAFF PERMISSIONS SYNCHRONIZATION
-- Aligns the database columns with the Identity Engine roles.

-- 1. ADD MISSING PERMISSION COLUMNS
ALTER TABLE public.staff
ADD COLUMN IF NOT EXISTS can_execute_payouts BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_manage_staff BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_manage_marketing BOOLEAN DEFAULT false;

-- 2. RENAME LEGACY COLUMNS FOR CONSISTENCY
-- We check for existence before renaming to avoid errors on repeated runs
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff' AND column_name = 'can_manage_customer_care') THEN
        ALTER TABLE public.staff RENAME COLUMN can_manage_customer_care TO can_manage_communications;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff' AND column_name = 'can_manage_communications') THEN
        ALTER TABLE public.staff ADD COLUMN can_manage_communications BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 3. ENSURE ALL CORE PERMISSIONS EXIST
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS can_manage_inventory BOOLEAN DEFAULT true;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS can_manage_orders BOOLEAN DEFAULT true;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS can_view_revenue BOOLEAN DEFAULT false;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS can_view_audit_logs BOOLEAN DEFAULT false;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS can_manage_settings BOOLEAN DEFAULT false;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS can_view_sensitive_data BOOLEAN DEFAULT false;

-- 4. MERCHANT SCHEMA EXTENSION FOR ONBOARDING
ALTER TABLE public.suppliers
ADD COLUMN IF NOT EXISTS business_permit_url TEXT,
ADD COLUMN IF NOT EXISTS kra_pin_url TEXT,
ADD COLUMN IF NOT EXISTS premises_license_url TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'Pending'; -- 'Pending', 'Verified', 'Rejected'
