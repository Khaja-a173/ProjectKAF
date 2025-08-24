/*
  # Fix Order Status Enum Values

  1. Database Schema Fix
    - Add missing 'placed' status to order_status enum
    - Update constraints to use correct enum values
    - Ensure all indexes use valid enum values

  2. Security
    - Maintain existing RLS policies
    - Preserve all existing constraints

  3. Changes
    - Add 'placed' to order_status enum
    - Update unique index to use correct values
    - Add idempotency constraint
*/

-- Add 'placed' to the order_status enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'placed' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')
  ) THEN
    ALTER TYPE order_status ADD VALUE 'placed' BEFORE 'processing';
  END IF;
END $$;

-- Drop the problematic index if it exists
DROP INDEX IF EXISTS ux_orders_active_per_table;

-- Create the corrected unique index with valid enum values
CREATE UNIQUE INDEX IF NOT EXISTS ux_orders_active_per_table 
ON orders (tenant_id, table_id) 
WHERE table_id IS NOT NULL 
AND status IN ('pending', 'processing', 'confirmed', 'preparing', 'ready', 'placed');

-- Add idempotency constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'ux_orders_tenant_idem' 
    AND table_name = 'orders'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT ux_orders_tenant_idem 
    UNIQUE (tenant_id, idempotency_key);
  END IF;
END $$;

-- Add idempotency_key column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' 
    AND column_name = 'idempotency_key'
  ) THEN
    ALTER TABLE orders ADD COLUMN idempotency_key TEXT;
  END IF;
END $$;

-- Add cart_version column if it doesn't exist (for optimistic locking)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'table_sessions' 
    AND column_name = 'cart_version'
  ) THEN
    ALTER TABLE table_sessions ADD COLUMN cart_version INTEGER DEFAULT 0 NOT NULL;
  END IF;
END $$;

-- Create checkout_order RPC function
CREATE OR REPLACE FUNCTION checkout_order(
  p_tenant_id UUID,
  p_session_id TEXT,
  p_mode TEXT,
  p_table_id UUID DEFAULT NULL,
  p_cart_version INTEGER DEFAULT 0,
  p_idempotency_key TEXT DEFAULT NULL,
  p_total_cents INTEGER DEFAULT 0
)
RETURNS TABLE(order_id UUID, duplicate BOOLEAN) AS $$
DECLARE
  v_order_id UUID;
  v_order_number TEXT;
  v_existing_order UUID;
  v_current_cart_version INTEGER;
BEGIN
  -- Check for existing order with same idempotency key
  SELECT id INTO v_existing_order
  FROM orders 
  WHERE tenant_id = p_tenant_id 
  AND idempotency_key = p_idempotency_key;
  
  IF v_existing_order IS NOT NULL THEN
    -- Return existing order (idempotent replay)
    RETURN QUERY SELECT v_existing_order, TRUE;
    RETURN;
  END IF;
  
  -- Check cart version for optimistic locking (if session exists)
  IF p_session_id IS NOT NULL THEN
    SELECT cart_version INTO v_current_cart_version
    FROM table_sessions 
    WHERE id = p_session_id AND tenant_id = p_tenant_id;
    
    IF v_current_cart_version IS NOT NULL AND p_cart_version <= v_current_cart_version THEN
      RAISE EXCEPTION 'stale_cart';
    END IF;
  END IF;
  
  -- Check for active order on table (dine-in only)
  IF p_mode = 'table' AND p_table_id IS NOT NULL THEN
    SELECT id INTO v_existing_order
    FROM orders 
    WHERE tenant_id = p_tenant_id 
    AND table_id = p_table_id 
    AND status IN ('pending', 'processing', 'confirmed', 'preparing', 'ready', 'placed');
    
    IF v_existing_order IS NOT NULL THEN
      RAISE EXCEPTION 'active_order_exists';
    END IF;
  END IF;
  
  -- Generate order number
  v_order_id := gen_random_uuid();
  v_order_number := 'ORD-' || UPPER(SUBSTRING(v_order_id::TEXT FROM 1 FOR 8));
  
  -- Create new order
  INSERT INTO orders (
    id,
    tenant_id,
    order_number,
    table_id,
    status,
    subtotal,
    tax_amount,
    total_amount,
    total_cents,
    session_id,
    mode,
    idempotency_key
  ) VALUES (
    v_order_id,
    p_tenant_id,
    v_order_number,
    p_table_id,
    'placed',
    p_total_cents / 100.0,
    0,
    p_total_cents / 100.0,
    p_total_cents,
    p_session_id,
    p_mode,
    p_idempotency_key
  );
  
  -- Update cart version (optimistic lock)
  IF p_session_id IS NOT NULL THEN
    UPDATE table_sessions 
    SET cart_version = p_cart_version + 1
    WHERE id = p_session_id AND tenant_id = p_tenant_id;
  END IF;
  
  RETURN QUERY SELECT v_order_id, FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;