-- Safe drop to avoid invalid partial predicate
DROP INDEX IF EXISTS public.ux_orders_active_per_table;

-- Create correct partial unique index
CREATE UNIQUE INDEX ux_orders_active_per_table
  ON public.orders(tenant_id, table_id)
  WHERE table_id IS NOT NULL AND status IN ('pending','processing');
