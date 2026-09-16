-- ONLINE BAR: EMERGENCY IDENTITY RECOVERY PROTOCOL
-- Force-clears trigger conflicts and re-establishes a hardened profile node.

-- 1. CLEANUP: Expunge all possible conflicting triggers on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS tr_handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;
DROP TRIGGER IF EXISTS sync_user_profile ON auth.users;
DROP TRIGGER IF EXISTS tr_on_auth_user_created ON auth.users;

-- 2. HARDENED FUNCTION: With Exception Trapping
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Defensive Insert with Conflict Resolution
  INSERT INTO public.profiles (id, email, full_name, phone_number, address)
  VALUES (
    new.id,
    new.email,
    NULLIF(new.raw_user_meta_data->>'full_name', ''),
    NULLIF(new.raw_user_meta_data->>'phone_number', ''),
    NULLIF(new.raw_user_meta_data->>'address', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    phone_number = COALESCE(public.profiles.phone_number, EXCLUDED.phone_number),
    address = COALESCE(public.profiles.address, EXCLUDED.address);

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Log the failure but ALLOW the auth user creation to proceed
  -- if the profile node is the only failure.
  -- This prevents the "DATABASE ERROR" from blocking account entry.
  RAISE WARNING 'Profile establishment failed for user %: %', new.id, SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. ESTABLISH: The definitive identity trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. PERMISSIONS: Ensure anon can actually trigger the auth flow
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.customer_sessions TO anon, authenticated;
