-- ONLINE BAR: EXPERIMENT RPCS
-- Securely increment counts without exposing the whole table to updates.

CREATE OR REPLACE FUNCTION public.increment_experiment_reach(var_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.experiment_variants
    SET reach_count = reach_count + 1
    WHERE id = var_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_experiment_conversion(var_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.experiment_variants
    SET conversion_count = conversion_count + 1
    WHERE id = var_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
