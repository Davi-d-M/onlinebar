-- ONLINE BAR: EVENT ENGINE SCHEMA
-- The central heart for all system side-effects and cross-engine communication.

-- 1. EVENT LOG (The Immutability Layer)
CREATE TABLE IF NOT EXISTS public.event_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL, -- e.g., 'ORDER_DELIVERED', 'PAYMENT_SUCCESS'
    payload JSONB DEFAULT '{}'::JSONB,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::JSONB, -- IP, Device, User-Agent
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'PROCESSED', 'FAILED'
    processing_errors TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Index for fast status checks and historical replays
CREATE INDEX IF NOT EXISTS idx_event_log_type ON public.event_log(event_type);
CREATE INDEX IF NOT EXISTS idx_event_log_status ON public.event_log(status);
CREATE INDEX IF NOT EXISTS idx_event_log_user_id ON public.event_log(user_id);

-- 2. SECURITY (RLS)
ALTER TABLE public.event_log ENABLE ROW LEVEL SECURITY;

-- Admins can see all events
CREATE POLICY "Admins view all events" ON public.event_log
FOR SELECT TO authenticated USING (true);

-- Users can see their own event history (Optional: for debugging or advanced transparency)
CREATE POLICY "Users view own events" ON public.event_log
FOR SELECT USING (auth.uid() = user_id);

-- 3. TACTICAL VIEWS (Analytics Feed)
CREATE OR REPLACE VIEW public.vw_event_stats AS
SELECT
    event_type,
    status,
    COUNT(*) as total_count,
    MAX(created_at) as last_occurrence
FROM public.event_log
GROUP BY event_type, status;
