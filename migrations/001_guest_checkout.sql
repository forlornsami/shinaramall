-- Migration: Guest Checkout support
-- Adds guest order fields to orders table and guest checkout toggle to store settings

-- 1. Allow orders without a user account (guest orders)
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- 2. Guest identity fields
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_name varchar;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_email varchar;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_phone varchar;

-- 3. Unguessable capability token for guest payment-proof upload
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_token varchar;

-- 4. Admin toggle: enable or disable guest checkout
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS guest_checkout_enabled boolean DEFAULT false;
