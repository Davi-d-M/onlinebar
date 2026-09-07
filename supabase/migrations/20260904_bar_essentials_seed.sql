-- ONLINE BAR: BAR ESSENTIALS SEED DATA
-- Populate the 'essentials' category with premium glassware and tools.

INSERT INTO public.products (name, brand, category, price, cost_price, description, stock, image_url, status, is_new)
VALUES
('The Tot Set (6 Pcs)', 'Online Bar Premium', 'essentials', 2500, 1200, 'A collection of 6 premium shot/tot glasses crafted for crystal clarity. Perfect for sharing spirits with the squad.', 50, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800', 'Live', true),
('Crystal Whiskey Tumblers', 'Vantage Glass', 'essentials', 3200, 1500, 'Heavy-base crystal tumblers designed to enhance the aroma and tasting experience of your finest whiskeys.', 30, 'https://images.unsplash.com/photo-1595074474890-7058df3426e2?auto=format&fit=crop&q=80&w=800', 'Live', true),
('Pro Cocktail Shaker Set', 'Mixology Master', 'essentials', 4500, 2200, 'Complete home bar starter kit including a 750ml shaker, jigger, strainer, and bar spoon. Stainless steel finish.', 20, 'https://images.unsplash.com/photo-1575037614876-c38a4d44f5b8?auto=format&fit=crop&q=80&w=800', 'Live', true),
('Double-Hinged Corkscrew', 'Sommelier Select', 'essentials', 1200, 400, 'Professional-grade corkscrew with a built-in foil cutter. Effortless opening for your vintage wine collection.', 100, 'https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?auto=format&fit=crop&q=80&w=800', 'Live', false),
('Luxury Ice Bucket', 'Chilled Life', 'essentials', 5800, 2800, 'Double-walled insulated ice bucket. Keeps your ice frozen for hours. Includes tongs and a premium leather finish.', 15, 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&q=80&w=800', 'Live', true)
ON CONFLICT (sku) DO NOTHING;
