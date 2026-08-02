-- ========================================================
-- EVERGLOW COMMUNITY - OFFICIAL REAL PRODUCT & PROMO SEED
-- Execute this script in Supabase SQL Editor to populate live initial products!
-- ========================================================

-- 1. SEED INITIAL WHOLESALE PRODUCT COMBOS
INSERT INTO public.products (
    id, name, pack_size, wholesale_price, retail_price_unit, 
    level1_bonus, level2_bonus, stock_qty, category, description, 
    is_combo, combo_items, image_url, images
) VALUES 
(
    '22222222-2222-2222-2222-222222222201',
    'Combo A - Starter Beauty Mix',
    10,
    1140.00,
    220.00,
    140.00,
    20.00,
    50,
    'beauty',
    'Wholesale Beauty Combo: 4x Exfoliating Gel 50g + 6x Serum Glow 100ml.',
    true,
    '[{"product_id":"prod-001","name":"Exfoliating Gel 50g","quantity":4},{"product_id":"prod-002","name":"Serum Glow 100ml","quantity":6}]'::jsonb,
    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&auto=format&fit=crop&q=80',
    '["https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=80"]'::jsonb
),
(
    '22222222-2222-2222-2222-222222222202',
    'Combo B - Deluxe Skincare & Hair Pack',
    10,
    900.00,
    180.00,
    100.00,
    15.00,
    35,
    'beauty',
    'Wholesale Skincare Combo: 5x Serum Glow 100ml + 5x Beard & Hairline Oil 50ml.',
    true,
    '[{"product_id":"prod-002","name":"Serum Glow 100ml","quantity":5},{"product_id":"prod-003","name":"Beard & Hairline Oil 50ml","quantity":5}]'::jsonb,
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
    '["https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=80"]'::jsonb
),
(
    '22222222-2222-2222-2222-222222222203',
    'Combo C - Home Hygiene & Sanitizer Pack',
    10,
    650.00,
    130.00,
    75.00,
    10.00,
    60,
    'detergents',
    'Wholesale Detergent & Hygiene Pack: 6x Toilet Sanitizer 100ml + 4x Exfoliating Gel 50g.',
    true,
    '[{"product_id":"prod-004","name":"Toilet Sanitizer 100ml","quantity":6},{"product_id":"prod-001","name":"Exfoliating Gel 50g","quantity":4}]'::jsonb,
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
    '["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80"]'::jsonb
),
(
    '22222222-2222-2222-2222-222222222204',
    'Combo D - Royal Everglow Master Kit',
    10,
    1250.00,
    240.00,
    150.00,
    25.00,
    25,
    'beauty',
    'Wholesale All-in-One Master Combo: 4x Exfoliating Gel + 3x Serum Glow + 3x Beard Oil.',
    true,
    '[{"product_id":"prod-001","name":"Exfoliating Gel 50g","quantity":4},{"product_id":"prod-002","name":"Serum Glow 100ml","quantity":3},{"product_id":"prod-003","name":"Beard & Hairline Oil 50ml","quantity":3}]'::jsonb,
    'https://images.unsplash.com/photo-1608248597261-e4d99435b0ff?w=500&auto=format&fit=crop&q=80',
    '["https://images.unsplash.com/photo-1608248597261-e4d99435b0ff?w=500&auto=format&fit=crop&q=80"]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    wholesale_price = EXCLUDED.wholesale_price,
    stock_qty = EXCLUDED.stock_qty;

-- 2. SEED INITIAL CAMPAIGN PROMOTION
INSERT INTO public.promotions (
    id, title, banner_text, rule_type, min_spend, gift_item_name, image_url, is_active, start_date
) VALUES (
    '55555555-5555-5555-5555-555555555501',
    '🎉 Special Promotion: FREE Everglow Branded T-Shirt',
    'Spend R1,000+ and get a FREE Premium Everglow Branded Cotton T-Shirt with your order!',
    'spend_threshold',
    1000.00,
    '1x Everglow Branded T-Shirt',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80',
    true,
    NOW()
)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    is_active = EXCLUDED.is_active;
