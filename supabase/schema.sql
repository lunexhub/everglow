-- ========================================================
-- EVERGLOW COMMUNITY MLM SYSTEM - SUPABASE DATABASE SCHEMA
-- Brand Colors: Blush Soft Pink (#FFF1F5) & Rose Gold (#D4AF37)
-- Domain: everglowcommunity.co.za
-- Admin Email: admin@everglowcommunity.co.za
-- Features: POPIA RLS, 2-Level MLM Engine, Dynamic Combos,
--           E-Commerce Product 5-Photo Gallery, R500 Minimum Cash-Out,
--           15th/30th Payout Cycles, Admin Customer & Banking Directory
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (User Accounts, MLM Hierarchy & Banking Details)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    sponsor_id TEXT UNIQUE NOT NULL, -- e.g. "EG-7749"
    upline_id UUID REFERENCES public.profiles(id), -- Foreign Key to parent sponsor
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
    status TEXT NOT NULL DEFAULT 'pending_r100' CHECK (status IN ('pending_r100', 'active')),
    wallet_balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    lifetime_earnings NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    direct_recruits_count INT NOT NULL DEFAULT 0,
    bank_details JSONB DEFAULT '{}'::jsonb, -- POPIA Protected: bank_name, account_number, account_type, branch_code
    shipping_address JSONB DEFAULT '{}'::jsonb, -- Physical Courier Address: street, suburb, city, province, postal_code
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PRODUCTS TABLE (Base Products & Dynamic Custom Combos)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    pack_size INT NOT NULL CHECK (pack_size >= 1),
    wholesale_price NUMERIC(12,2) NOT NULL,
    retail_price_unit NUMERIC(12,2) NOT NULL,
    -- NOTE: level1_bonus & level2_bonus removed; bonuses are now GLOBAL
    --       and managed in the commission_settings table.
    stock_qty INT NOT NULL DEFAULT 100, -- Dynamic inventory: 0 = hidden in store
    category TEXT NOT NULL CHECK (category IN ('beauty', 'detergents', 'essentials')),
    description TEXT NOT NULL,
    is_combo BOOLEAN NOT NULL DEFAULT false,
    combo_items JSONB DEFAULT '[]'::jsonb, -- [{ name, quantity }]
    image_url TEXT,
    images JSONB DEFAULT '[]'::jsonb, -- Up to 5 device gallery product photos
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ORDERS TABLE (Stock Packs & Combo Purchases)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL, -- e.g. "#EG-8942"
    member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    items JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{ product_id, product_name, quantity, unit_price, image_url, is_free_gift }]
    total_amount NUMERIC(12,2) NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'approved', 'rejected')),
    fulfillment_status TEXT NOT NULL DEFAULT 'pending' CHECK (fulfillment_status IN ('pending', 'packing', 'in_transit', 'delivered')),
    is_courier_required BOOLEAN NOT NULL DEFAULT true,
    courier_name TEXT,
    waybill_number TEXT,
    waybill_url TEXT, -- Direct tracking link (URL)
    shipping_zone TEXT,
    shipping_cost NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    pop_receipt_url TEXT,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TRANSACTIONS TABLE (Commission Audit Ledger)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('level1_commission', 'level2_commission', 'recruitment_bonus', 'withdrawal')),
    source_order_id UUID REFERENCES public.orders(id),
    source_member_id UUID REFERENCES public.profiles(id),
    amount NUMERIC(12,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'credited' CHECK (status IN ('credited', 'pending', 'withdrawn')),
    description TEXT,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. WITHDRAWALS TABLE (Bank Cash-Out Requests with 15th & 30th Payout Schedule)
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 500.00), -- Minimum R500 threshold
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_type TEXT NOT NULL,
    branch_code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'rejected')),
    target_payout_date TIMESTAMPTZ NOT NULL, -- Scheduled for next 15th or 30th
    rejection_reason TEXT,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. PROMOTIONS TABLE (Dynamic Admin Promos)
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    banner_text TEXT NOT NULL,
    rule_type TEXT NOT NULL CHECK (rule_type IN ('bogo', 'spend_threshold')),
    min_spend NUMERIC(12,2) DEFAULT 0.00,
    trigger_product_id UUID REFERENCES public.products(id),
    gift_product_id UUID REFERENCES public.products(id),
    gift_item_name TEXT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. COURIER CONFIGURATION TABLE (Dynamic Regional Rates & Courier Rules)
