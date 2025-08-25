-- =========
-- PREREQS
-- =========
create extension if not exists pgcrypto; -- for gen_random_uuid()

-- =========
-- TABLES
-- =========
create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (length(code) = 4),
  name text not null,
  plan text not null default 'basic',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.protect_tenant_code()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'UPDATE' and new.code <> old.code then
    raise exception 'tenant code is immutable';
  end if;
  return new;
end $$;

drop trigger if exists trg_protect_tenant_code on public.tenants;
create trigger trg_protect_tenant_code
before update on public.tenants
for each row execute procedure public.protect_tenant_code();

create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null, -- supabase auth uid
  role text not null check (role in ('admin','manager','waiter','kitchen')),
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  timezone text not null default 'Australia/Brisbane',
  currency text not null default 'AUD',
  created_at timestamptz not null default now()
);

create table if not exists public.tables (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  code text not null,      -- e.g., T01
  label text not null,
  seats int not null default 2,
  status text not null default 'available',
  unique (tenant_id, code)
);

create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  rank int not null default 0
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  category_id uuid not null references public.menu_categories(id) on delete cascade,
  name text not null,
  price numeric(10,2) not null check (price >= 0),
  active boolean not null default true,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  table_id uuid references public.tables(id),
  mode text not null check (mode in ('dine_in','takeaway')),
  status text not null check (status in ('new','preparing','ready','served','paid','cancelled')) default 'new',
  assigned_staff_id uuid references public.staff(id),
  subtotal numeric(10,2) not null default 0,
  tax numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid not null references public.menu_items(id),
  qty int not null check (qty > 0),
  price numeric(10,2) not null check (price >= 0)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null,     -- 'stripe' | 'razorpay' | 'cash'
  amount numeric(10,2) not null check (amount >= 0),
  status text not null check (status in ('authorized','captured','refunded','failed')),
  raw jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.customization (
  tenant_id uuid primary key references public.tenants(id) on delete cascade,
  theme text default 'default',
  logo_url text,
  hero_video text,
  palette jsonb default '{}'::jsonb
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  actor uuid,            -- staff.user_id (auth uid)
  action text not null,
  entity text not null,
  entity_id uuid not null,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.domain_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  aggregate_type text not null,   -- 'order' | 'payment' | etc
  aggregate_id uuid not null,
  event_type text not null,       -- 'OrderCreated' | ...
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_staff_user on public.staff(user_id);
create index if not exists idx_orders_tenant_status on public.orders(tenant_id, status);
create index if not exists idx_menu_items_tenant_active on public.menu_items(tenant_id, active);

-- =========
-- RLS
-- =========
alter table public.tenants enable row level security;
alter table public.staff enable row level security;
alter table public.locations enable row level security;
alter table public.tables enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.customization enable row level security;
alter table public.audit_logs enable row level security;
alter table public.domain_events enable row level security;

create or replace view public.v_current_staff as
select s.*, t.code as tenant_code
from public.staff s
join public.tenants t on t.id = s.tenant_id
where s.user_id = auth.uid();

create policy tenants_select_for_staff
on public.tenants for select
using ( exists (select 1 from public.v_current_staff v where v.tenant_id = tenants.id) );

create policy staff_rw_same_tenant
on public.staff for all
using ( exists (select 1 from public.v_current_staff v where v.tenant_id = staff.tenant_id) )
with check ( exists (select 1 from public.v_current_staff v where v.tenant_id = staff.tenant_id) );

create policy locations_rw_same_tenant
on public.locations for all
using ( exists (select 1 from public.v_current_staff v where v.tenant_id = locations.tenant_id) )
with check ( exists (select 1 from public.v_current_staff v where v.tenant_id = locations.tenant_id) );

create policy tables_rw_same_tenant
on public.tables for all
using ( exists (select 1 from public.v_current_staff v where v.tenant_id = tables.tenant_id) )
with check ( exists (select 1 from public.v_current_staff v where v.tenant_id = tables.tenant_id) );

create policy menu_categories_rw_same_tenant
on public.menu_categories for all
using ( exists (select 1 from public.v_current_staff v where v.tenant_id = menu_categories.tenant_id) )
with check ( exists (select 1 from public.v_current_staff v where v.tenant_id = menu_categories.tenant_id) );

create policy menu_items_rw_same_tenant
on public.menu_items for all
using ( exists (select 1 from public.v_current_staff v where v.tenant_id = menu_items.tenant_id) )
with check ( exists (select 1 from public.v_current_staff v where v.tenant_id = menu_items.tenant_id) );

create policy orders_rw_same_tenant
on public.orders for all
using ( exists (select 1 from public.v_current_staff v where v.tenant_id = orders.tenant_id) )
with check ( exists (select 1 from public.v_current_staff v where v.tenant_id = orders.tenant_id) );

create policy order_items_rw_same_tenant
on public.order_items for all
using ( exists (select 1 from public.v_current_staff v where v.tenant_id = order_items.tenant_id) )
with check ( exists (select 1 from public.v_current_staff v where v.tenant_id = order_items.tenant_id) );

create policy payments_rw_same_tenant
on public.payments for all
using ( exists (select 1 from public.v_current_staff v where v.tenant_id = payments.tenant_id) )
with check ( exists (select 1 from public.v_current_staff v where v.tenant_id = payments.tenant_id) );

create policy customization_rw_same_tenant
on public.customization for all
using ( exists (select 1 from public.v_current_staff v where v.tenant_id = customization.tenant_id) )
with check ( exists (select 1 from public.v_current_staff v where v.tenant_id = customization.tenant_id) );

create policy audit_logs_ro_same_tenant
on public.audit_logs for select
using ( exists (select 1 from public.v_current_staff v where v.tenant_id = audit_logs.tenant_id) );

create policy domain_events_ro_same_tenant
on public.domain_events for select
using ( exists (select 1 from public.v_current_staff v where v.tenant_id = domain_events.tenant_id) );

-- NOTE: Guest/public reads for menus will be added in Phase 3 with signed tenant tokens.