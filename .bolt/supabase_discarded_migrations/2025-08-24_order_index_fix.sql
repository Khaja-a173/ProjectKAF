-- SAFETY: drop old/broken index if it exists (name must match)
drop index if exists public.ux_orders_active_per_table;

-- Recreate the partial unique index OUTSIDE any DO block
create unique index if not exists ux_orders_active_per_table
  on public.orders(tenant_id, table_id)
  where table_id is not null and status in ('pending','processing');