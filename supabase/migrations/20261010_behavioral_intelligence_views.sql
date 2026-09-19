-- APEX BEHAVIOR INTELLIGENCE: ANALYTICS NODES v2
-- High-fidelity views for journey auditing.

-- 1. LIVE USER RADAR
CREATE OR REPLACE VIEW public.live_behavior_radar AS
SELECT
    s.id as session_id,
    s.user_id,
    p.full_name as customer_name,
    s.entry_page,
    s.source_channel,
    s.device_info->>'ua' as user_agent,
    s.total_active_time_sec,
    s.pages_viewed,
    s.updated_at as last_signal_at,
    (SELECT action_type FROM public.session_forensics WHERE session_id = s.id ORDER BY timestamp DESC LIMIT 1) as last_action,
    (SELECT page_url FROM public.session_forensics WHERE session_id = s.id ORDER BY timestamp DESC LIMIT 1) as current_url
FROM public.customer_sessions s
LEFT JOIN public.profiles p ON s.user_id = p.id
WHERE s.updated_at > (NOW() - INTERVAL '5 minutes')
ORDER BY s.updated_at DESC;

-- 2. FUNNEL PERFORMANCE
CREATE OR REPLACE VIEW public.conversion_funnel_intelligence AS
WITH steps AS (
    SELECT
        COUNT(DISTINCT id) as step1_landing,
        COUNT(DISTINCT id) FILTER (WHERE products_viewed > 0) as step2_product_view,
        COUNT(DISTINCT id) FILTER (WHERE cart_additions > 0) as step3_cart_add,
        COUNT(DISTINCT id) FILTER (WHERE checkouts_started > 0) as step4_checkout_start,
        COUNT(DISTINCT id) FILTER (WHERE is_converted = true) as step5_purchase
    FROM public.customer_sessions
    WHERE created_at > (NOW() - INTERVAL '30 days')
)
SELECT
    'Landing' as step_name, step1_landing as volume, 100.0 as drop_off_rate FROM steps
UNION ALL
SELECT
    'Product View' as step_name, step2_product_view as volume, ROUND((1 - (step2_product_view::numeric / NULLIF(step1_landing, 0))) * 100, 1) FROM steps
UNION ALL
SELECT
    'Add to Cart' as step_name, step3_cart_add as volume, ROUND((1 - (step3_cart_add::numeric / NULLIF(step2_product_view, 0))) * 100, 1) FROM steps
UNION ALL
SELECT
    'Checkout' as step_name, step4_checkout_start as volume, ROUND((1 - (step4_checkout_start::numeric / NULLIF(step3_cart_add, 0))) * 100, 1) FROM steps
UNION ALL
SELECT
    'Purchase' as step_name, step5_purchase as volume, ROUND((1 - (step5_purchase::numeric / NULLIF(step4_checkout_start, 0))) * 100, 1) FROM steps;

-- 3. INTERACTION FREQUENCY
CREATE OR REPLACE VIEW public.component_interaction_audit AS
SELECT
    metadata->>'id' as component_id,
    metadata->>'text' as component_label,
    action_type,
    page_url,
    COUNT(*) as interaction_count,
    COUNT(DISTINCT session_id) as unique_users
FROM public.session_forensics
WHERE action_type IN ('UI_INTERACTION', 'RAGE_CLICK', 'DEAD_CLICK')
  AND metadata->>'id' IS NOT NULL
GROUP BY metadata->>'id', metadata->>'text', action_type, page_url
ORDER BY interaction_count DESC;

-- 4. SCROLL REACH ANALYSIS
CREATE OR REPLACE VIEW public.page_scroll_reach AS
SELECT
    page_url,
    AVG(CASE WHEN action_type = 'SCROLL_25' THEN 1 ELSE 0 END) * 100 as reach_25,
    AVG(CASE WHEN action_type = 'SCROLL_50' THEN 1 ELSE 0 END) * 100 as reach_50,
    AVG(CASE WHEN action_type = 'SCROLL_75' THEN 1 ELSE 0 END) * 100 as reach_75,
    AVG(CASE WHEN action_type = 'SCROLL_90' THEN 1 ELSE 0 END) * 100 as reach_90
FROM public.session_forensics
WHERE action_type LIKE 'SCROLL_%'
GROUP BY page_url;

-- 5. TOP PAGES AGGREGATOR
CREATE OR REPLACE FUNCTION public.get_top_pages(limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
    page_url TEXT,
    view_count BIGINT,
    avg_time NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sf.page_url,
        COUNT(*) as view_count,
        ROUND(AVG(EXTRACT(EPOCH FROM (next_ts - timestamp))), 1) as avg_time
    FROM (
        SELECT
            page_url,
            timestamp,
            LEAD(timestamp) OVER (PARTITION BY session_id ORDER BY timestamp) as next_ts
        FROM public.session_forensics
        WHERE action_type = 'PAGE_VIEW'
    ) sf
    WHERE next_ts IS NOT NULL
    GROUP BY sf.page_url
    ORDER BY view_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
