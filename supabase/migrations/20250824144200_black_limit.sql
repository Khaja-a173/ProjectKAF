/*
  # Fix Order Status Enum and Add Idempotency

  1. Enum Updates
    - Add "placed" to order_status enum
    - Ensure all required status values exist

  2. New Columns
    - Add idempotency_key to orders table
    - Add cart_version to table_sessions table

  3. Constraints
    - Unique constraint on (tenant_id, idempotency_key)
    - Unique active order per table constraint

  4. RPC Function
    - checkout_order function with transaction safety
    - Handles idempotency and optimistic locking
*/

-- Add "placed" to order_status enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'placed' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')
  ) THEN
    ALTER TYPE order_status ADD VALUE 'placed';
  END IF;
END $$;

-- Add idempotency_key column to orders table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'idempotency_key'
  ) THEN
    ALTER TABLE orders ADD COLUMN idempotency_key TEXT;
  END IF;
END $$;

-- Add cart_version column to table_sessions if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'table_sessions' AND column_name = 'cart_version'
  ) THEN
    ALTER TABLE table_sessions ADD COLUMN cart_version INTEGER DEFAULT 0 NOT NULL;
  END IF;
END $$;

-- Create unique constraint on idempotency key if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'ux_orders_tenant_idem'
  ) THEN
    CREATE UNIQUE INDEX ux_orders_tenant_idem ON orders (tenant_id, idempotency_key);
  END IF;
END $$;

-- Create unique constraint for active orders per table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'ux_orders_active_per_table'
  ) THEN
    CREATE UNIQUE INDEX ux_orders_active_per_table 
    ON orders (tenant_id, table_id) 
    WHERE table_id IS NOT NULL 
    AND status IN ('pending', 'processing', 'confirmed', 'preparing', 'ready', 'placed');
  END IF;
END $$;

-- Create or replace the checkout_order RPC function
CREATE OR REPLACE FUNCTION checkout_order(
  p_tenant_id UUID,
  p_session_id TEXT,
  p_mode TEXT,
  p_table_id UUID,
  p_cart_version INTEGER,
  p_idempotency_key TEXT,
  p_total_cents INTEGER
) RETURNS TABLE(order_id UUID, duplicate BOOLEAN) AS $$
DECLARE
  v_order_id UUID;
  v_existing_order_id UUID;
  v_current_cart_version INTEGER;
BEGIN
  -- Check for existing order with same idempotency key
  SELECT id INTO v_existing_order_id 
  FROM orders 
  WHERE tenant_id = p_tenant_id 
  AND idempotency_key = p_idempotency_key;
  
  IF v_existing_order_id IS NOT NULL THEN
    -- Return existing order (idempotent replay)
    RETURN QUERY SELECT v_existing_order_id, TRUE;
    RETURN;
  END IF;
  
  -- For table mode, check cart version (optimistic locking)
  IF p_mode = 'table' AND p_table_id IS NOT NULL THEN
    SELECT cart_version INTO v_current_cart_version 
    FROM table_sessions 
    WHERE tenant_id = p_tenant_id 
    AND table_id = p_table_id 
    AND status = 'active';
    
    IF v_current_cart_version IS NOT NULL AND p_cart_version <= v_current_cart_version THEN
      RAISE EXCEPTION 'stale_cart';
    END IF;
    
    -- Check for existing active order on this table
    SELECT id INTO v_existing_order_id 
    FROM orders 
    WHERE tenant_id = p_tenant_id 
    AND table_id = p_table_id 
    AND status IN ('pending', 'processing', 'confirmed', 'preparing', 'ready', 'placed');
    
    IF v_existing_order_id IS NOT NULL THEN
      RAISE EXCEPTION 'active_order_exists';
    END IF;
  END IF;
  
  -- Create new order
  v_order_id := gen_random_uuid();
  
  INSERT INTO orders (
    id,
    tenant_id,
    table_id,
    order_number,
    order_type,
    status,
    subtotal,
    tax_amount,
    total_amount,
    total_cents,
    mode,
    session_id,
    idempotency_key
  ) VALUES (
    v_order_id,
    p_tenant_id,
    p_table_id,
    'ORD-' || UPPER(SUBSTRING(v_order_id::TEXT FROM 1 FOR 8)),
    CASE WHEN p_mode = 'table' THEN 'dine_in' ELSE 'takeaway' END,
    'placed',
    p_total_cents / 100.0,
    (p_total_cents / 100.0) * 0.08,
    (p_total_cents / 100.0) * 1.08,
    p_total_cents,
    p_mode,
    p_session_id,
    p_idempotency_key
  );
  
  -- Update cart version for table sessions (optimistic lock increment)
  IF p_mode = 'table' AND p_table_id IS NOT NULL THEN
    UPDATE table_sessions 
    SET cart_version = cart_version + 1 
    WHERE tenant_id = p_tenant_id 
    AND table_id = p_table_id 
    AND status = 'active';
  END IF;
  
  -- Return new order
  RETURN QUERY SELECT v_order_id, FALSE;
END;
$$ LANGUAGE plpgsql;