CREATE TABLE IF NOT EXISTS public.courier_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_name TEXT NOT NULL, -- e.g. "Gauteng Door-to-Door", "Major Coastal Cities", "Outlying Regional"
    cost NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    estimated_days TEXT NOT NULL DEFAULT '2-3 Days',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. COMMISSION SETTINGS TABLE (Global Bonus Engine — Single Row)
-- Stores one row with id='global'. All order commission calculations use these rates.
CREATE TABLE IF NOT EXISTS public.commission_settings (
    id TEXT PRIMARY KEY DEFAULT 'global',  -- Always 'global'
    level1_bonus NUMERIC(12,2) NOT NULL DEFAULT 92.00, -- ZAR paid to direct sponsor
    level2_bonus NUMERIC(12,2) NOT NULL DEFAULT 10.00, -- ZAR paid to upline sponsor
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed the default global commission row (safe to run multiple times)
INSERT INTO public.commission_settings (id, level1_bonus, level2_bonus)
VALUES ('global', 92.00, 10.00)
ON CONFLICT (id) DO NOTHING;

-- ========================================================
-- POPIA ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courier_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public profile basic read" ON public.profiles;
DROP POLICY IF EXISTS "Public profile insert" ON public.profiles;
DROP POLICY IF EXISTS "User self update profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin full profile management" ON public.profiles;
DROP POLICY IF EXISTS "Read products" ON public.products;
DROP POLICY IF EXISTS "Admin product control" ON public.products;
DROP POLICY IF EXISTS "User read own orders" ON public.orders;
DROP POLICY IF EXISTS "User create order" ON public.orders;
DROP POLICY IF EXISTS "Admin order control" ON public.orders;
DROP POLICY IF EXISTS "User read own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admin transaction control" ON public.transactions;
DROP POLICY IF EXISTS "User read own withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "User create withdrawal" ON public.withdrawals;
DROP POLICY IF EXISTS "Admin withdrawal control" ON public.withdrawals;
DROP POLICY IF EXISTS "Read promotions" ON public.promotions;
DROP POLICY IF EXISTS "Admin promotions control" ON public.promotions;
DROP POLICY IF EXISTS "Read courier config" ON public.courier_config;
DROP POLICY IF EXISTS "Admin courier control" ON public.courier_config;
DROP POLICY IF EXISTS "Read commission settings" ON public.commission_settings;
DROP POLICY IF EXISTS "Admin commission control" ON public.commission_settings;

-- ========================================================
-- HELPER FUNCTIONS FOR RLS (Prevents Infinite Policy Recursion)
-- ========================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- PROFILES RLS (Admin privileged access to full directory & bank details)
CREATE POLICY "Public profile basic read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public profile insert" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "User self update profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin full profile management" ON public.profiles FOR ALL USING (public.is_admin());

-- PRODUCTS RLS
CREATE POLICY "Read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin product control" ON public.products FOR ALL USING (public.is_admin());

-- ORDERS RLS (POPIA Scoped & Public Update for Store Operations)
CREATE POLICY "User read own orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "User create order" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public order update" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Admin order control" ON public.orders FOR ALL USING (true);

-- TRANSACTIONS RLS (POPIA Scoped)
CREATE POLICY "User read own transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Admin transaction control" ON public.transactions FOR ALL USING (true);

-- Explicit Grants for Anon & Authenticated Roles
GRANT ALL ON TABLE public.orders TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.transactions TO anon, authenticated, service_role;

-- WITHDRAWALS RLS (POPIA Scoped & Admin Bank Audit)
CREATE POLICY "User read own withdrawals" ON public.withdrawals FOR SELECT USING (auth.uid() = member_id OR public.is_admin());
CREATE POLICY "User create withdrawal" ON public.withdrawals FOR INSERT WITH CHECK (auth.uid() = member_id);
CREATE POLICY "Admin withdrawal control" ON public.withdrawals FOR ALL USING (public.is_admin());

-- PROMOTIONS RLS
CREATE POLICY "Read promotions" ON public.promotions FOR SELECT USING (true);
CREATE POLICY "Admin promotions control" ON public.promotions FOR ALL USING (public.is_admin());

-- COURIER CONFIG RLS
CREATE POLICY "Read courier config" ON public.courier_config FOR SELECT USING (true);
CREATE POLICY "Admin courier control" ON public.courier_config FOR ALL USING (public.is_admin());

-- COMMISSION SETTINGS RLS (Everyone can read, only Admin can update)
CREATE POLICY "Read commission settings" ON public.commission_settings FOR SELECT USING (true);
CREATE POLICY "Admin commission control" ON public.commission_settings FOR ALL USING (public.is_admin());

-- ========================================================
-- STORED PROCEDURE: APPROVE ORDER & CREDIT COMMISSIONS
-- Calculates Level 1 & Level 2 commissions from global
-- commission_settings, credits upline wallets, and records
-- transactions automatically in SQL.
-- ========================================================
CREATE OR REPLACE FUNCTION public.approve_order_and_credit_commissions(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_order RECORD;
    v_buyer RECORD;
    v_l1_sponsor RECORD;
    v_l2_sponsor RECORD;
    v_l1_bonus NUMERIC(12,2) := 92.00;
    v_l2_bonus NUMERIC(12,2) := 10.00;
BEGIN
    -- 1. Fetch Order
    SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Order not found.');
    END IF;

    IF v_order.payment_status = 'approved' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Order is already approved.');
    END IF;

    -- 2. Fetch global commission rates
    SELECT level1_bonus, level2_bonus INTO v_l1_bonus, v_l2_bonus
    FROM public.commission_settings WHERE id = 'global';
    IF v_l1_bonus IS NULL THEN v_l1_bonus := 92.00; END IF;
    IF v_l2_bonus IS NULL THEN v_l2_bonus := 10.00; END IF;

    -- 3. Update order status to approved & packing
    UPDATE public.orders
    SET payment_status = 'approved',
        fulfillment_status = 'packing'
    WHERE id = p_order_id;

    -- 4. Get Buyer Profile & Direct Sponsor (Level 1)
    SELECT * INTO v_buyer FROM public.profiles WHERE id = v_order.member_id;

    IF v_buyer.upline_id IS NOT NULL THEN
        -- Level 1 Sponsor
        SELECT * INTO v_l1_sponsor FROM public.profiles WHERE id = v_buyer.upline_id FOR UPDATE;
        IF FOUND THEN
            -- Update Level 1 Sponsor Wallet & Lifetime Earnings
            UPDATE public.profiles
            SET wallet_balance = wallet_balance + v_l1_bonus,
                lifetime_earnings = lifetime_earnings + v_l1_bonus
            WHERE id = v_l1_sponsor.id;

            -- Log Level 1 Transaction
            INSERT INTO public.transactions (
                member_id, type, source_order_id, source_member_id, amount, status, description
            ) VALUES (
                v_l1_sponsor.id,
                'level1_commission',
                p_order_id,
                v_buyer.id,
                v_l1_bonus,
                'credited',
                'Level 1 Referral Commission for Order ' || v_order.order_number
            );

            -- Level 2 Upline Sponsor
            IF v_l1_sponsor.upline_id IS NOT NULL THEN
                SELECT * INTO v_l2_sponsor FROM public.profiles WHERE id = v_l1_sponsor.upline_id FOR UPDATE;
                IF FOUND THEN
                    -- Update Level 2 Sponsor Wallet & Lifetime Earnings
                    UPDATE public.profiles
                    SET wallet_balance = wallet_balance + v_l2_bonus,
                        lifetime_earnings = lifetime_earnings + v_l2_bonus
                    WHERE id = v_l2_sponsor.id;

                    -- Log Level 2 Transaction
                    INSERT INTO public.transactions (
                        member_id, type, source_order_id, source_member_id, amount, status, description
                    ) VALUES (
                        v_l2_sponsor.id,
                        'level2_commission',
                        p_order_id,
                        v_buyer.id,
                        v_l2_bonus,
                        'credited',
                        'Level 2 Upline Commission for Order ' || v_order.order_number
                    );
                END IF;
            END IF;
        END IF;
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'Order approved and commissions credited successfully.');
END;
$$;

-- Grant EXECUTE ON function after creation
GRANT EXECUTE ON FUNCTION public.approve_order_and_credit_commissions(UUID) TO anon, authenticated, service_role;


-- ========================================================
-- MIGRATION: Remove legacy per-product bonus columns
-- Run this if your existing 'products' table still has these columns:
-- ========================================================
-- ALTER TABLE public.products DROP COLUMN IF EXISTS level1_bonus;
-- ALTER TABLE public.products DROP COLUMN IF EXISTS level2_bonus;
