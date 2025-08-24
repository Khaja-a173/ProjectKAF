/*
  # Order Idempotency and Cart Optimistic Locking

  1. Order Table Enhancement
    - Add idempotency_key column for duplicate prevention
    - Add cart_version to table_sessions for optimistic locking
    - Add mode column to distinguish table vs takeaway orders
    - Add total_cents for precise monetary calculations

  2. Constraints
    - Unique constraint on (tenant_id, idempotency_key) prevents duplicate orders
    - Partial unique index on (tenant_id, table_id) for active orders only
    - One active order per table for dine-in mode

  3. Security
    - RLS policies enforce tenant isolation
    - Service role required for order operations
*/

-- orders table (create if missing, otherwise patch in columns)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  session_id text not null,
  table_id uuid null,
  mode text not null check (mode in ('table','takeaway')),
  total_cents integer not null default 0,
  status text not null default 'pending' check (status in ('pending','processing','paid','cancelled')),
  idempotency_key text not null,
  created_at timestamptz not null default now()
);

-- Columns (idempotent add)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'idempotency_key'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN idempotency_key text not null default '';
    ALTER TABLE public.orders ALTER COLUMN idempotency_key DROP DEFAULT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN status text not null default 'pending';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'mode'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN mode text not null default 'takeaway';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'total_cents'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN total_cents integer not null default 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN session_id text not null default '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'table_id'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN table_id uuid null;
  END IF;
END $$;

-- Basic indexes
create index if not exists idx_orders_tenant_created on public.orders(tenant_id, created_at desc);

-- Uniqueness: tenant + idempotency_key (prevents duplicate orders for same attempt)
create unique index if not exists ux_orders_tenant_idem on public.orders(tenant_id, idempotency_key);

-- One active order per table (dine-in only): allow multiple historical/paid orders
-- Only applies when table_id is not null and status in ('pending','processing')
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'ux_orders_active_per_table'
  ) THEN
    EXECUTE $$
      CREATE UNIQUE INDEX ux_orders_active_per_table
        ON public.orders(tenant_id, table_id)
        WHERE table_id IS NOT NULL AND status IN ('pending','processing');
    $$;
  END IF;
END $$;

-- Add cart_version to table_sessions for optimistic lock (CAS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'table_sessions' AND column_name = 'cart_version'
  ) THEN
    ALTER TABLE public.table_sessions ADD COLUMN cart_version integer not null default 0;
  END IF;
END $$;

-- RLS (assume tenant_id is enforced across tables)
alter table public.orders enable row level security;

-- Deny by default
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename='orders' AND policyname='orders_same_tenant_rw'
  ) THEN
    CREATE POLICY orders_same_tenant_rw
      ON public.orders
      USING (tenant_id = (current_setting('request.jwt.claims.tenant_id', true))::uuid)
      WITH CHECK (tenant_id = (current_setting('request.jwt.claims.tenant_id', true))::uuid);
  END IF;
END $$;