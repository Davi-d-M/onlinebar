-- ONLINE BAR: BAR ESSENTIALS SEED DATA (HARDENED)
-- Ensures schema is correct then populates 'essentials' category.

-- 1. Ensure Columns Exist
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS cost_price NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Live';

-- 2. Insert Data
INSERT INTO public.products (name, brand, category, price, cost_price, description, stock, image_url, status, is_new)
VALUES
('The Tot Set (6 Pcs)', 'Online Bar Premium', 'essentials', 2500, 1200, 'A collection of 6 premium shot/tot glasses crafted for crystal clarity. Perfect for sharing spirits with the squad.', 50, '/placeholder.jpg', 'Live', true),
('Crystal Whiskey Tumblers', 'Vantage Glass', 'essentials', 3200, 1500, 'Heavy-base crystal tumblers designed to enhance the aroma and tasting experience of your finest whiskeys.', 30, '/placeholder.jpg', 'Live', true),
('Pro Cocktail Shaker Set', 'Mixology Master', 'essentials', 4500, 2200, 'Complete home bar starter kit including a 750ml shaker, jigger, strainer, and bar spoon. Stainless steel finish.', 20, '/placeholder.jpg', 'Live', true),
('Double-Hinged Corkscrew', 'Sommelier Select', 'essentials', 1200, 400, 'Professional-grade corkscrew with a built-in foil cutter. Effortless opening for your vintage wine collection.', 100, '/placeholder.jpg', 'Live', false),
('Luxury Ice Bucket', 'Chilled Life', 'essentials', 5800, 2800, 'Double-walled insulated ice bucket. Keeps your ice frozen for hours. Includes tongs and a premium leather finish.', 15, '/placeholder.jpg', 'Live', true)
ON CONFLICT DO NOTHING;
