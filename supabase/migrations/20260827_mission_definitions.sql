-- ONLINE BAR: MISSION DEFINITIONS
-- Removes hardcoded mission data from the frontend.

CREATE TABLE IF NOT EXISTS public.mission_definitions (
    id TEXT PRIMARY KEY, -- e.g., 'buy-mixers'
    label TEXT NOT NULL,
    description TEXT,
    xp_reward INTEGER DEFAULT 100,
    target_count INTEGER DEFAULT 1,
    category TEXT DEFAULT 'Patron',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Seed Initial Missions
INSERT INTO public.mission_definitions (id, label, description, xp_reward, target_count)
VALUES
('buy-mixers', 'Explore Mixers', 'Purchase 2 or more mixers in a single order.', 250, 2),
('review-product', 'Patron Voice', 'Share your tasting notes with the community.', 100, 1),
('refer-friend', 'Spread the Word', 'Bring a premium patron to the bar grid.', 500, 1)
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE public.mission_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Missions" ON public.mission_definitions FOR SELECT USING (true);
