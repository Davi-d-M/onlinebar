-- ONLINE BAR: PRODUCT ENRICHMENT (SENSORY & SERVE)
-- Expands beverage_specs with structured DNA and serving protocols.

-- 1. Update existing products with Elite Specs (Example: Whiskey)
UPDATE public.products
SET beverage_specs = jsonb_build_object(
    'sensory_dna', '{"body": 85, "sweetness": 40, "oak": 75, "smoke": 80, "intensity": 90}',
    'perfect_serve', '{"mixer": "Ginger Ale", "mixer_id": 1, "ice": "Clear Block", "garnish": "Lemon Twist", "glassware": "Tumbler"}',
    'origin', 'Scotland',
    'abv', '40%',
    'batch_no', 'OB-2026-X12'
)
WHERE category = 'whiskey' AND name ILIKE '%Black Label%';

-- 2. Update existing products with Elite Specs (Example: Wine)
UPDATE public.products
SET beverage_specs = jsonb_build_object(
    'sensory_dna', '{"body": 70, "sweetness": 20, "oak": 60, "smoke": 10, "intensity": 65}',
    'perfect_serve', '{"mixer": null, "ice": "Slightly Chilled", "garnish": "None", "glassware": "Bordeaux Glass"}',
    'origin', 'France',
    'abv', '13.5%',
    'batch_no', 'CH-2026-V8'
)
WHERE category = 'wine';
