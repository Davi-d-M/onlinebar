-- APEX OS: PERFORMANCE TUNING NODE
-- Optimizes analytics queries for sub-second response times.

-- 1. Compound Index for Funnel Analytics
CREATE INDEX IF NOT EXISTS idx_analytics_name_time
ON public.analytics_events(event_name, timestamp DESC);

-- 2. General Timestamp Index for Live Pulse
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp
ON public.analytics_events(timestamp DESC);

-- 3. Index for Page Analysis
CREATE INDEX IF NOT EXISTS idx_analytics_url
ON public.analytics_events(page_url) WHERE page_url IS NOT NULL;
