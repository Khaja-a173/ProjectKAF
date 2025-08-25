/*
  # Order Idempotency and Optimistic Locking

  1. Database Changes
    - Add `idempotency_key` column to orders table
    - Add `cart_version` column for optimistic locking
    - Create unique constraint on (tenant_id, idempotency_key)
    - Create partial unique constraint for active orders per table
    - Add indexes for performance

  2. Stored Procedure
    - `checkout_order` RPC function with transaction safety
    - Handles idempotency, cart versioning, and table locking
    - Returns consistent response format

  3. Security
    - Maintains RLS policies
    - Prevents duplicate orders
    - Enforces one active order per table for dine-in
*/

-- Add idempotency and versioning columns to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'idempotency_key'
  ) THEN
    ALTER TABLE orders ADD COLUMN idempotency_key text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'cart_version'
  ) THEN
    ALTER TABLE orders ADD COLUMN cart_version integer DEFAULT 0;
  END IF;
END $$;

-- Add cart_version to table_sessions for optimistic locking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'table_sessions' AND column_name = 'cart_version'
  ) THEN
    ALTER TABLE table_sessions ADD COLUMN cart_version integer DEFAULT 0;
  END IF;
END $$;

-- Create unique constraint for idempotency
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'ux_orders_tenant_idempotency'
  ) THEN
    CREATE UNIQUE INDEX ux_orders_tenant_idempotency 
    ON orders (tenant_id, idempotency_key) 
    WHERE idempotency_key IS NOT NULL;
  END IF;
END $$;

-- Create partial unique constraint: one active order per table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'ux_orders_active_per_table'
  ) THEN
    CREATE UNIQUE INDEX ux_orders_active_per_table 
    ON orders (tenant_id, table_id) 
    WHERE table_id IS NOT NULL 
    AND status IN ('pending', 'processing', 'placed', 'confirmed', 'preparing', 'ready');
  END IF;
END $$;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_orders_idempotency 
ON orders (idempotency_key) 
WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_cart_version 
ON orders (tenant_id, cart_version);

CREATE INDEX IF NOT EXISTS idx_table_sessions_cart_version 
ON table_sessions (tenant_id, cart_version);

-- Idempotent order checkout function
CREATE OR REPLACE FUNCTION checkout_order(
  p_tenant_id uuid,
  p_session_id text,
  p_mode text,
  p_table_id uuid DEFAULT NULL,
  p_cart_version integer DEFAULT 0,
  p_idempotency_key text DEFAULT NULL,
  p_total_cents integer DEFAULT 0
)
RETURNS TABLE(order_id uuid, duplicate boolean, order_number text, status text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id uuid;
  v_order_number text;
  v_current_cart_version integer;
  v_existing_order_id uuid;
BEGIN
  -- Validate required parameters
  IF p_tenant_id IS NULL OR p_session_id IS NULL OR p_idempotency_key IS NULL THEN
    RAISE EXCEPTION 'missing_required_params';
  END IF;

  -- Validate table requirement for dine-in
  IF p_mode = 'table' AND p_table_id IS NULL THEN
    RAISE EXCEPTION 'table_required';
  END IF;

  -- Check for existing order with same idempotency key (fast path)
  SELECT id, order_number, status INTO v_existing_order_id, v_order_number, status
  FROM orders 
  WHERE tenant_id = p_tenant_id 
    AND idempotency_key = p_idempotency_key
  LIMIT 1;

  IF v_existing_order_id IS NOT NULL THEN
    -- Return existing order (idempotent replay)
    RETURN QUERY SELECT v_existing_order_id, true, v_order_number, status;
    RETURN;
  END IF;

  -- Start transaction for order creation
  BEGIN
    -- Check cart version (optimistic locking)
    IF p_mode = 'table' AND p_table_id IS NOT NULL THEN
      SELECT cart_version INTO v_current_cart_version
      FROM table_sessions
      WHERE tenant_id = p_tenant_id 
        AND table_id = p_table_id 
        AND status = 'active'
      FOR UPDATE;

      IF v_current_cart_version IS NULL THEN
        RAISE EXCEPTION 'session_not_found';
      END IF;

      IF p_cart_version <= v_current_cart_version THEN
        RAISE EXCEPTION 'stale_cart';
      END IF;
    END IF;

    -- Check for active order on table (dine-in only)
    IF p_mode = 'table' AND p_table_id IS NOT NULL THEN
      SELECT id INTO v_existing_order_id
      FROM orders
      WHERE tenant_id = p_tenant_id
        AND table_id = p_table_id
        AND status IN ('pending', 'processing', 'placed', 'confirmed', 'preparing', 'ready')
      LIMIT 1;

      IF v_existing_order_id IS NOT NULL THEN
        RAISE EXCEPTION 'active_order_exists';
      END IF;
    END IF;

    -- Generate order ID and number
    v_order_id := gen_random_uuid();
    v_order_number := 'ORD-' || UPPER(SUBSTRING(v_order_id::text FROM 1 FOR 8));

    -- Create order
    INSERT INTO orders (
      id,
      tenant_id,
      session_id,
      table_id,
      order_number,
      mode,
      status,
      subtotal,
      tax_amount,
      total_amount,
      total_cents,
      cart_version,
      idempotency_key,
      created_at,
      updated_at
    ) VALUES (
      v_order_id,
      p_tenant_id,
      p_session_id,
      p_table_id,
      v_order_number,
      p_mode,
      'placed',
      (p_total_cents / 100.0) * 0.926, -- approximate subtotal (total - 8% tax)
      (p_total_cents / 100.0) * 0.074, -- approximate tax
      p_total_cents / 100.0,
      p_total_cents,
      p_cart_version,
      p_idempotency_key,
      now(),
      now()
    );

    -- Update cart version (optimistic lock)
    IF p_mode = 'table' AND p_table_id IS NOT NULL THEN
      UPDATE table_sessions 
      SET cart_version = p_cart_version,
          locked_at = now()
      WHERE tenant_id = p_tenant_id 
        AND table_id = p_table_id 
        AND status = 'active';
    END IF;

    -- Return new order
    RETURN QUERY SELECT v_order_id, false, v_order_number, 'placed'::text;

  EXCEPTION
    WHEN unique_violation THEN
      -- Handle race condition on idempotency key
      IF SQLSTATE = '23505' THEN
        SELECT id, order_number, status INTO v_existing_order_id, v_order_number, status
        FROM orders 
        WHERE tenant_id = p_tenant_id 
          AND idempotency_key = p_idempotency_key
        LIMIT 1;

        IF v_existing_order_id IS NOT NULL THEN
          RETURN QUERY SELECT v_existing_order_id, true, v_order_number, status;
          RETURN;
        END IF;
      END IF;
      RAISE;
  END;
END;
$$;