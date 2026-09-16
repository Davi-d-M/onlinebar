-- SEED: ONLINE BAR MASTER BEVERAGE HIERARCHY

-- 1. Root Categories
INSERT INTO public.product_categories_v2 (name, slug, icon_name) VALUES
('Whisky', 'whisky', 'Wine'),
('Gin', 'gin', 'GlassWater'),
('Vodka', 'vodka', 'Zap'),
('Rum', 'rum', 'Wine'),
('Wine', 'wine', 'Wine'),
('Beer', 'beer', 'Beer'),
('Cider', 'cider', 'GlassWater'),
('RTD', 'rtd', 'Zap'),
('Soft Drink', 'soft-drink', 'GlassWater'),
('Water', 'water', 'GlassWater');

-- 2. Subcategories (Example: Whisky)
DO $$
DECLARE
    whisky_id UUID;
    gin_id UUID;
BEGIN
    SELECT id INTO whisky_id FROM public.product_categories_v2 WHERE slug = 'whisky';
    SELECT id INTO gin_id FROM public.product_categories_v2 WHERE slug = 'gin';

    INSERT INTO public.product_categories_v2 (parent_id, name, slug) VALUES
    (whisky_id, 'Scotch Blended', 'scotch-blended'),
    (whisky_id, 'Single Malt', 'single-malt'),
    (whisky_id, 'Bourbon', 'bourbon'),
    (whisky_id, 'Irish Whiskey', 'irish-whiskey'),
    (gin_id, 'London Dry', 'london-dry'),
    (gin_id, 'Pink Gin', 'pink-gin'),
    (gin_id, 'Craft Gin', 'craft-gin');
END $$;

-- 3. Brands
INSERT INTO public.product_brands (name, slug, owner_company, distributor_kenya, origin_country) VALUES
('Johnnie Walker', 'johnnie-walker', 'Asahi/Diageo', 'EABL', 'Scotland'),
('Jameson', 'jameson', 'Pernod Ricard', 'Pernod Ricard Kenya', 'Ireland'),
('Gordon''s', 'gordons', 'Asahi/Diageo', 'EABL', 'UK'),
('Tanqueray', 'tanqueray', 'Asahi/Diageo', 'EABL', 'UK'),
('Smirnoff', 'smirnoff', 'Asahi/Diageo', 'EABL', 'International'),
('Tusker', 'tusker', 'EABL', 'EABL', 'Kenya'),
('Bila Shaka', 'bila-shaka', 'Bila Shaka Brewing', 'Direct', 'Kenya'),
('Coca-Cola', 'coca-cola', 'The Coca-Cola Company', 'Coca-Cola Beverages Africa', 'USA'),
('Hendrick''s', 'hendricks', 'William Grant & Sons', 'Multiple', 'Scotland');
