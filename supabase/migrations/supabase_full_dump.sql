--
-- PostgreSQL database dump
--

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.5

-- Started on 2025-10-02 16:16:37 AEST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 13 (class 2615 OID 16415)
-- Name: app; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA app;


ALTER SCHEMA app OWNER TO postgres;

--
-- TOC entry 22 (class 2615 OID 16416)
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- TOC entry 26 (class 2615 OID 16417)
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- TOC entry 17 (class 2615 OID 16418)
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- TOC entry 14 (class 2615 OID 16419)
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- TOC entry 15 (class 2615 OID 16420)
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- TOC entry 43 (class 2615 OID 16421)
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- TOC entry 49 (class 2615 OID 16422)
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- TOC entry 16 (class 2615 OID 16423)
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA supabase_migrations;


ALTER SCHEMA supabase_migrations OWNER TO postgres;

--
-- TOC entry 19 (class 2615 OID 16424)
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- TOC entry 6 (class 3079 OID 16425)
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA extensions;


--
-- TOC entry 5595 (class 0 OID 0)
-- Dependencies: 6
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- TOC entry 7 (class 3079 OID 87716)
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- TOC entry 5596 (class 0 OID 0)
-- Dependencies: 7
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- TOC entry 3 (class 3079 OID 16426)
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- TOC entry 5597 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- TOC entry 2 (class 3079 OID 95504)
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- TOC entry 5598 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- TOC entry 4 (class 3079 OID 16427)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- TOC entry 5599 (class 0 OID 0)
-- Dependencies: 4
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 8 (class 3079 OID 16428)
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- TOC entry 5600 (class 0 OID 0)
-- Dependencies: 8
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- TOC entry 5 (class 3079 OID 16429)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- TOC entry 5601 (class 0 OID 0)
-- Dependencies: 5
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 1350 (class 1247 OID 16782)
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- TOC entry 1353 (class 1247 OID 16923)
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- TOC entry 1356 (class 1247 OID 16776)
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- TOC entry 1359 (class 1247 OID 16771)
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- TOC entry 1362 (class 1247 OID 58407)
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


ALTER TYPE auth.oauth_registration_type OWNER TO supabase_auth_admin;

--
-- TOC entry 1365 (class 1247 OID 16965)
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- TOC entry 1375 (class 1247 OID 17528)
-- Name: notification_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.notification_type AS ENUM (
    'order',
    'payment',
    'system',
    'promotion'
);


ALTER TYPE public.notification_type OWNER TO postgres;

--
-- TOC entry 1378 (class 1247 OID 17492)
-- Name: order_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.order_status AS ENUM (
    'pending',
    'confirmed',
    'queued',
    'preparing',
    'ready',
    'out_for_delivery',
    'served',
    'paying',
    'archived',
    'cancelled',
    'canceled',
    'paid',
    'processing',
    'placed',
    'handed_over',
    'completed'
);


ALTER TYPE public.order_status OWNER TO postgres;

--
-- TOC entry 1381 (class 1247 OID 17506)
-- Name: payment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'refunded'
);


ALTER TYPE public.payment_status OWNER TO postgres;

--
-- TOC entry 1384 (class 1247 OID 35765)
-- Name: refund_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.refund_status AS ENUM (
    'requested',
    'approved',
    'processing',
    'completed',
    'failed',
    'canceled'
);


ALTER TYPE public.refund_status OWNER TO postgres;

--
-- TOC entry 1682 (class 1247 OID 105569)
-- Name: subscription_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.subscription_status AS ENUM (
    'trialing',
    'active',
    'past_due',
    'canceled',
    'incomplete',
    'incomplete_expired'
);


ALTER TYPE public.subscription_status OWNER TO postgres;

--
-- TOC entry 1387 (class 1247 OID 17518)
-- Name: table_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.table_status AS ENUM (
    'available',
    'occupied',
    'reserved',
    'maintenance',
    'locked'
);


ALTER TYPE public.table_status OWNER TO postgres;

--
-- TOC entry 1390 (class 1247 OID 17481)
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'super_admin',
    'tenant_admin',
    'manager',
    'staff',
    'customer'
);


ALTER TYPE public.user_role OWNER TO postgres;

--
-- TOC entry 1393 (class 1247 OID 17136)
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_admin;

--
-- TOC entry 1396 (class 1247 OID 17093)
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_admin;

--
-- TOC entry 1399 (class 1247 OID 17107)
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_admin;

--
-- TOC entry 1402 (class 1247 OID 17178)
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_admin;

--
-- TOC entry 1405 (class 1247 OID 17149)
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_admin;

--
-- TOC entry 1408 (class 1247 OID 19030)
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS'
);


ALTER TYPE storage.buckettype OWNER TO supabase_storage_admin;

--
-- TOC entry 668 (class 1255 OID 16445)
-- Name: add_order_status_event(uuid, uuid, text, text, uuid); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.add_order_status_event(p_tenant_id uuid, p_order_id uuid, p_from text, p_to text, p_by_staff_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
begin
  insert into public.order_status_events
    (id, tenant_id, order_id, from_status, to_status, changed_by_staff_id, changed_at)
  values
    (gen_random_uuid(), p_tenant_id, p_order_id, p_from, p_to, p_by_staff_id, now());
end;
$$;


ALTER FUNCTION app.add_order_status_event(p_tenant_id uuid, p_order_id uuid, p_from text, p_to text, p_by_staff_id uuid) OWNER TO postgres;

--
-- TOC entry 698 (class 1255 OID 16446)
-- Name: analytics_revenue(text, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.analytics_revenue(p_window text DEFAULT '30d'::text, p_granularity text DEFAULT 'day'::text) RETURNS TABLE(bucket_date date, revenue numeric, orders integer)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'extensions'
    AS $$
DECLARE
  d_start date;
  d_end   date := CURRENT_DATE;
BEGIN
  -- Resolve window → date range (inclusive)
  CASE lower(coalesce(p_window, '30d'))
    WHEN '7d'  THEN d_start := d_end - INTERVAL '6 days';
    WHEN '30d' THEN d_start := d_end - INTERVAL '29 days';
    WHEN '90d' THEN d_start := d_end - INTERVAL '89 days';
    WHEN 'mtd' THEN d_start := date_trunc('month', d_end)::date;
    WHEN 'qtd' THEN d_start := date_trunc('quarter', d_end)::date;
    WHEN 'ytd' THEN d_start := date_trunc('year', d_end)::date;
    ELSE            d_start := d_end - INTERVAL '29 days'; -- default 30d
  END CASE;

  RETURN QUERY
  WITH buckets AS (
    SELECT gs::date AS d
    FROM generate_series(d_start, d_end, '1 day') AS gs
  ),
  source AS (
    SELECT
      CASE lower(p_granularity)
        WHEN 'week'  THEN date_trunc('week', ad.day)::date
        WHEN 'month' THEN date_trunc('month', ad.day)::date
        ELSE              ad.day
      END AS bkt,
      ad.revenue_total,
      ad.orders_count
    FROM public.analytics_daily ad
    WHERE ad.day BETWEEN d_start AND d_end
      AND ad.tenant_id IN (
        SELECT s.tenant_id FROM public.staff s WHERE s.user_id = auth.uid()
      )
  ),
  rolled AS (
    SELECT
      CASE lower(p_granularity)
        WHEN 'week'  THEN date_trunc('week', d)::date
        WHEN 'month' THEN date_trunc('month', d)::date
        ELSE              d
      END AS bkt
    FROM buckets
    GROUP BY 1
  )
  SELECT
    r.bkt AS bucket_date,
    COALESCE(SUM(source.revenue_total), 0)::numeric AS revenue,
    COALESCE(SUM(source.orders_count),  0)::int     AS orders
  FROM rolled r
  LEFT JOIN source
    ON source.bkt = r.bkt
  GROUP BY r.bkt
  ORDER BY r.bkt;
END;
$$;


ALTER FUNCTION app.analytics_revenue(p_window text, p_granularity text) OWNER TO postgres;

--
-- TOC entry 488 (class 1255 OID 16447)
-- Name: analytics_summary(text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.analytics_summary(p_window text DEFAULT '7d'::text) RETURNS TABLE(period text, orders integer, revenue numeric, dine_in integer, takeaway integer)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'extensions'
    AS $$
DECLARE
  d_start date;
  d_end   date := CURRENT_DATE;
BEGIN
  -- Resolve window → date range (inclusive)
  CASE lower(coalesce(p_window, '7d'))
    WHEN '7d'  THEN d_start := d_end - INTERVAL '6 days';
    WHEN '30d' THEN d_start := d_end - INTERVAL '29 days';
    WHEN '90d' THEN d_start := d_end - INTERVAL '89 days';
    WHEN 'mtd' THEN d_start := date_trunc('month', d_end)::date;
    WHEN 'qtd' THEN d_start := date_trunc('quarter', d_end)::date;
    WHEN 'ytd' THEN d_start := date_trunc('year', d_end)::date;
    ELSE            d_start := d_end - INTERVAL '29 days';  -- default 30d
  END CASE;

  RETURN QUERY
  SELECT
    lower(coalesce(p_window,'30d'))::text AS period,
    COALESCE(SUM(ad.orders_count), 0)::int       AS orders,
    COALESCE(SUM(ad.revenue_total), 0)::numeric  AS revenue,
    COALESCE(SUM(ad.dine_in_count), 0)::int      AS dine_in,
    COALESCE(SUM(ad.takeaway_count), 0)::int     AS takeaway
  FROM public.analytics_daily ad
  WHERE ad.day BETWEEN d_start AND d_end
    AND ad.tenant_id IN (
      SELECT s.tenant_id
      FROM public.staff s
      WHERE s.user_id = auth.uid()
    );
END;
$$;


ALTER FUNCTION app.analytics_summary(p_window text) OWNER TO postgres;

--
-- TOC entry 619 (class 1255 OID 16448)
-- Name: avg_ticket_size(uuid, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.avg_ticket_size(p_tenant_id uuid, p_window text DEFAULT '30d'::text) RETURNS TABLE(window_label text, total_orders bigint, total_revenue numeric, avg_ticket numeric)
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
DECLARE
  start_ts timestamptz;
  end_ts   timestamptz := now();
BEGIN
  -- Resolve dynamic time window
  CASE lower(coalesce(p_window,'30d'))
    WHEN '7d'  THEN start_ts := now() - interval '7 days';
    WHEN '30d' THEN start_ts := now() - interval '30 days';
    WHEN '90d' THEN start_ts := now() - interval '90 days';
    WHEN 'mtd' THEN start_ts := date_trunc('month', now());
    WHEN 'qtd' THEN start_ts := date_trunc('quarter', now());
    WHEN 'ytd' THEN start_ts := date_trunc('year', now());
    WHEN 'all' THEN start_ts := '-infinity'::timestamptz;
    ELSE           start_ts := now() - interval '30 days';
  END CASE;

  RETURN QUERY
  WITH base_orders AS (
    SELECT o.id, o.total_amount
    FROM public.orders o
    WHERE o.tenant_id = p_tenant_id
      AND o.created_at >= start_ts
      AND o.created_at <= end_ts
  )
  SELECT
    p_window AS window_label,
    COUNT(*)::bigint AS total_orders,
    COALESCE(SUM(o.total_amount), 0)::numeric AS total_revenue,
    CASE WHEN COUNT(*) = 0 THEN 0
         ELSE ROUND(COALESCE(SUM(o.total_amount),0) / COUNT(*), 2)
    END AS avg_ticket
  FROM base_orders o;
END $$;


ALTER FUNCTION app.avg_ticket_size(p_tenant_id uuid, p_window text) OWNER TO postgres;

--
-- TOC entry 732 (class 1255 OID 16449)
-- Name: checkout_order(uuid, text, text, uuid, integer, text, integer); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.checkout_order(p_tenant_id uuid, p_session_id text, p_mode text, p_table_id uuid, p_cart_version integer, p_idempotency_key text, p_total_cents integer) RETURNS TABLE(order_id uuid, duplicate boolean)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
declare
  v_cur_version integer;
  v_existing_id uuid;
begin
  -- Optional tenant guard if app.current_tenant_id() is available
  if p_tenant_id <> app.current_tenant_id() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  -- Fast path: duplicate idempotency
  select id into v_existing_id
  from public.orders
  where tenant_id = p_tenant_id
    and idempotency_key = p_idempotency_key
  limit 1;

  if found then
    return query select v_existing_id, true;
  end if;

  -- Transactional critical section (table-scoped advisory lock)
  perform pg_advisory_xact_lock(hashtext(p_tenant_id::text || coalesce(p_table_id::text,'')));

  -- CAS: ensure cart_version matches and bump it
  select cart_version into v_cur_version
  from public.table_sessions
  where tenant_id = p_tenant_id and id = p_session_id
  for update;

  if not found or v_cur_version <> p_cart_version then
    raise exception 'stale_cart' using errcode = '55000';
  end if;

  update public.table_sessions
     set cart_version = cart_version + 1
   where tenant_id = p_tenant_id and id = p_session_id;

  -- One active order per table for dine-in (also enforced by partial unique index)
  if p_mode = 'table' and p_table_id is not null then
    if exists (
      select 1 from public.orders
       where tenant_id = p_tenant_id
         and table_id = p_table_id
         and status in ('pending','processing')
    ) then
      raise exception 'active_order_exists' using errcode = '55000';
    end if;
  end if;

  -- Insert order; tenant + idempotency_key unique handles duplicates
  insert into public.orders(
    tenant_id, session_id, table_id, mode, status, total_cents, idempotency_key
  ) values (
    p_tenant_id, p_session_id, case when p_mode='table' then p_table_id else null end,
    p_mode, 'pending', p_total_cents, p_idempotency_key
  )
  returning id into v_existing_id;

  return query select v_existing_id, false;
end;
$$;


ALTER FUNCTION app.checkout_order(p_tenant_id uuid, p_session_id text, p_mode text, p_table_id uuid, p_cart_version integer, p_idempotency_key text, p_total_cents integer) OWNER TO postgres;

--
-- TOC entry 724 (class 1255 OID 16450)
-- Name: confirm_payment_and_close(uuid, uuid, uuid, numeric); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.confirm_payment_and_close(p_tenant_id uuid, p_order_id uuid, p_intent_id uuid, p_amount numeric) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
declare
  v_prev text;
begin
  -- mark intent as completed
  update public.payment_intents
    set status = 'completed',
        updated_at = now()
  where id = p_intent_id
    and tenant_id = p_tenant_id
    and order_id = p_order_id;

  -- read latest order status to fill from_status
  select status into v_prev
  from public.v_orders_latest_status
  where tenant_id = p_tenant_id
    and order_id = p_order_id
  limit 1;

  -- append status event → paid
  perform app.add_order_status_event(p_tenant_id, p_order_id, coalesce(v_prev,'served'), 'paid', null);
end;
$$;


ALTER FUNCTION app.confirm_payment_and_close(p_tenant_id uuid, p_order_id uuid, p_intent_id uuid, p_amount numeric) OWNER TO postgres;

--
-- TOC entry 519 (class 1255 OID 16451)
-- Name: create_intent_for_order(uuid, text, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.create_intent_for_order(p_order_id uuid, p_currency text DEFAULT 'USD'::text, p_provider text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_amount   numeric;
  v_has_total_amount boolean;
  v_has_subtotal     boolean;
  v_has_tax_amount   boolean;
  v_has_oi_total     boolean;
  v_intent_id uuid;
BEGIN
  -- Probe available columns so we can compute amount robustly no matter the schema flavor.
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='orders' AND column_name='total_amount'
  ) INTO v_has_total_amount;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='orders' AND column_name='subtotal'
  ) INTO v_has_subtotal;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='orders' AND column_name='tax_amount'
  ) INTO v_has_tax_amount;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='order_items' AND column_name='total_price'
  ) INTO v_has_oi_total;

  -- 1) Prefer orders.total_amount if present and non-null
  IF v_has_total_amount THEN
    SELECT o.total_amount INTO v_amount
    FROM public.orders o
    WHERE o.id = p_order_id;

    IF v_amount IS NOT NULL THEN
      v_amount := COALESCE(v_amount, 0);
    END IF;
  END IF;

  -- 2) Else, try subtotal + tax_amount if both columns exist
  IF v_amount IS NULL AND v_has_subtotal AND v_has_tax_amount THEN
    SELECT (COALESCE(o.subtotal,0) + COALESCE(o.tax_amount,0)) INTO v_amount
    FROM public.orders o
    WHERE o.id = p_order_id;
  END IF;

  -- 3) Else, fallback to SUM(order_items.total_price)
  IF v_amount IS NULL AND v_has_oi_total THEN
    SELECT COALESCE(SUM(oi.total_price),0) INTO v_amount
    FROM public.order_items oi
    WHERE oi.order_id = p_order_id;
  END IF;

  -- 4) As a last resort, try orders.total_cents / 100 if column exists
  IF v_amount IS NULL THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='orders' AND column_name='total_cents'
    ) THEN
      SELECT COALESCE(o.total_cents,0)/100.0 INTO v_amount
      FROM public.orders o
      WHERE o.id = p_order_id;
    END IF;
  END IF;

  -- Safety: ensure we have a number
  v_amount := COALESCE(v_amount, 0);

  IF v_amount <= 0 THEN
    RAISE EXCEPTION 'Computed order amount (%.2f) is not positive for order %', v_amount, p_order_id
      USING ERRCODE = '22023'; -- invalid_parameter_value
  END IF;

  -- Delegate to the canonical creator (enforces tenant/staff auth inside)
  v_intent_id := app.create_payment_intent(p_order_id, v_amount, p_currency, p_provider);

  RETURN v_intent_id;
END;
$$;


ALTER FUNCTION app.create_intent_for_order(p_order_id uuid, p_currency text, p_provider text) OWNER TO postgres;

--
-- TOC entry 599 (class 1255 OID 16452)
-- Name: create_payment_intent(uuid, numeric, text, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.create_payment_intent(p_order_id uuid, p_amount numeric, p_currency text DEFAULT 'USD'::text, p_provider text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_tenant_id uuid;
  v_allowed   boolean;
  v_intent_id uuid;
BEGIN
  -- Find the tenant for the order
  SELECT o.tenant_id INTO v_tenant_id
  FROM public.orders o
  WHERE o.id = p_order_id;

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Order % not found', p_order_id USING ERRCODE = 'NO_DATA_FOUND';
  END IF;

  -- Check caller is staff of that tenant
  SELECT EXISTS (
    SELECT 1 FROM public.staff s
    WHERE s.user_id = auth.uid() AND s.tenant_id = v_tenant_id
  ) INTO v_allowed;

  IF NOT v_allowed THEN
    RAISE EXCEPTION 'Not authorized to create payment intents for this tenant' USING ERRCODE = '42501';
  END IF;

  -- Create the intent with minimal fields; status starts at 'pending'
  INSERT INTO public.payment_intents (tenant_id, order_id, amount, currency, status, provider, created_at, updated_at)
  VALUES (v_tenant_id, p_order_id, p_amount, p_currency, 'pending', p_provider, now(), now())
  RETURNING id INTO v_intent_id;

  RETURN v_intent_id;
END;
$$;


ALTER FUNCTION app.create_payment_intent(p_order_id uuid, p_amount numeric, p_currency text, p_provider text) OWNER TO postgres;

--
-- TOC entry 506 (class 1255 OID 89523)
-- Name: current_role(); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app."current_role"() RETURNS text
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$ select auth.role() $$;


ALTER FUNCTION app."current_role"() OWNER TO postgres;

--
-- TOC entry 489 (class 1255 OID 16453)
-- Name: current_tenant_id(); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.current_tenant_id() RETURNS uuid
    LANGUAGE sql STABLE
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
  select nullif(current_setting('request.jwt.claims.tenant_id', true), '')::uuid;
$$;


ALTER FUNCTION app.current_tenant_id() OWNER TO postgres;

--
-- TOC entry 5617 (class 0 OID 0)
-- Dependencies: 489
-- Name: FUNCTION current_tenant_id(); Type: COMMENT; Schema: app; Owner: postgres
--

COMMENT ON FUNCTION app.current_tenant_id() IS 'Returns tenant_id::uuid from JWT claims; NULL if absent or invalid.';


--
-- TOC entry 572 (class 1255 OID 89522)
-- Name: current_uid(); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.current_uid() RETURNS uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$ select auth.uid() $$;


ALTER FUNCTION app.current_uid() OWNER TO postgres;

--
-- TOC entry 535 (class 1255 OID 16454)
-- Name: ensure_payment_intent(uuid, uuid, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.ensure_payment_intent(p_tenant_id uuid, p_order_id uuid, p_provider text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
declare
  v_id uuid;
begin
  -- try to find existing "pending/processing" intent for this order
  select id into v_id
  from public.payment_intents
  where tenant_id = p_tenant_id
    and order_id = p_order_id
    and status in ('pending','processing')
  limit 1;

  if v_id is null then
    insert into public.payment_intents (id, tenant_id, order_id, provider, status, created_at)
    values (gen_random_uuid(), p_tenant_id, p_order_id, coalesce(p_provider,'stripe'), 'pending', now())
    returning id into v_id;
  end if;

  return v_id;
end;
$$;


ALTER FUNCTION app.ensure_payment_intent(p_tenant_id uuid, p_order_id uuid, p_provider text) OWNER TO postgres;

--
-- TOC entry 636 (class 1255 OID 16455)
-- Name: handle_payment_refund(); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.handle_payment_refund() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
DECLARE
  v_amount numeric;
BEGIN
  v_amount := COALESCE(NULLIF(NEW.payload->>'amount','')::numeric, 0);

  INSERT INTO public.payment_refunds (
    id, payment_id, amount, refund_reason, status, processed_at, tenant_id, created_at, updated_at
  )
  SELECT
    gen_random_uuid(),
    p.id,
    v_amount,
    COALESCE(NEW.payload->>'reason','manual'),
    'completed',
    now(),
    NEW.tenant_id,
    now(), now()
  FROM public.payments p
  WHERE p.order_id = (
    SELECT order_id FROM public.payment_intents WHERE id = NEW.payment_intent_id
  )
  LIMIT 1;

  RETURN NEW;
END;
$$;


ALTER FUNCTION app.handle_payment_refund() OWNER TO postgres;

--
-- TOC entry 483 (class 1255 OID 16456)
-- Name: handle_payment_success(); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.handle_payment_success() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
DECLARE
  v_order_id uuid;
  v_amount   numeric;
BEGIN
  -- Intent → order
  SELECT order_id INTO v_order_id
  FROM public.payment_intents
  WHERE id = NEW.payment_intent_id;

  -- Safe cast: if payload.amount is missing/blank, become 0
  v_amount := COALESCE(NULLIF(NEW.payload->>'amount','')::numeric, 0);

  INSERT INTO public.payments (
    id, tenant_id, order_id, amount, payment_method, status, processed_at, created_at
  )
  VALUES (
    gen_random_uuid(),
    NEW.tenant_id,
    v_order_id,
    v_amount,
    NEW.provider,
    'completed',
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;


ALTER FUNCTION app.handle_payment_success() OWNER TO postgres;

--
-- TOC entry 729 (class 1255 OID 16457)
-- Name: kds_counts(uuid); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.kds_counts(p_tenant_id uuid) RETURNS TABLE(queued integer, preparing integer, ready integer)
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
  with s as (
    select v.status
    from public.v_orders_latest_status v
    where v.tenant_id = p_tenant_id
  )
  select
    count(*) filter (where app.kds_lane(status) = 'queued')    as queued,
    count(*) filter (where app.kds_lane(status) = 'preparing') as preparing,
    count(*) filter (where app.kds_lane(status) = 'ready')     as ready
  from s;
$$;


ALTER FUNCTION app.kds_counts(p_tenant_id uuid) OWNER TO postgres;

--
-- TOC entry 500 (class 1255 OID 16458)
-- Name: kds_lane(text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.kds_lane(status text) RETURNS text
    LANGUAGE sql IMMUTABLE
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
  select case
    when status in ('new') then 'queued'
    when status in ('preparing') then 'preparing'
    when status in ('ready') then 'ready'
    else 'other'
  end;
$$;


ALTER FUNCTION app.kds_lane(status text) OWNER TO postgres;

--
-- TOC entry 577 (class 1255 OID 16459)
-- Name: kds_lane_counts(uuid); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.kds_lane_counts(p_tenant_id uuid) RETURNS TABLE(lane text, cnt integer)
    LANGUAGE sql STABLE
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
  SELECT lane,
         COUNT(*)::int AS cnt
  FROM public.v_orders_latest_status v
  WHERE v.tenant_id = p_tenant_id
    AND v.lane IN ('queued','preparing','ready')
  GROUP BY lane
$$;


ALTER FUNCTION app.kds_lane_counts(p_tenant_id uuid) OWNER TO postgres;

--
-- TOC entry 693 (class 1255 OID 16460)
-- Name: kpi_summary(uuid, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.kpi_summary(p_tenant_id uuid, p_window text DEFAULT '7d'::text) RETURNS TABLE(orders_count integer, revenue_total numeric, dine_in_count integer, takeaway_count integer)
    LANGUAGE plpgsql STABLE
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
declare
  tz       text := 'Australia/Brisbane';
  start_ts timestamptz;
  end_ts   timestamptz := now();
begin
  -- resolve date window
  case upper(p_window)
    when '7D'  then start_ts := (now() at time zone tz)::timestamptz - interval '7 days';
    when '30D' then start_ts := (now() at time zone tz)::timestamptz - interval '30 days';
    when '1M'  then start_ts := date_trunc('month', now() at time zone tz);
    when '3M'  then start_ts := (now() at time zone tz)::timestamptz - interval '3 months';
    when '12M' then start_ts := (now() at time zone tz)::timestamptz - interval '12 months';
    when 'MTD' then start_ts := date_trunc('month',  now() at time zone tz);
    when 'QTD' then start_ts := date_trunc('quarter',now() at time zone tz);
    when 'YTD' then start_ts := date_trunc('year',   now() at time zone tz);
    else
      if lower(p_window) = '7d' then start_ts := (now() at time zone tz)::timestamptz - interval '7 days';
      elsif lower(p_window) = '30d' then start_ts := (now() at time zone tz)::timestamptz - interval '30 days';
      else
        raise exception 'Invalid window: %', p_window;
      end if;
  end case;

  return query
  with base_orders as (
    select o.id, o.order_type
    from orders o
    where o.tenant_id = p_tenant_id
      and o.created_at >= start_ts
      and o.created_at <= end_ts
  ),
  money as (
    select
      case
        when p.status = 'completed' then coalesce(p.amount,0)
        when p.status = 'refunded'  then -abs(coalesce(p.amount,0))
        else 0
      end as delta
    from payments p
    where p.tenant_id = p_tenant_id
      and p.created_at >= start_ts
      and p.created_at <= end_ts
  )
  select
    (select count(*)::int from base_orders)                                         as orders_count,
    (select coalesce(sum(delta),0)::numeric from money)                             as revenue_total,
    (select count(*)::int from base_orders where order_type = 'dine_in')            as dine_in_count,
    (select count(*)::int from base_orders where order_type = 'takeaway')           as takeaway_count;
end;
$$;


ALTER FUNCTION app.kpi_summary(p_tenant_id uuid, p_window text) OWNER TO postgres;

--
-- TOC entry 682 (class 1255 OID 16461)
-- Name: mark_order_paid(uuid, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.mark_order_paid(p_order_id uuid, p_note text DEFAULT NULL::text) RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$ SELECT app.push_order_status(p_order_id, 'paid', p_note); $$;


ALTER FUNCTION app.mark_order_paid(p_order_id uuid, p_note text) OWNER TO postgres;

--
-- TOC entry 686 (class 1255 OID 16462)
-- Name: mark_order_preparing(uuid, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.mark_order_preparing(p_order_id uuid, p_note text DEFAULT NULL::text) RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$ SELECT app.push_order_status(p_order_id, 'preparing', p_note); $$;


ALTER FUNCTION app.mark_order_preparing(p_order_id uuid, p_note text) OWNER TO postgres;

--
-- TOC entry 555 (class 1255 OID 16463)
-- Name: mark_order_ready(uuid, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.mark_order_ready(p_order_id uuid, p_note text DEFAULT NULL::text) RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$ SELECT app.push_order_status(p_order_id, 'ready', p_note); $$;


ALTER FUNCTION app.mark_order_ready(p_order_id uuid, p_note text) OWNER TO postgres;

--
-- TOC entry 680 (class 1255 OID 16464)
-- Name: mark_order_served(uuid, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.mark_order_served(p_order_id uuid, p_note text DEFAULT NULL::text) RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$ SELECT app.push_order_status(p_order_id, 'served', p_note); $$;


ALTER FUNCTION app.mark_order_served(p_order_id uuid, p_note text) OWNER TO postgres;

--
-- TOC entry 558 (class 1255 OID 16465)
-- Name: mark_payment_intent_status(uuid, text, jsonb); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.mark_payment_intent_status(p_intent_id uuid, p_status text, p_event jsonb DEFAULT '{}'::jsonb) RETURNS void
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
DECLARE
  _tenant   uuid;
  _provider text;
BEGIN
  SELECT tenant_id, provider
    INTO _tenant, _provider
  FROM public.payment_intents
  WHERE id = p_intent_id;

  IF _tenant IS NULL THEN
    RAISE EXCEPTION 'payment_intent % not found', p_intent_id USING ERRCODE='P0002';
  END IF;

  INSERT INTO public.payment_events (
    provider, event_type, payload, payment_intent_id, tenant_id, received_at, created_at
  )
  VALUES (
    _provider,
    CASE
      WHEN p_status = 'processing' THEN 'payment_processing'
      WHEN p_status = 'succeeded'  THEN 'payment_succeeded'
      WHEN p_status = 'failed'     THEN 'payment_failed'
      WHEN p_status = 'canceled'   THEN 'payment_canceled'
      ELSE 'payment_status_changed'
    END,
    COALESCE(p_event, '{}'::jsonb),
    p_intent_id,
    _tenant,
    now(),
    now()
  );

  UPDATE public.payment_intents
  SET status = p_status,
      updated_at = now()
  WHERE id = p_intent_id
    AND p_status IN (
      'requires_payment_method','requires_action','requires_confirmation',
      'processing','succeeded','failed','canceled'
    );
END;
$$;


ALTER FUNCTION app.mark_payment_intent_status(p_intent_id uuid, p_status text, p_event jsonb) OWNER TO postgres;

--
-- TOC entry 517 (class 1255 OID 16466)
-- Name: on_order_paid_upsert_daily(); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.on_order_paid_upsert_daily() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'app'
    AS $$
DECLARE
  _tenant_id   uuid;
  _day         date;
  _order_type  text;
  _revenue     numeric;
BEGIN
  -- Fire only on paid transition
  IF (NEW.to_status IS DISTINCT FROM 'paid') THEN
    RETURN NEW;
  END IF;

  -- Resolve tenant, day, order_type, and revenue from orders
  SELECT
    o.tenant_id,
    (COALESCE(NEW.changed_at, now()))::date AS day,
    o.order_type,
    COALESCE(o.total_amount, (o.total_cents::numeric / 100.0), 0) AS revenue
  INTO
    _tenant_id, _day, _order_type, _revenue
  FROM public.orders o
  WHERE o.id = NEW.order_id;

  IF _tenant_id IS NULL THEN
    RETURN NEW; -- no-op if order missing
  END IF;

  -- Upsert the daily rollup
  INSERT INTO public.analytics_daily (
    tenant_id, day, orders_count, revenue_total, dine_in_count, takeaway_count, updated_at
  )
  VALUES (
    _tenant_id,
    _day,
    1,
    COALESCE(_revenue, 0),
    CASE WHEN _order_type = 'dine_in'  THEN 1 ELSE 0 END,
    CASE WHEN _order_type = 'takeaway' THEN 1 ELSE 0 END,
    now()
  )
  ON CONFLICT (tenant_id, day) DO UPDATE
  SET orders_count   = public.analytics_daily.orders_count + 1,
      revenue_total  = public.analytics_daily.revenue_total + COALESCE(EXCLUDED.revenue_total,0),
      dine_in_count  = public.analytics_daily.dine_in_count +
                        CASE WHEN _order_type = 'dine_in'  THEN 1 ELSE 0 END,
      takeaway_count = public.analytics_daily.takeaway_count +
                        CASE WHEN _order_type = 'takeaway' THEN 1 ELSE 0 END,
      updated_at     = now();

  RETURN NEW;
END;
$$;


ALTER FUNCTION app.on_order_paid_upsert_daily() OWNER TO postgres;

--
-- TOC entry 551 (class 1255 OID 16467)
-- Name: on_payment_intent_succeeded_mark_order_paid(); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.on_payment_intent_succeeded_mark_order_paid() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
BEGIN
  -- only act when status actually becomes 'succeeded' and we have an order
  IF NEW.status = 'succeeded' AND NEW.order_id IS NOT NULL THEN
    -- avoid duplicates: check if this order already has a 'paid' event
    IF NOT EXISTS (
      SELECT 1
      FROM public.order_status_events ose
      WHERE ose.order_id = NEW.order_id
        AND ose.to_status = 'paid'
    ) THEN
      INSERT INTO public.order_status_events (
        id,
        order_id,
        previous_status,
        new_status,
        changed_by,
        changed_at,
        updated_at,
        from_status,
        to_status,
        source,
        notes,
        created_by_user_id,
        tenant_id,
        created_at,
        changed_by_staff_id,
        changed_by_user,
        reason,
        meta
      )
      VALUES (
        gen_random_uuid(),
        NEW.order_id,
        NULL,
        'paid',                 -- legacy non-null column
        NULL,                   -- changed_by (user) unknown here
        now(),
        now(),
        NULL,                   -- from_status (optional)
        'paid',                 -- to_status (used by KDS views)
        'system',               -- system-generated
        'Payment intent succeeded',
        NULL,
        NEW.tenant_id,          -- rely on PI’s tenant_id
        now(),
        NULL,
        NULL,
        'Auto-marked paid from payment intent success',
        '{}'::jsonb
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION app.on_payment_intent_succeeded_mark_order_paid() OWNER TO postgres;

--
-- TOC entry 678 (class 1255 OID 16468)
-- Name: on_payment_succeeded(); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.on_payment_succeeded() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
begin
  if NEW.status = 'succeeded' then
    -- Mark order paid (safe even if already paid)
    if NEW.order_id is not null then
      update public.orders
      set status = 'paid',
          updated_at = now()
      where id = NEW.order_id;

      -- Insert audit row WITHOUT from_status / to_status (to satisfy check constraint)
      insert into public.order_status_events
        (order_id,
         previous_status, new_status,
         created_at, changed_at, updated_at,
         meta)
      values
        (NEW.order_id,
         'pending', 'paid',
         now(), now(), now(),
         '{}'::jsonb);
    end if;
  end if;

  return NEW;
end;
$$;


ALTER FUNCTION app.on_payment_succeeded() OWNER TO postgres;

--
-- TOC entry 684 (class 1255 OID 16469)
-- Name: order_fulfillment_timeline(uuid, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.order_fulfillment_timeline(p_tenant_id uuid, p_window text DEFAULT '7 days'::text) RETURNS TABLE(from_status text, to_status text, avg_seconds numeric, transitions bigint)
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
DECLARE
  start_ts timestamptz := now() - (p_window::interval);
  end_ts   timestamptz := now();
BEGIN
  RETURN QUERY
  WITH events AS (
    SELECT
      ose.order_id,
      ose.from_status AS from_st,
      ose.to_status   AS to_st,
      ose.changed_at
    FROM public.order_status_events ose
    WHERE ose.tenant_id = p_tenant_id
      AND ose.changed_at BETWEEN start_ts AND end_ts
      AND ose.from_status IS NOT NULL
      AND ose.to_status   IS NOT NULL
  ),
  next_event AS (
    -- For each (order_id, from_st -> to_st) find the next event that starts at that to_st
    SELECT
      e1.order_id,
      e1.from_st,
      e1.to_st,
      MIN(e2.changed_at) AS next_changed_at
    FROM events e1
    JOIN events e2
      ON e2.order_id = e1.order_id
     AND e2.changed_at > e1.changed_at
     AND e2.from_st = e1.to_st
    GROUP BY e1.order_id, e1.from_st, e1.to_st
  )
  SELECT
    ne.from_st AS from_status,
    ne.to_st   AS to_status,
    ROUND(AVG(EXTRACT(EPOCH FROM (ne.next_changed_at - e.changed_at)))::numeric, 2) AS avg_seconds,
    COUNT(*)::bigint AS transitions
  FROM events e
  JOIN next_event ne
    ON ne.order_id = e.order_id
   AND ne.from_st  = e.from_st
   AND ne.to_st    = e.to_st
  GROUP BY ne.from_st, ne.to_st
  ORDER BY ne.from_st, ne.to_st;
END;
$$;


ALTER FUNCTION app.order_fulfillment_timeline(p_tenant_id uuid, p_window text) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 411 (class 1259 OID 33826)
-- Name: order_status_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_status_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    previous_status text,
    new_status text NOT NULL,
    changed_by uuid,
    changed_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    from_status text,
    to_status text,
    source text,
    notes text,
    created_by_user_id uuid,
    tenant_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    changed_by_staff_id uuid,
    changed_by_user uuid,
    reason text,
    meta jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT order_status_events_from_chk CHECK (((from_status IS NULL) OR (from_status = ANY (ARRAY['new'::text, 'preparing'::text, 'ready'::text, 'served'::text, 'paid'::text, 'cancelled'::text, 'refunded'::text])))),
    CONSTRAINT order_status_events_to_chk CHECK ((to_status = ANY (ARRAY['new'::text, 'preparing'::text, 'ready'::text, 'served'::text, 'paid'::text, 'cancelled'::text, 'refunded'::text])))
);

ALTER TABLE ONLY public.order_status_events REPLICA IDENTITY FULL;


ALTER TABLE public.order_status_events OWNER TO postgres;

--
-- TOC entry 639 (class 1255 OID 16477)
-- Name: order_set_status(uuid, text, text, jsonb); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.order_set_status(p_order_id uuid, p_to_status text, p_reason text DEFAULT NULL::text, p_meta jsonb DEFAULT '{}'::jsonb) RETURNS public.order_status_events
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'app'
    AS $$
DECLARE
  _tenant_id   uuid;
  _prev_status text;
  _uid         uuid := NULL;
  _allowed     text[] := ARRAY[
    'pending','confirmed','preparing','ready','served','cancelled','paid','processing','placed'
  ];
  _row         public.order_status_events;
BEGIN
  -- 1) Validate status
  IF p_to_status IS NULL OR NOT (p_to_status = ANY(_allowed)) THEN
    RAISE EXCEPTION 'Invalid to_status: %, must be one of %', p_to_status, _allowed;
  END IF;

  -- 2) Order & tenant
  SELECT o.tenant_id
    INTO _tenant_id
  FROM public.orders o
  WHERE o.id = p_order_id;

  IF _tenant_id IS NULL THEN
    RAISE EXCEPTION 'Order % not found', p_order_id;
  END IF;

  -- 3) Latest previous status (based on your v_orders_latest_status)
  SELECT v.latest_status
    INTO _prev_status
  FROM public.v_orders_latest_status v
  WHERE v.order_id = p_order_id
  LIMIT 1;

  -- 4) Who is acting? (best-effort)
  BEGIN
    SELECT auth.uid() INTO _uid;
  EXCEPTION WHEN OTHERS THEN
    _uid := NULL;
  END;

  -- 5) Insert event (⚠ both columns set: new_status & to_status)
  INSERT INTO public.order_status_events (
    id,
    order_id,
    previous_status,
    new_status,
    changed_by,
    changed_at,
    updated_at,
    from_status,
    to_status,
    source,
    notes,
    created_by_user_id,
    tenant_id,
    created_at,
    changed_by_staff_id,
    changed_by_user,
    reason,
    meta
  )
  VALUES (
    gen_random_uuid(),
    p_order_id,
    _prev_status,              -- previous_status (nullable)
    p_to_status,               -- legacy NOT NULL column
    _uid,                      -- user (nullable)
    now(),
    now(),
    _prev_status,              -- from_status (nullable)
    p_to_status,               -- to_status (drives KDS lanes)
    'system',
    NULL,
    _uid,
    _tenant_id,
    now(),
    NULL,
    _uid,
    COALESCE(p_reason, format('Transition to %s', p_to_status)),
    COALESCE(p_meta, '{}'::jsonb)
  )
  RETURNING * INTO _row;

  RETURN _row;
END;
$$;


ALTER FUNCTION app.order_set_status(p_order_id uuid, p_to_status text, p_reason text, p_meta jsonb) OWNER TO postgres;

--
-- TOC entry 594 (class 1255 OID 16478)
-- Name: payment_conversion_funnel(uuid, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.payment_conversion_funnel(p_tenant_id uuid, p_window text DEFAULT '7 days'::text) RETURNS TABLE(stage text, stage_order integer, intents bigint, amount_total numeric)
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
DECLARE
  start_ts timestamptz := now() - (p_window::interval);
  end_ts   timestamptz := now();
BEGIN
  RETURN QUERY
  WITH base AS (
    SELECT pi.status, pi.amount
    FROM public.payment_intents pi
    WHERE pi.tenant_id = p_tenant_id
      AND pi.created_at BETWEEN start_ts AND end_ts
  ),
  mapped AS (
    SELECT
      CASE
        WHEN status = 'requires_payment_method' THEN 'created'
        WHEN status = 'requires_action'         THEN 'requires_action'
        WHEN status = 'requires_confirmation'   THEN 'confirmed'
        WHEN status = 'processing'              THEN 'processing'
        WHEN status = 'succeeded'               THEN 'succeeded'
        WHEN status = 'failed'                  THEN 'failed'
        WHEN status = 'canceled'                THEN 'canceled'
        ELSE 'other'
      END AS m_stage,
      amount AS m_amount
    FROM base
  ),
  agg AS (
    SELECT
      m_stage,
      COUNT(*)::bigint               AS intents,
      COALESCE(SUM(m_amount), 0)::numeric AS amount_total
    FROM mapped
    GROUP BY m_stage
  )
  SELECT
    a.m_stage AS stage,
    CASE a.m_stage
      WHEN 'created'          THEN 1
      WHEN 'requires_action'  THEN 2
      WHEN 'confirmed'        THEN 3
      WHEN 'processing'       THEN 4
      WHEN 'succeeded'        THEN 5
      WHEN 'failed'           THEN 6
      WHEN 'canceled'         THEN 7
      ELSE 99
    END AS stage_order,
    a.intents,
    a.amount_total
  FROM agg a
  ORDER BY stage_order;
END;
$$;


ALTER FUNCTION app.payment_conversion_funnel(p_tenant_id uuid, p_window text) OWNER TO postgres;

--
-- TOC entry 545 (class 1255 OID 16479)
-- Name: peak_hours_by_dow(uuid, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.peak_hours_by_dow(p_tenant_id uuid, p_window text DEFAULT '30d'::text) RETURNS TABLE(day_of_week smallint, orders_count bigint, revenue numeric)
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
DECLARE
  start_ts timestamptz;
  end_ts   timestamptz := now();
BEGIN
  -- Resolve the time window
  CASE lower(coalesce(p_window,'30d'))
    WHEN '7d'  THEN start_ts := now() - interval '7 days';
    WHEN '30d' THEN start_ts := now() - interval '30 days';
    WHEN '90d' THEN start_ts := now() - interval '90 days';
    WHEN 'mtd' THEN start_ts := date_trunc('month', now());
    WHEN 'qtd' THEN start_ts := date_trunc('quarter', now());
    WHEN 'ytd' THEN start_ts := date_trunc('year', now());
    WHEN 'all' THEN start_ts := '-infinity'::timestamptz;
    ELSE           start_ts := now() - interval '30 days';
  END CASE;

  RETURN QUERY
  WITH base_orders AS (
    SELECT o.created_at
    FROM public.orders o
    WHERE o.tenant_id = p_tenant_id
      AND o.created_at >= start_ts
      AND o.created_at <= end_ts
  ),
  orders_by_dow AS (
    SELECT EXTRACT(ISODOW FROM created_at)::smallint AS dow, COUNT(*)::bigint AS cnt
    FROM base_orders
    GROUP BY 1
  ),
  money AS (
    -- Positive for completed, negative for refunded; ignore others
    SELECT
      EXTRACT(ISODOW FROM p.created_at)::smallint AS dow,
      SUM(
        CASE
          WHEN p.status = 'completed' THEN COALESCE(p.amount,0)
          WHEN p.status = 'refunded'  THEN -ABS(COALESCE(p.amount,0))
          ELSE 0
        END
      )::numeric AS rev
    FROM public.payments p
    WHERE p.tenant_id = p_tenant_id
      AND p.created_at >= start_ts
      AND p.created_at <= end_ts
    GROUP BY 1
  )
  SELECT
    d::smallint                                   AS day_of_week,   -- 1..7
    COALESCE(o.cnt, 0)::bigint                    AS orders_count,
    COALESCE(m.rev, 0)::numeric                   AS revenue
  FROM generate_series(1,7) AS d
  LEFT JOIN orders_by_dow o ON o.dow = d
  LEFT JOIN money          m ON m.dow = d
  ORDER BY 1;
END $$;


ALTER FUNCTION app.peak_hours_by_dow(p_tenant_id uuid, p_window text) OWNER TO postgres;

--
-- TOC entry 520 (class 1255 OID 16480)
-- Name: peak_hours_by_hour(uuid, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.peak_hours_by_hour(p_tenant_id uuid, p_window text DEFAULT '30d'::text) RETURNS TABLE(hour_of_day smallint, orders_count bigint, revenue numeric)
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
DECLARE
  start_ts timestamptz;
  end_ts   timestamptz := now();
BEGIN
  -- Resolve window bounds
  CASE lower(coalesce(p_window,'30d'))
    WHEN '7d'  THEN start_ts := now() - interval '7 days';
    WHEN '30d' THEN start_ts := now() - interval '30 days';
    WHEN '90d' THEN start_ts := now() - interval '90 days';
    WHEN 'mtd' THEN start_ts := date_trunc('month', now());
    WHEN 'qtd' THEN start_ts := date_trunc('quarter', now());
    WHEN 'ytd' THEN start_ts := date_trunc('year', now());
    WHEN 'all' THEN start_ts := '-infinity'::timestamptz;
    ELSE           start_ts := now() - interval '30 days';
  END CASE;

  RETURN QUERY
  WITH base_orders AS (
    SELECT o.created_at
    FROM public.orders o
    WHERE o.tenant_id = p_tenant_id
      AND o.created_at >= start_ts
      AND o.created_at <= end_ts
  ),
  orders_by_hour AS (
    SELECT EXTRACT(HOUR FROM created_at)::smallint AS hr, COUNT(*)::bigint AS cnt
    FROM base_orders
    GROUP BY 1
  ),
  money AS (
    -- Positive for completed, negative for refunded; ignore others
    SELECT
      EXTRACT(HOUR FROM p.created_at)::smallint AS hr,
      SUM(
        CASE
          WHEN p.status = 'completed' THEN COALESCE(p.amount,0)
          WHEN p.status = 'refunded'  THEN -ABS(COALESCE(p.amount,0))
          ELSE 0
        END
      )::numeric AS rev
    FROM public.payments p
    WHERE p.tenant_id = p_tenant_id
      AND p.created_at >= start_ts
      AND p.created_at <= end_ts
    GROUP BY 1
  )
  SELECT
    h::smallint                                     AS hour_of_day,
    COALESCE(o.cnt, 0)::bigint                      AS orders_count,
    COALESCE(m.rev, 0)::numeric                     AS revenue
  FROM generate_series(0,23) AS h
  LEFT JOIN orders_by_hour o ON o.hr = h
  LEFT JOIN money          m ON m.hr = h
  ORDER BY 1;
END $$;


ALTER FUNCTION app.peak_hours_by_hour(p_tenant_id uuid, p_window text) OWNER TO postgres;

--
-- TOC entry 472 (class 1255 OID 16481)
-- Name: peak_hours_heatmap(uuid, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.peak_hours_heatmap(p_tenant_id uuid, p_window text DEFAULT '7d'::text) RETURNS TABLE(weekday integer, hour24 integer, orders_count bigint, revenue_total numeric)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE
  start_ts timestamptz;
  end_ts   timestamptz := now();
  win text := lower(coalesce(p_window,'7d'));
BEGIN
  -- map window → start timestamp (no casts in text)
  IF     win = '7d'  THEN start_ts := now() - interval '7 days';
  ELSIF  win = '30d' THEN start_ts := now() - interval '30 days';
  ELSIF  win = '90d' THEN start_ts := now() - interval '90 days';
  ELSIF  win = 'mtd' THEN start_ts := date_trunc('month',   now());
  ELSIF  win = 'qtd' THEN start_ts := date_trunc('quarter', now());
  ELSIF  win = 'ytd' THEN start_ts := date_trunc('year',    now());
  ELSE                   start_ts := now() - interval '7 days';
  END IF;

  RETURN QUERY
  WITH o AS (
    SELECT
      EXTRACT(dow  FROM o.created_at)::int AS o_dow,
      EXTRACT(hour FROM o.created_at)::int AS o_hour
    FROM public.orders o
    WHERE o.tenant_id = p_tenant_id
      AND o.created_at BETWEEN start_ts AND end_ts
  ),
  p AS (
    SELECT
      EXTRACT(dow  FROM p.created_at)::int AS p_dow,
      EXTRACT(hour FROM p.created_at)::int AS p_hour,
      CASE
        WHEN p.status = 'completed' THEN COALESCE(p.amount,0)
        WHEN p.status = 'refunded'  THEN -ABS(COALESCE(p.amount,0))
        ELSE 0
      END AS delta
    FROM public.payments p
    WHERE p.tenant_id = p_tenant_id
      AND p.created_at BETWEEN start_ts AND end_ts
  ),
  oo AS (
    SELECT o_dow, o_hour, COUNT(*) AS cnt
    FROM o
    GROUP BY 1,2
  ),
  pp AS (
    SELECT p_dow, p_hour, SUM(delta)::numeric AS rev
    FROM p
    GROUP BY 1,2
  )
  SELECT
    COALESCE(oo.o_dow,  pp.p_dow)   AS weekday,
    COALESCE(oo.o_hour, pp.p_hour)  AS hour24,
    COALESCE(oo.cnt, 0)::bigint     AS orders_count,
    COALESCE(pp.rev, 0)::numeric    AS revenue_total
  FROM oo
  FULL OUTER JOIN pp
    ON oo.o_dow  = pp.p_dow
   AND oo.o_hour = pp.p_hour
  ORDER BY 1,2;
END;
$$;


ALTER FUNCTION app.peak_hours_heatmap(p_tenant_id uuid, p_window text) OWNER TO postgres;

--
-- TOC entry 611 (class 1255 OID 16482)
-- Name: push_order_status(uuid, text, text, uuid); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.push_order_status(p_order_id uuid, p_status text, p_note text DEFAULT NULL::text, p_by_user uuid DEFAULT NULL::uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
DECLARE
  v_tenant_id uuid;
  v_user_id   uuid;
BEGIN
  -- Fetch the order's tenant
  SELECT o.tenant_id INTO v_tenant_id
  FROM public.orders o
  WHERE o.id = p_order_id
  LIMIT 1;

  IF v_tenant_id IS NULL THEN
    RETURN FALSE; -- no such order
  END IF;

  -- Resolve user id (prefer explicit, else auth.uid(), else NULL)
  v_user_id := COALESCE(p_by_user, NULLIF(auth.uid()::text,'' )::uuid);

  -- Write status event
  INSERT INTO public.order_status_events (tenant_id, order_id, status, note, created_by_user_id, created_at)
  VALUES (v_tenant_id, p_order_id, p_status, p_note, v_user_id, NOW());

  -- Update the order row
  UPDATE public.orders
  SET status = p_status,
      updated_at = NOW()
  WHERE id = p_order_id;

  RETURN TRUE;
END;
$$;


ALTER FUNCTION app.push_order_status(p_order_id uuid, p_status text, p_note text, p_by_user uuid) OWNER TO postgres;

--
-- TOC entry 540 (class 1255 OID 16483)
-- Name: revenue_by_method(uuid, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.revenue_by_method(p_tenant_id uuid, p_window text DEFAULT '30d'::text) RETURNS TABLE(method text, payments_count bigint, net_amount numeric)
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
DECLARE
  start_ts timestamptz;
  end_ts   timestamptz := now();
BEGIN
  -- resolve window
  CASE lower(coalesce(p_window,'30d'))
    WHEN '7d'  THEN start_ts := now() - interval '7 days';
    WHEN '30d' THEN start_ts := now() - interval '30 days';
    WHEN '90d' THEN start_ts := now() - interval '90 days';
    WHEN 'mtd' THEN start_ts := date_trunc('month', now());
    WHEN 'qtd' THEN start_ts := date_trunc('quarter', now());
    WHEN 'ytd' THEN start_ts := date_trunc('year', now());
    WHEN 'all' THEN start_ts := '-infinity'::timestamptz;
    ELSE           start_ts := now() - interval '30 days';
  END CASE;

  RETURN QUERY
  WITH money AS (
    SELECT
      p.payment_method AS method,
      CASE
        WHEN p.status = 'completed' THEN COALESCE(p.amount, 0)
        WHEN p.status = 'refunded'  THEN -ABS(COALESCE(p.amount, 0))
        ELSE 0
      END AS delta
    FROM public.payments p
    WHERE p.tenant_id = p_tenant_id
      AND p.created_at >= start_ts
      AND p.created_at <= end_ts
  )
  SELECT
    m.method,
    COUNT(*) FILTER (WHERE m.delta <> 0)::bigint AS payments_count,
    COALESCE(SUM(m.delta),0)::numeric            AS net_amount
  FROM money m
  GROUP BY m.method
  ORDER BY net_amount DESC NULLS LAST, method NULLS LAST;
END $$;


ALTER FUNCTION app.revenue_by_method(p_tenant_id uuid, p_window text) OWNER TO postgres;

--
-- TOC entry 513 (class 1255 OID 16484)
-- Name: revenue_series(uuid, text, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.revenue_series(p_tenant_id uuid, p_window text DEFAULT '7d'::text, p_granularity text DEFAULT 'day'::text) RETURNS TABLE(bucket_date date, total numeric)
    LANGUAGE plpgsql STABLE
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
declare
  tz            text := 'Australia/Brisbane';
  start_ts      timestamptz;
  end_ts        timestamptz := now();
  bucket_trunc  text;
begin
  -- validate granularity
  if p_granularity not in ('day','week','month') then
    raise exception 'Invalid granularity: %', p_granularity;
  end if;

  -- resolve window -> start_ts (in tenant/UI timezone)
  case upper(p_window)
    when '7D'  then start_ts := (now() at time zone tz)::timestamptz - interval '7 days';
    when '30D' then start_ts := (now() at time zone tz)::timestamptz - interval '30 days';
    when '1M'  then start_ts := date_trunc('month', now() at time zone tz);
    when '3M'  then start_ts := (now() at time zone tz)::timestamptz - interval '3 months';
    when '12M' then start_ts := (now() at time zone tz)::timestamptz - interval '12 months';
    when 'MTD' then start_ts := date_trunc('month', now() at time zone tz);
    when 'QTD' then start_ts := date_trunc('quarter', now() at time zone tz);
    when 'YTD' then start_ts := date_trunc('year', now() at time zone tz);
    else
      if lower(p_window) = '7d' then start_ts := (now() at time zone tz)::timestamptz - interval '7 days';
      elsif lower(p_window) = '30d' then start_ts := (now() at time zone tz)::timestamptz - interval '30 days';
      else
        raise exception 'Invalid window: %', p_window;
      end if;
  end case;

  -- pick date_trunc unit
  bucket_trunc := case p_granularity
                    when 'day'   then 'day'
                    when 'week'  then 'week'
                    when 'month' then 'month'
                  end;

  return query
  with buckets as (
    select generate_series(
             date_trunc(bucket_trunc, start_ts at time zone tz),
             date_trunc(bucket_trunc, end_ts   at time zone tz),
             case p_granularity when 'day' then interval '1 day'
                                when 'week' then interval '1 week'
                                when 'month' then interval '1 month' end
           )::date as bucket_date
  ),
  money as (
    select
      date_trunc(bucket_trunc, p.created_at at time zone tz)::date as bucket_date,
      case
        when p.status = 'completed' then coalesce(p.amount,0)
        when p.status = 'refunded'  then -abs(coalesce(p.amount,0))
        else 0
      end as delta
    from payments p
    where p.tenant_id = p_tenant_id
      and p.created_at >= start_ts
      and p.created_at <= end_ts
  )
  select b.bucket_date,
         coalesce(sum(m.delta),0)::numeric as total
  from buckets b
  left join money m on m.bucket_date = b.bucket_date
  group by 1
  order by 1;
end;
$$;


ALTER FUNCTION app.revenue_series(p_tenant_id uuid, p_window text, p_granularity text) OWNER TO postgres;

--
-- TOC entry 477 (class 1255 OID 16485)
-- Name: revenue_timeseries(uuid, text, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.revenue_timeseries(p_tenant_id uuid, p_window text, p_granularity text) RETURNS TABLE(bucket timestamp with time zone, revenue_total numeric, orders_count bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
BEGIN
  RETURN QUERY
  WITH binned AS (
    SELECT
      date_trunc(p_granularity, created_at) AS bucket,
      COALESCE(SUM(total_amount),0)::numeric AS revenue_total,
      COUNT(*)::bigint AS orders_count
    FROM public.orders
    WHERE tenant_id = p_tenant_id
      AND created_at >= (NOW() - (p_window || ' days')::interval)
    GROUP BY bucket
  )
  SELECT * FROM binned ORDER BY bucket;
END;
$$;


ALTER FUNCTION app.revenue_timeseries(p_tenant_id uuid, p_window text, p_granularity text) OWNER TO postgres;

--
-- TOC entry 661 (class 1255 OID 16486)
-- Name: set_default_payment_provider(uuid); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.set_default_payment_provider(p_provider_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_tenant_id uuid;
  v_allowed boolean;
BEGIN
  -- 1) Load provider and its tenant
  SELECT tenant_id INTO v_tenant_id
  FROM public.payment_providers
  WHERE id = p_provider_id;

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Provider % not found', p_provider_id USING ERRCODE = 'NO_DATA_FOUND';
  END IF;

  -- 2) Ensure caller is staff of that tenant
  SELECT EXISTS (
    SELECT 1 FROM public.staff s
    WHERE s.user_id = auth.uid() AND s.tenant_id = v_tenant_id
  ) INTO v_allowed;

  IF NOT v_allowed THEN
    RAISE EXCEPTION 'Not authorized to modify this tenant''s providers' USING ERRCODE = '42501';
  END IF;

  -- 3) Clear any current default for this tenant
  UPDATE public.payment_providers
     SET is_default = FALSE
   WHERE tenant_id = v_tenant_id
     AND is_default = TRUE;

  -- 4) Set the new default
  UPDATE public.payment_providers
     SET is_default = TRUE
   WHERE id = p_provider_id;
END;
$$;


ALTER FUNCTION app.set_default_payment_provider(p_provider_id uuid) OWNER TO postgres;

--
-- TOC entry 549 (class 1255 OID 16487)
-- Name: top_items(uuid, text, integer); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.top_items(p_tenant_id uuid, p_window text, p_limit integer DEFAULT 10) RETURNS TABLE(menu_item_id uuid, item_name text, qty_sold bigint)
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
declare
  start_ts timestamptz;
  end_ts   timestamptz := now();
begin
  -- resolve window
  case lower(coalesce(p_window,'7d'))
    when '7d'  then start_ts := now() - interval '7 days';
    when '30d' then start_ts := now() - interval '30 days';
    when '90d' then start_ts := now() - interval '90 days';
    when 'mtd' then start_ts := date_trunc('month', now());
    when 'qtd' then start_ts := date_trunc('quarter', now());
    when 'ytd' then start_ts := date_trunc('year', now());
    when 'all' then start_ts := '-infinity'::timestamptz;
    else          start_ts := now() - interval '7 days';
  end case;

  return query
  with o as (
    select id
    from public.orders
    where tenant_id = p_tenant_id
      and created_at >= start_ts
      and created_at <= end_ts
  )
  select
    oi.menu_item_id,
    coalesce(mi.name, '(unknown)') as item_name,
    sum(coalesce(oi.quantity,0))::bigint as qty_sold
  from public.order_items oi
  join o on o.id = oi.order_id
  left join public.menu_items mi on mi.id = oi.menu_item_id
  where oi.tenant_id = p_tenant_id
  group by oi.menu_item_id, mi.name
  order by qty_sold desc, item_name asc
  limit greatest(p_limit, 1);

end $$;


ALTER FUNCTION app.top_items(p_tenant_id uuid, p_window text, p_limit integer) OWNER TO postgres;

--
-- TOC entry 620 (class 1255 OID 16488)
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- TOC entry 5639 (class 0 OID 0)
-- Dependencies: 620
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- TOC entry 681 (class 1255 OID 16489)
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- TOC entry 498 (class 1255 OID 16490)
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- TOC entry 5642 (class 0 OID 0)
-- Dependencies: 498
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- TOC entry 467 (class 1255 OID 16491)
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- TOC entry 5644 (class 0 OID 0)
-- Dependencies: 467
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- TOC entry 598 (class 1255 OID 16522)
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- TOC entry 5676 (class 0 OID 0)
-- Dependencies: 598
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- TOC entry 583 (class 1255 OID 16523)
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- TOC entry 5678 (class 0 OID 0)
-- Dependencies: 583
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- TOC entry 608 (class 1255 OID 16524)
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- TOC entry 5680 (class 0 OID 0)
-- Dependencies: 608
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- TOC entry 526 (class 1255 OID 16550)
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- TOC entry 716 (class 1255 OID 16551)
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- TOC entry 480 (class 1255 OID 16563)
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- TOC entry 5720 (class 0 OID 0)
-- Dependencies: 480
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- TOC entry 667 (class 1255 OID 16586)
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- TOC entry 564 (class 1255 OID 16587)
-- Name: app_is_platform(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.app_is_platform() RETURNS boolean
    LANGUAGE sql STABLE
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$ SELECT current_setting('app.role', true) = 'platform' $$;


ALTER FUNCTION public.app_is_platform() OWNER TO postgres;

--
-- TOC entry 601 (class 1255 OID 16588)
-- Name: app_tenant_id(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.app_tenant_id() RETURNS text
    LANGUAGE sql STABLE
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$ SELECT current_setting('app.tenant_id', true) $$;


ALTER FUNCTION public.app_tenant_id() OWNER TO postgres;

--
-- TOC entry 622 (class 1255 OID 16589)
-- Name: calculate_order_total(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_order_total(order_uuid uuid) RETURNS numeric
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
DECLARE
  total DECIMAL(10,2);
BEGIN
  SELECT COALESCE(SUM(total_price), 0) INTO total
  FROM order_items
  WHERE order_id = order_uuid;
  
  RETURN total;
END;
$$;


ALTER FUNCTION public.calculate_order_total(order_uuid uuid) OWNER TO postgres;

--
-- TOC entry 521 (class 1255 OID 16590)
-- Name: can_user_see_menu_items(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.can_user_see_menu_items(uid uuid) RETURNS TABLE(tenant_code text, items integer)
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select t.code as tenant_code, count(*)::int as items
  from public.menu_items mi
  join public.tenants t on t.id = mi.tenant_id
  where exists (
    select 1
    from public.staff s
    where s.user_id = uid
      and s.tenant_id = mi.tenant_id
  )
  group by t.code
$$;


ALTER FUNCTION public.can_user_see_menu_items(uid uuid) OWNER TO postgres;

--
-- TOC entry 522 (class 1255 OID 16591)
-- Name: cart_items_increment(uuid, uuid, uuid, integer, numeric, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cart_items_increment(p_tenant_id uuid, p_cart_id uuid, p_menu_item_id uuid, p_qty integer, p_price numeric, p_name text) RETURNS void
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  insert into cart_items (tenant_id, cart_id, menu_item_id, qty, price, name)
  values (p_tenant_id, p_cart_id, p_menu_item_id, p_qty, p_price, p_name)
  on conflict (cart_id, menu_item_id)
  do update
    set qty   = cart_items.qty + excluded.qty,
        price = excluded.price,
        name  = excluded.name
  where cart_items.tenant_id = p_tenant_id;  -- defensive tenant guard
$$;


ALTER FUNCTION public.cart_items_increment(p_tenant_id uuid, p_cart_id uuid, p_menu_item_id uuid, p_qty integer, p_price numeric, p_name text) OWNER TO postgres;

--
-- TOC entry 552 (class 1255 OID 16592)
-- Name: cart_items_increment_batch(uuid, uuid, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cart_items_increment_batch(p_tenant_id uuid, p_cart_id uuid, p_lines jsonb) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_cart_id uuid;
begin
  -- 1) Lock/verify the cart belongs to tenant and is usable
  select id
    into v_cart_id
  from carts
  where id = p_cart_id
    and tenant_id = p_tenant_id
    and status in ('open','inactive')   -- allow revive from inactive
  for update;

  if not found then
    raise exception 'cart_not_found_or_not_open' using errcode = 'P0001';
  end if;

  -- 2) Upsert all lines from the JSON array in one statement
  --    - Insert if missing
  --    - If exists, qty = qty + incoming.qty
  --    - Also refresh price/name snapshot
  insert into cart_items (tenant_id, cart_id, menu_item_id, qty, price, name)
  select
    p_tenant_id,
    p_cart_id,
    (x.menu_item_id)::uuid,
    greatest(coalesce(x.qty, 0), 0)::integer,
    (x.price)::numeric,
    nullif(x.name, '')::text
  from jsonb_to_recordset(coalesce(p_lines, '[]'::jsonb))
       as x(menu_item_id text, qty int, price numeric, name text)
  where coalesce(x.qty, 0) > 0
  on conflict (cart_id, menu_item_id)
  do update set
    qty   = cart_items.qty + excluded.qty,
    price = excluded.price,
    name  = excluded.name
  where cart_items.tenant_id = p_tenant_id;  -- defensive tenant guard
end;
$$;


ALTER FUNCTION public.cart_items_increment_batch(p_tenant_id uuid, p_cart_id uuid, p_lines jsonb) OWNER TO postgres;

--
-- TOC entry 580 (class 1255 OID 16593)
-- Name: checkout_cart(uuid, uuid, uuid, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.checkout_cart(p_tenant_id uuid, p_user_id uuid, p_cart_id uuid, p_payment_intent_id text, p_notes text) RETURNS TABLE(order_id uuid, subtotal numeric, tax numeric, total numeric, currency text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_cart record;
  v_total numeric := 0;
  v_subtotal numeric := 0;
  v_tax numeric := 0;
  v_currency text := 'INR';
  v_rate numeric := 0;
  v_order_id uuid;
begin
  -- 1) Lock cart and verify ownership/state
  select id, tenant_id, user_id, status
  into v_cart
  from carts
  where id = p_cart_id
    and tenant_id = p_tenant_id
  for update;

  if v_cart.id is null then
    raise exception 'cart_not_found';
  end if;

  if v_cart.status not in ('open','inactive') then
    raise exception 'cart_not_open';
  end if;

  -- 2) Sum from cart_items snapshots (tenant scoped)
  select coalesce(sum((ci.qty::numeric) * (ci.price::numeric)), 0)
  into v_total
  from cart_items ci
  where ci.tenant_id = p_tenant_id
    and ci.cart_id = p_cart_id
    and coalesce(ci.qty,0) > 0;

  if v_total <= 0 then
    raise exception 'cart_empty';
  end if;

  -- 3) Read tenant currency and effective tax rate (fraction) from view
  select
    coalesce(v.currency, 'INR'),
    coalesce(v.effective_rate, 0)
  into v_currency, v_rate
  from v_tenant_tax_effective v
  where v.tenant_id = p_tenant_id;

  -- Normalize rate (view already returns fraction; still guard)
  if v_rate is null then v_rate := 0; end if;
  if v_rate > 1 then v_rate := v_rate / 100.0; end if;

  -- 4) Inclusive math: total is final (as entered)
  v_subtotal := round(v_total / (1 + v_rate), 2);
  v_tax      := round(v_total - v_subtotal, 2);

  -- 5) Insert order (status 'created'), snapshot currency
  insert into orders (tenant_id, user_id, status, subtotal, tax, total, currency, created_at)
  values (p_tenant_id, p_user_id, 'created', v_subtotal, v_tax, v_total, v_currency, now())
  returning id into v_order_id;

  -- 6) Copy items (snapshot qty/price/line total)
  insert into order_items (order_id, tenant_id, menu_item_id, name, qty, price, total)
  select v_order_id, ci.tenant_id, ci.menu_item_id, ci.name, ci.qty, ci.price, (ci.qty::numeric * ci.price::numeric)
  from cart_items ci
  where ci.tenant_id = p_tenant_id
    and ci.cart_id = p_cart_id
    and coalesce(ci.qty,0) > 0;

  -- 7) Mark cart completed
  update carts
  set status = 'completed', updated_at = now()
  where id = p_cart_id;

  -- 8) Link payment intent if provided
  if p_payment_intent_id is not null then
    update payment_intents
    set order_id = v_order_id, updated_at = now()
    where id = p_payment_intent_id;
  end if;

  -- 9) Return payload
  order_id := v_order_id;
  subtotal := v_subtotal;
  tax      := v_tax;
  total    := v_total;
  currency := v_currency;
  return next;
end;
$$;


ALTER FUNCTION public.checkout_cart(p_tenant_id uuid, p_user_id uuid, p_cart_id uuid, p_payment_intent_id text, p_notes text) OWNER TO postgres;

--
-- TOC entry 576 (class 1255 OID 101578)
-- Name: checkout_cart(uuid, uuid, uuid, uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.checkout_cart(p_tenant_id uuid, p_user_id uuid, p_cart_id uuid, p_payment_intent_id uuid, p_notes text DEFAULT NULL::text) RETURNS TABLE(order_id uuid)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_subtotal numeric(12,2);
  v_order_id uuid := gen_random_uuid();
begin
  -- Sum cart items for this tenant/cart
  select coalesce(sum((ci.price::numeric) * ci.qty), 0)
    into v_subtotal
  from public.cart_items ci
  where ci.cart_id = p_cart_id
    and ci.tenant_id = p_tenant_id;

  if v_subtotal is null or v_subtotal <= 0 then
    raise exception 'cart_empty';
  end if;

  -- Insert the order
  insert into public.orders(id, tenant_id, cart_id, total_amount, status, created_at, updated_at)
  values (v_order_id, p_tenant_id, p_cart_id, v_subtotal, 'paid', now(), now());

  -- Mark cart as checked out (optional but typical)
  update public.carts
     set status = 'checked_out', updated_at = now()
   where id = p_cart_id;

  -- Attach order to the payment intent for idempotency
  update public.payment_intents
     set order_id = v_order_id, updated_at = now()
   where id = p_payment_intent_id;

  return query select v_order_id;
end
$$;


ALTER FUNCTION public.checkout_cart(p_tenant_id uuid, p_user_id uuid, p_cart_id uuid, p_payment_intent_id uuid, p_notes text) OWNER TO postgres;

--
-- TOC entry 479 (class 1255 OID 16594)
-- Name: checkout_cart_v2(uuid, uuid, uuid, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.checkout_cart_v2(p_tenant_id uuid, p_user_id uuid, p_cart_id uuid, p_payment_intent_id text DEFAULT NULL::text, p_notes text DEFAULT NULL::text) RETURNS jsonb
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
DECLARE
  v_cart RECORD;
  v_currency text := 'INR';
  v_rate numeric := 0;
  v_total numeric := 0;
  v_subtotal numeric := 0;
  v_tax numeric := 0;
  v_order_id uuid := gen_random_uuid();
  v_order_number text := 'ORD-'||to_char(now(),'YYYYMMDD')||'-'||substr(v_order_id::text,1,8);
  v_session_id text := gen_random_uuid()::text;
  v_now timestamptz := now();
  v_mode text;
  v_status order_status;
BEGIN
  SELECT * INTO v_cart
  FROM carts
  WHERE id = p_cart_id AND tenant_id = p_tenant_id AND user_id = p_user_id AND status = 'open'
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'cart_not_found_or_not_open';
  END IF;

  SELECT COALESCE(SUM(qty * price), 0) INTO v_total
  FROM cart_items
  WHERE cart_id = p_cart_id AND tenant_id = p_tenant_id;

  IF v_total <= 0 THEN
    RAISE EXCEPTION 'cart_empty';
  END IF;

  SELECT COALESCE(effective_rate, 0), COALESCE(currency, 'INR')
  INTO v_rate, v_currency
  FROM v_tenant_tax_effective
  WHERE tenant_id = p_tenant_id
  LIMIT 1;

  v_subtotal := v_total / (1 + v_rate);
  v_tax := v_total - v_subtotal;

  SELECT mode INTO v_mode FROM carts WHERE id = p_cart_id;

  v_status := 'pending'::order_status; -- adjust if needed

  INSERT INTO orders (
    id, tenant_id, user_id,
    order_number, order_type, status,
    subtotal, tax_amount, discount_amount, tip_amount,
    total_amount, total, currency, mode,
    total_cents, session_id,
    created_at, updated_at
  ) VALUES (
    v_order_id, p_tenant_id, p_user_id,
    v_order_number, v_mode, v_status,
    v_subtotal, v_tax, 0, 0,
    v_total, v_total, v_currency, v_mode,
    ROUND(v_total * 100), v_session_id,
    v_now, v_now
  );

  INSERT INTO order_items (
    id, tenant_id, order_id, menu_item_id,
    quantity, unit_price, total_price,
    currency, created_at
  )
  SELECT
    gen_random_uuid(),
    p_tenant_id,
    v_order_id,
    ci.menu_item_id,
    ci.qty,
    ci.price,
    (ci.qty * ci.price),
    v_currency,
    v_now
  FROM cart_items ci
  WHERE ci.cart_id = p_cart_id AND ci.tenant_id = p_tenant_id;

  -- TEMP: do not change status to avoid carts_status_check
  UPDATE carts SET updated_at = v_now
  WHERE id = p_cart_id AND tenant_id = p_tenant_id;

  DELETE FROM cart_items WHERE cart_id = p_cart_id AND tenant_id = p_tenant_id;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'subtotal', v_subtotal,
    'tax_amount', v_tax,
    'total_amount', v_total,
    'currency', v_currency,
    'item_count', (SELECT COALESCE(SUM(quantity),0) FROM order_items WHERE order_id = v_order_id)
  );
END;
$$;


ALTER FUNCTION public.checkout_cart_v2(p_tenant_id uuid, p_user_id uuid, p_cart_id uuid, p_payment_intent_id text, p_notes text) OWNER TO postgres;

--
-- TOC entry 474 (class 1255 OID 16595)
-- Name: checkout_order(uuid, text, text, uuid, integer, text, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.checkout_order(p_tenant_id uuid, p_session_id text, p_mode text, p_table_id uuid, p_cart_version integer, p_idempotency_key text, p_total_cents integer) RETURNS TABLE(order_id uuid, duplicate boolean)
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
DECLARE
  v_existing uuid;
  v_cur_cart integer;
BEGIN
  -- idempotent replay
  SELECT id INTO v_existing
  FROM orders
  WHERE tenant_id = p_tenant_id
    AND idempotency_key = p_idempotency_key;

  IF v_existing IS NOT NULL THEN
    RETURN QUERY SELECT v_existing, TRUE;
    RETURN;
  END IF;

  -- table-specific checks
  IF p_mode = 'table' AND p_table_id IS NOT NULL THEN
    SELECT cart_version INTO v_cur_cart
    FROM table_sessions
    WHERE tenant_id = p_tenant_id
      AND table_id = p_table_id
      AND status = 'active';

    IF v_cur_cart IS NOT NULL AND p_cart_version <= v_cur_cart THEN
      RAISE EXCEPTION 'stale_cart';
    END IF;

    PERFORM 1
    FROM orders
    WHERE tenant_id = p_tenant_id
      AND table_id = p_table_id
      AND status IN ('pending','processing','confirmed','preparing','ready','placed')
    LIMIT 1;

    IF FOUND THEN
      RAISE EXCEPTION 'active_order_exists';
    END IF;
  END IF;

  INSERT INTO orders (
    id, tenant_id, table_id, status,
    session_id, mode, total_cents, idempotency_key
  )
  VALUES (
    gen_random_uuid(), p_tenant_id, p_table_id, 'placed',
    p_session_id, p_mode, p_total_cents, p_idempotency_key
  )
  RETURNING id INTO v_existing;

  IF p_mode = 'table' AND p_table_id IS NOT NULL THEN
    UPDATE table_sessions
    SET cart_version = COALESCE(cart_version, 0) + 1
    WHERE tenant_id = p_tenant_id
      AND table_id = p_table_id
      AND status = 'active';
  END IF;

  RETURN QUERY SELECT v_existing, FALSE;
END;
$$;


ALTER FUNCTION public.checkout_order(p_tenant_id uuid, p_session_id text, p_mode text, p_table_id uuid, p_cart_version integer, p_idempotency_key text, p_total_cents integer) OWNER TO postgres;

--
-- TOC entry 650 (class 1255 OID 16596)
-- Name: current_tenant_ids(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.current_tenant_ids() RETURNS SETOF uuid
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select tenant_id
  from public.staff
  where user_id = auth.uid()
$$;


ALTER FUNCTION public.current_tenant_ids() OWNER TO postgres;

--
-- TOC entry 626 (class 1255 OID 16597)
-- Name: current_tenant_ids(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.current_tenant_ids(uid uuid DEFAULT auth.uid()) RETURNS SETOF uuid
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select tenant_id
  from public.staff
  where user_id = uid
$$;


ALTER FUNCTION public.current_tenant_ids(uid uuid) OWNER TO postgres;

--
-- TOC entry 666 (class 1255 OID 105994)
-- Name: ensure_trial_subscription_for_current_tenant(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.ensure_trial_subscription_for_current_tenant(default_plan_code text DEFAULT 'basic'::text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_tenant uuid := request_tenant_id();
  v_plan_id uuid;
  v_has_active boolean;
begin
  if v_tenant is null then
    raise exception 'tenant_missing';
  end if;

  select exists (
    select 1 from public.tenant_subscriptions
    where tenant_id = v_tenant
      and status in ('trialing','active')
      and current_period_end > now()
  ) into v_has_active;

  if v_has_active then
    return;
  end if;

  select id into v_plan_id
  from public.billing_plans
  where code = default_plan_code and is_active = true
  limit 1;

  if v_plan_id is null then
    select id into v_plan_id
    from public.billing_plans
    where is_active = true
    order by price_monthly asc nulls first
    limit 1;
  end if;

  insert into public.tenant_subscriptions
    (tenant_id, plan_id, status, current_period_start, current_period_end)
  values
    (v_tenant, v_plan_id, 'trialing', now(), now() + interval '7 days');

  insert into public.subscription_events (tenant_id, event_type, details)
  values (v_tenant, 'trial_started', jsonb_build_object('plan_id', v_plan_id, 'days', 7));
end;
$$;


ALTER FUNCTION public.ensure_trial_subscription_for_current_tenant(default_plan_code text) OWNER TO postgres;

--
-- TOC entry 721 (class 1255 OID 107424)
-- Name: ensure_trial_subscription_for_tenant(uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.ensure_trial_subscription_for_tenant(p_tenant uuid, default_plan_code text DEFAULT 'basic'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_plan_id UUID;
  v_has_active BOOLEAN;
BEGIN
  IF p_tenant IS NULL THEN
    RAISE EXCEPTION 'tenant_missing';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.tenant_subscriptions
    WHERE tenant_id = p_tenant
      AND status IN ('trialing', 'active')
      AND current_period_end > NOW()
  ) INTO v_has_active;

  IF v_has_active THEN
    RETURN;
  END IF;

  SELECT id INTO v_plan_id
  FROM public.billing_plans
  WHERE code = default_plan_code AND is_active = true
  LIMIT 1;

  IF v_plan_id IS NULL THEN
    SELECT id INTO v_plan_id
    FROM public.billing_plans
    WHERE is_active = true
    ORDER BY price_monthly ASC NULLS FIRST
    LIMIT 1;
  END IF;

  INSERT INTO public.tenant_subscriptions (
    tenant_id, plan_id, status, current_period_start, current_period_end
  )
  VALUES (
    p_tenant, v_plan_id, 'trialing', NOW(), NOW() + INTERVAL '7 days'
  );

  INSERT INTO public.subscription_events (
    tenant_id, event_type, details
  )
  VALUES (
    p_tenant, 'trial_started', jsonb_build_object('plan_id', v_plan_id, 'days', 7)
  );
END;
$$;


ALTER FUNCTION public.ensure_trial_subscription_for_tenant(p_tenant uuid, default_plan_code text) OWNER TO postgres;

--
-- TOC entry 403 (class 1259 OID 27239)
-- Name: tables; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tables (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    code text NOT NULL,
    label text NOT NULL,
    seats integer DEFAULT 2 NOT NULL,
    status text DEFAULT 'available'::text NOT NULL,
    is_locked boolean DEFAULT false NOT NULL,
    is_occupied boolean DEFAULT false NOT NULL,
    computed_status text,
    zone uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    table_number text
);


ALTER TABLE public.tables OWNER TO postgres;

--
-- TOC entry 615 (class 1255 OID 16605)
-- Name: fn_search_available_tables(uuid, integer, timestamp with time zone, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_search_available_tables(p_tenant_id uuid, p_party_size integer, p_starts_at timestamp with time zone DEFAULT now(), p_ends_at timestamp with time zone DEFAULT (now() + '01:30:00'::interval)) RETURNS SETOF public.tables
    LANGUAGE sql STABLE
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
  SELECT t.*
  FROM public.tables t
  WHERE t.tenant_id = p_tenant_id
    AND t.seats >= p_party_size
    AND t.status IN ('available', 'cleaning')  -- cleaning = visible but blocked in UI if you want; or restrict to 'available' only
    AND NOT EXISTS (
      SELECT 1
      FROM public.reservations r
      WHERE r.tenant_id = p_tenant_id
        AND r.table_id = t.id
        AND tstzrange(r.starts_at, r.ends_at, '[)') &&
            tstzrange(p_starts_at, p_ends_at, '[)')
    );
$$;


ALTER FUNCTION public.fn_search_available_tables(p_tenant_id uuid, p_party_size integer, p_starts_at timestamp with time zone, p_ends_at timestamp with time zone) OWNER TO postgres;

--
-- TOC entry 562 (class 1255 OID 16606)
-- Name: generate_order_number(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_order_number(tenant_uuid uuid) RETURNS text
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
DECLARE
  order_count INTEGER;
  order_number TEXT;
BEGIN
  SELECT COUNT(*) + 1 INTO order_count
  FROM orders
  WHERE tenant_id = tenant_uuid
  AND DATE(created_at) = CURRENT_DATE;
  
  order_number := 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(order_count::TEXT, 4, '0');
  
  RETURN order_number;
END;
$$;


ALTER FUNCTION public.generate_order_number(tenant_uuid uuid) OWNER TO postgres;

--
-- TOC entry 468 (class 1255 OID 16607)
-- Name: is_valid_tax_components(jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.is_valid_tax_components(js jsonb) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
  select coalesce(
    (select bool_and(
       jsonb_typeof(elem->'name') = 'string'
       and (jsonb_typeof(elem->'rate') in ('number','string'))
    )
     from jsonb_array_elements(coalesce(js, '[]'::jsonb)) as elem),
    true
  );
$$;


ALTER FUNCTION public.is_valid_tax_components(js jsonb) OWNER TO postgres;

--
-- TOC entry 595 (class 1255 OID 16608)
-- Name: jwt_tenant_id(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.jwt_tenant_id() RETURNS text
    LANGUAGE sql STABLE
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb->>'tenant_id','')
$$;


ALTER FUNCTION public.jwt_tenant_id() OWNER TO postgres;

--
-- TOC entry 461 (class 1255 OID 16609)
-- Name: jwt_tenant_id_uuid(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.jwt_tenant_id_uuid() RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_tid_text text;
  v_tid uuid;
BEGIN
  -- 1) Try JWT claim
  v_tid_text := current_setting('request.jwt.claims.tenant_id', true);
  IF v_tid_text IS NOT NULL AND v_tid_text <> '' THEN
    BEGIN
      v_tid := v_tid_text::uuid;
      RETURN v_tid;
    EXCEPTION WHEN others THEN
      -- fallback if cast fails
    END;
  END IF;

  -- 2) Fallback to users table
  SELECT u.tenant_id INTO v_tid
  FROM public.users u
  WHERE u.id = auth.uid();

  RETURN v_tid;
END;
$$;


ALTER FUNCTION public.jwt_tenant_id_uuid() OWNER TO postgres;

--
-- TOC entry 648 (class 1255 OID 16610)
-- Name: kaf_apply_policies(text, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.kaf_apply_policies(tablename text, has_id boolean DEFAULT false) RETURNS void
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
DECLARE
  t regclass;
BEGIN
  t := to_regclass(tablename);
  IF t IS NULL THEN
    RAISE NOTICE 'Table % not found, skipping', tablename; RETURN;
  END IF;

  EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', t);

  -- Drop old policies if present
  PERFORM 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = split_part(tablename, '.', 2)
      AND policyname IN ('p_select','p_insert','p_update','p_delete');
  IF FOUND THEN
    EXECUTE format('DROP POLICY IF EXISTS p_select ON %s', t);
    EXECUTE format('DROP POLICY IF EXISTS p_insert ON %s', t);
    EXECUTE format('DROP POLICY IF EXISTS p_update ON %s', t);
    EXECUTE format('DROP POLICY IF EXISTS p_delete ON %s', t);
  END IF;

  IF has_id THEN
    EXECUTE format(
      'CREATE POLICY p_select ON %s FOR SELECT USING (app_is_platform() OR id::text = app_tenant_id())',
      t
    );
    EXECUTE format(
      'CREATE POLICY p_insert ON %s FOR INSERT WITH CHECK (app_is_platform())',
      t
    );
    EXECUTE format(
      'CREATE POLICY p_update ON %s FOR UPDATE USING (app_is_platform() OR id::text = app_tenant_id()) WITH CHECK (app_is_platform() OR id::text = app_tenant_id())',
      t
    );
    EXECUTE format(
      'CREATE POLICY p_delete ON %s FOR DELETE USING (app_is_platform())',
      t
    );
  ELSE
    EXECUTE format(
      'CREATE POLICY p_select ON %s FOR SELECT USING (app_is_platform() OR tenantId::text = app_tenant_id())',
      t
    );
    EXECUTE format(
      'CREATE POLICY p_insert ON %s FOR INSERT WITH CHECK (app_is_platform() OR tenantId::text = app_tenant_id())',
      t
    );
    EXECUTE format(
      'CREATE POLICY p_update ON %s FOR UPDATE USING (app_is_platform() OR tenantId::text = app_tenant_id()) WITH CHECK (app_is_platform() OR tenantId::text = app_tenant_id())',
      t
    );
    EXECUTE format(
      'CREATE POLICY p_delete ON %s FOR DELETE USING (app_is_platform() OR tenantId::text = app_tenant_id())',
      t
    );
  END IF;
END $$;


ALTER FUNCTION public.kaf_apply_policies(tablename text, has_id boolean) OWNER TO postgres;

--
-- TOC entry 515 (class 1255 OID 16611)
-- Name: kaf_apply_policies_col(regclass, text, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.kaf_apply_policies_col(tab regclass, tenant_col text, is_root boolean DEFAULT false) RETURNS void
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
BEGIN
  EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', tab);

  -- Drop prior standard policies if present
  EXECUTE format('DROP POLICY IF EXISTS p_select ON %s', tab);
  EXECUTE format('DROP POLICY IF EXISTS p_insert ON %s', tab);
  EXECUTE format('DROP POLICY IF EXISTS p_update ON %s', tab);
  EXECUTE format('DROP POLICY IF EXISTS p_delete ON %s', tab);

  IF is_root THEN
    -- Root tenant table matches id to app_tenant_id(); only platform can INSERT/DELETE
    EXECUTE format('CREATE POLICY p_select ON %s FOR SELECT USING (app_is_platform() OR id::text = app_tenant_id())', tab);
    EXECUTE format('CREATE POLICY p_insert ON %s FOR INSERT WITH CHECK (app_is_platform())', tab);
    EXECUTE format('CREATE POLICY p_update ON %s FOR UPDATE USING (app_is_platform() OR id::text = app_tenant_id()) WITH CHECK (app_is_platform() OR id::text = app_tenant_id())', tab);
    EXECUTE format('CREATE POLICY p_delete ON %s FOR DELETE USING (app_is_platform())', tab);
  ELSE
    -- Regular tenant-scoped tables: match tenantId/tenant_id to app_tenant_id()
    EXECUTE format('CREATE POLICY p_select ON %s FOR SELECT USING (app_is_platform() OR %I::text = app_tenant_id())', tab, tenant_col);
    EXECUTE format('CREATE POLICY p_insert ON %s FOR INSERT WITH CHECK (app_is_platform() OR %I::text = app_tenant_id())', tab, tenant_col);
    EXECUTE format('CREATE POLICY p_update ON %s FOR UPDATE USING (app_is_platform() OR %I::text = app_tenant_id()) WITH CHECK (app_is_platform() OR %I::text = app_tenant_id())', tab, tenant_col, tenant_col);
    EXECUTE format('CREATE POLICY p_delete ON %s FOR DELETE USING (app_is_platform() OR %I::text = app_tenant_id())', tab, tenant_col);
  END IF;
END $$;


ALTER FUNCTION public.kaf_apply_policies_col(tab regclass, tenant_col text, is_root boolean) OWNER TO postgres;

--
-- TOC entry 633 (class 1255 OID 16612)
-- Name: notify_zones_change(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_zones_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  payload JSONB;
BEGIN
  payload := jsonb_build_object(
    'tenant_id', COALESCE(NEW.tenant_id, OLD.tenant_id),
    'op', TG_OP,
    'zone', jsonb_build_object(
      'id', COALESCE(NEW.id, OLD.id),
      'name', COALESCE(NEW.name, OLD.name),
      'color', COALESCE(NEW.color, OLD.color),
      'ord', COALESCE(NEW.ord, OLD.ord)
    )
  );
  PERFORM pg_notify('zones_changes', payload::text);

  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;


ALTER FUNCTION public.notify_zones_change() OWNER TO postgres;

--
-- TOC entry 671 (class 1255 OID 16613)
-- Name: notify_zones_delete(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_zones_delete() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
declare
  payload jsonb;
begin
  payload := jsonb_build_object(
    'tenant_id', old.tenant_id,
    'op', TG_OP,
    'zone', jsonb_build_object('zone_id', old.zone_id)
  );
  perform pg_notify('zones_' || old.tenant_id::text, payload::text);
  return old;
end;
$$;


ALTER FUNCTION public.notify_zones_delete() OWNER TO postgres;

--
-- TOC entry 492 (class 1255 OID 101982)
-- Name: on_payment_succeeded(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.on_payment_succeeded() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  insert into public.order_status_events
    (order_id,
     previous_status, from_status, to_status, new_status,
     created_at, changed_at, updated_at,
     meta)
  values
    (NEW.order_id,
     'pending', 'pending', 'paid', 'paid',
     now(), now(), now(),
     '{}'::jsonb);
  return NEW;
end;
$$;


ALTER FUNCTION public.on_payment_succeeded() OWNER TO postgres;

--
-- TOC entry 476 (class 1255 OID 16614)
-- Name: order_items_enforce_tenant(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.order_items_enforce_tenant() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  -- Always take tenant_id from parent order
  select o.tenant_id into strict NEW.tenant_id
  from public.orders o
  where o.id = NEW.order_id;

  return NEW;
exception
  when no_data_found then
    raise exception 'order % not found for order_items', NEW.order_id using errcode = '23503';
end;
$$;


ALTER FUNCTION public.order_items_enforce_tenant() OWNER TO postgres;

--
-- TOC entry 557 (class 1255 OID 16615)
-- Name: orders_fill_defaults(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.orders_fill_defaults() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
begin
  if new.order_number is null or length(trim(new.order_number)) = 0 then
    new.order_number := 'ORD-' || substr(replace(gen_random_uuid()::text,'-',''),1,8);
  end if;

  if new.tenant_id is null and new.table_id is not null then
    select t.tenant_id into new.tenant_id
    from public.restaurant_tables t
    where t.id = new.table_id
    limit 1;
  end if;

  return new;
end $$;


ALTER FUNCTION public.orders_fill_defaults() OWNER TO postgres;

--
-- TOC entry 712 (class 1255 OID 16616)
-- Name: protect_tenant_code(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.protect_tenant_code() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
begin
  if TG_OP = 'UPDATE' and new.code <> old.code then
    raise exception 'tenant code is immutable';
  end if;
  return new;
end $$;


ALTER FUNCTION public.protect_tenant_code() OWNER TO postgres;

--
-- TOC entry 699 (class 1255 OID 106016)
-- Name: provision_trial_on_tenant_create(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.provision_trial_on_tenant_create() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_plan_id uuid;
begin
  select id into v_plan_id
  from public.billing_plans
  where code = 'basic' and is_active = true
  limit 1;

  if v_plan_id is null then
    return NEW;
  end if;

  insert into public.tenant_subscriptions
    (tenant_id, plan_id, status, current_period_start, current_period_end)
  values
    (NEW.id, v_plan_id, 'trialing', now(), now() + interval '7 days')
  on conflict do nothing;

  insert into public.subscription_events (tenant_id, event_type, details)
  values (NEW.id, 'trial_started', jsonb_build_object('plan_id', v_plan_id, 'days', 7));

  return NEW;
end;
$$;


ALTER FUNCTION public.provision_trial_on_tenant_create() OWNER TO postgres;

--
-- TOC entry 625 (class 1255 OID 16617)
-- Name: release_expired_holds(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.release_expired_holds() RETURNS void
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
begin
  -- close expired hold sessions
  update public.table_sessions s
  set status = 'closed'
  where status = 'hold' and expires_at < now();

  -- free the associated tables (held → available)
  update public.tables t
  set status = 'available', is_locked = false, updated_at = now()
  where status = 'held'
    and exists (
      select 1
      from public.table_sessions s
      where s.table_id = t.id
        and s.status = 'closed'
        and s.expires_at < now()
    );
end;
$$;


ALTER FUNCTION public.release_expired_holds() OWNER TO postgres;

--
-- TOC entry 592 (class 1255 OID 16618)
-- Name: request_tenant_id(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.request_tenant_id() RETURNS uuid
    LANGUAGE plpgsql STABLE
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
declare
  t text;
  claims jsonb;
begin
  -- Try JWT claim first (if present)
  claims := auth.jwt();
  if claims ? 'tenant_id' then
    t := claims->> 'tenant_id';
  end if;

  -- Fallback to header (PostgREST lower-cases and replaces '-' with '_')
  if t is null or t = '' then
    t := nullif(current_setting('request.header.x_tenant_id', true), '');
  end if;

  if t is null or t = '' then
    return null;  -- no tenant in context
  end if;

  return t::uuid;
exception
  when others then
    -- Never blow up RLS; just return null which will fail the USING/WITH CHECK predicates
    return null;
end;
$$;


ALTER FUNCTION public.request_tenant_id() OWNER TO postgres;

--
-- TOC entry 715 (class 1255 OID 16619)
-- Name: reservation_tenant_matches_table(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reservation_tenant_matches_table() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
begin
  if new.table_id is not null then
    if not exists (
      select 1 from public.tables t
      where t.id = new.table_id and t.tenant_id = new.tenant_id
    ) then
      raise exception 'reservation tenant (%), table tenant mismatch', new.tenant_id;
    end if;
  end if;
  return new;
end;
$$;


ALTER FUNCTION public.reservation_tenant_matches_table() OWNER TO postgres;

--
-- TOC entry 486 (class 1255 OID 16620)
-- Name: revenue_timeseries(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.revenue_timeseries() RETURNS TABLE(date text, revenue numeric)
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
  with my_tenants as (
    select s.tenant_id
    from public.staff s
    where s.user_id = auth.uid()
  )
  select
    to_char(date_trunc('day', o.created_at), 'YYYY-MM-DD') as date,
    sum(o.total) as revenue
  from public.orders o
  where o.tenant_id in (select tenant_id from my_tenants)
  group by 1
  order by 1;
$$;


ALTER FUNCTION public.revenue_timeseries() OWNER TO postgres;

--
-- TOC entry 536 (class 1255 OID 16621)
-- Name: revenue_timeseries(uuid[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.revenue_timeseries(tenant_ids uuid[]) RETURNS TABLE(date text, revenue numeric)
    LANGUAGE sql
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
  select
    to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as date,
    sum(o.total) as revenue
  from public.orders o
  where o.tenant_id = any(tenant_ids)
  group by 1
  order by 1;
$$;


ALTER FUNCTION public.revenue_timeseries(tenant_ids uuid[]) OWNER TO postgres;

--
-- TOC entry 547 (class 1255 OID 16622)
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END$$;


ALTER FUNCTION public.set_updated_at() OWNER TO postgres;

--
-- TOC entry 502 (class 1255 OID 118350)
-- Name: set_zones_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_zones_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_zones_updated_at() OWNER TO postgres;

--
-- TOC entry 585 (class 1255 OID 16623)
-- Name: table_sessions_enforce_tenant(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.table_sessions_enforce_tenant() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  -- Always derive from tables
  select t.tenant_id into strict NEW.tenant_id
  from public.tables t
  where t.id = NEW.table_id;

  return NEW;
exception
  when no_data_found then
    raise exception 'table % not found for table_sessions', NEW.table_id using errcode = '23503';
end;
$$;


ALTER FUNCTION public.table_sessions_enforce_tenant() OWNER TO postgres;

--
-- TOC entry 571 (class 1255 OID 120032)
-- Name: tables_id_default(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.tables_id_default() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.id IS NULL THEN
    NEW.id := gen_random_uuid();
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.tables_id_default() OWNER TO postgres;

--
-- TOC entry 481 (class 1255 OID 16624)
-- Name: tg_set_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.tg_set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public'
    AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END
$$;


ALTER FUNCTION public.tg_set_updated_at() OWNER TO postgres;

--
-- TOC entry 613 (class 1255 OID 16625)
-- Name: touch_tm_settings(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.touch_tm_settings() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
begin
  new.updated_at := now();
  return new;
end;
$$;


ALTER FUNCTION public.touch_tm_settings() OWNER TO postgres;

--
-- TOC entry 460 (class 1255 OID 16626)
-- Name: touch_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.touch_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
begin
  new.updated_at := now();
  return new;
end;
$$;


ALTER FUNCTION public.touch_updated_at() OWNER TO postgres;

--
-- TOC entry 726 (class 1255 OID 16627)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public', 'app'
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

--
-- TOC entry 528 (class 1255 OID 16628)
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_admin;

--
-- TOC entry 670 (class 1255 OID 16630)
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_admin;

--
-- TOC entry 548 (class 1255 OID 16631)
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_admin;

--
-- TOC entry 543 (class 1255 OID 16632)
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_admin;

--
-- TOC entry 454 (class 1255 OID 16633)
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_admin;

--
-- TOC entry 673 (class 1255 OID 16634)
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_admin;

--
-- TOC entry 665 (class 1255 OID 16635)
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_admin;

--
-- TOC entry 546 (class 1255 OID 16636)
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_admin;

--
-- TOC entry 641 (class 1255 OID 16637)
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- TOC entry 660 (class 1255 OID 16638)
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_admin;

--
-- TOC entry 588 (class 1255 OID 16639)
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_admin;

--
-- TOC entry 511 (class 1255 OID 16640)
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- TOC entry 725 (class 1255 OID 16641)
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


ALTER FUNCTION storage.add_prefixes(_bucket_id text, _name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 718 (class 1255 OID 16642)
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- TOC entry 659 (class 1255 OID 120091)
-- Name: delete_leaf_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_rows_deleted integer;
BEGIN
    LOOP
        WITH candidates AS (
            SELECT DISTINCT
                t.bucket_id,
                unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        ),
        uniq AS (
             SELECT
                 bucket_id,
                 name,
                 storage.get_level(name) AS level
             FROM candidates
             WHERE name <> ''
             GROUP BY bucket_id, name
        ),
        leaf AS (
             SELECT
                 p.bucket_id,
                 p.name,
                 p.level
             FROM storage.prefixes AS p
                  JOIN uniq AS u
                       ON u.bucket_id = p.bucket_id
                           AND u.name = p.name
                           AND u.level = p.level
             WHERE NOT EXISTS (
                 SELECT 1
                 FROM storage.objects AS o
                 WHERE o.bucket_id = p.bucket_id
                   AND o.level = p.level + 1
                   AND o.name COLLATE "C" LIKE p.name || '/%'
             )
             AND NOT EXISTS (
                 SELECT 1
                 FROM storage.prefixes AS c
                 WHERE c.bucket_id = p.bucket_id
                   AND c.level = p.level + 1
                   AND c.name COLLATE "C" LIKE p.name || '/%'
             )
        )
        DELETE
        FROM storage.prefixes AS p
            USING leaf AS l
        WHERE p.bucket_id = l.bucket_id
          AND p.name = l.name
          AND p.level = l.level;

        GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;
        EXIT WHEN v_rows_deleted = 0;
    END LOOP;
END;
$$;


ALTER FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]) OWNER TO supabase_storage_admin;

--
-- TOC entry 647 (class 1255 OID 16643)
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


ALTER FUNCTION storage.delete_prefix(_bucket_id text, _name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 470 (class 1255 OID 16644)
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


ALTER FUNCTION storage.delete_prefix_hierarchy_trigger() OWNER TO supabase_storage_admin;

--
-- TOC entry 662 (class 1255 OID 16645)
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION storage.enforce_bucket_name_length() OWNER TO supabase_storage_admin;

--
-- TOC entry 677 (class 1255 OID 16646)
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 643 (class 1255 OID 16647)
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 559 (class 1255 OID 16648)
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 697 (class 1255 OID 16649)
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


ALTER FUNCTION storage.get_level(name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 482 (class 1255 OID 16650)
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


ALTER FUNCTION storage.get_prefix(name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 631 (class 1255 OID 16651)
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


ALTER FUNCTION storage.get_prefixes(name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 497 (class 1255 OID 16652)
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- TOC entry 617 (class 1255 OID 16653)
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- TOC entry 663 (class 1255 OID 16654)
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text) OWNER TO supabase_storage_admin;

--
-- TOC entry 642 (class 1255 OID 120090)
-- Name: lock_top_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.lock_top_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket text;
    v_top text;
BEGIN
    FOR v_bucket, v_top IN
        SELECT DISTINCT t.bucket_id,
            split_part(t.name, '/', 1) AS top
        FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        WHERE t.name <> ''
        ORDER BY 1, 2
        LOOP
            PERFORM pg_advisory_xact_lock(hashtextextended(v_bucket || '/' || v_top, 0));
        END LOOP;
END;
$$;


ALTER FUNCTION storage.lock_top_prefixes(bucket_ids text[], names text[]) OWNER TO supabase_storage_admin;

--
-- TOC entry 651 (class 1255 OID 120092)
-- Name: objects_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.objects_delete_cleanup() OWNER TO supabase_storage_admin;

--
-- TOC entry 652 (class 1255 OID 16655)
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_insert_prefix_trigger() OWNER TO supabase_storage_admin;

--
-- TOC entry 638 (class 1255 OID 120093)
-- Name: objects_update_cleanup(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_update_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    -- NEW - OLD (destinations to create prefixes for)
    v_add_bucket_ids text[];
    v_add_names      text[];

    -- OLD - NEW (sources to prune)
    v_src_bucket_ids text[];
    v_src_names      text[];
BEGIN
    IF TG_OP <> 'UPDATE' THEN
        RETURN NULL;
    END IF;

    -- 1) Compute NEW−OLD (added paths) and OLD−NEW (moved-away paths)
    WITH added AS (
        SELECT n.bucket_id, n.name
        FROM new_rows n
        WHERE n.name <> '' AND position('/' in n.name) > 0
        EXCEPT
        SELECT o.bucket_id, o.name FROM old_rows o WHERE o.name <> ''
    ),
    moved AS (
         SELECT o.bucket_id, o.name
         FROM old_rows o
         WHERE o.name <> ''
         EXCEPT
         SELECT n.bucket_id, n.name FROM new_rows n WHERE n.name <> ''
    )
    SELECT
        -- arrays for ADDED (dest) in stable order
        COALESCE( (SELECT array_agg(a.bucket_id ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        COALESCE( (SELECT array_agg(a.name      ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        -- arrays for MOVED (src) in stable order
        COALESCE( (SELECT array_agg(m.bucket_id ORDER BY m.bucket_id, m.name) FROM moved m), '{}' ),
        COALESCE( (SELECT array_agg(m.name      ORDER BY m.bucket_id, m.name) FROM moved m), '{}' )
    INTO v_add_bucket_ids, v_add_names, v_src_bucket_ids, v_src_names;

    -- Nothing to do?
    IF (array_length(v_add_bucket_ids, 1) IS NULL) AND (array_length(v_src_bucket_ids, 1) IS NULL) THEN
        RETURN NULL;
    END IF;

    -- 2) Take per-(bucket, top) locks: ALL prefixes in consistent global order to prevent deadlocks
    DECLARE
        v_all_bucket_ids text[];
        v_all_names text[];
    BEGIN
        -- Combine source and destination arrays for consistent lock ordering
        v_all_bucket_ids := COALESCE(v_src_bucket_ids, '{}') || COALESCE(v_add_bucket_ids, '{}');
        v_all_names := COALESCE(v_src_names, '{}') || COALESCE(v_add_names, '{}');

        -- Single lock call ensures consistent global ordering across all transactions
        IF array_length(v_all_bucket_ids, 1) IS NOT NULL THEN
            PERFORM storage.lock_top_prefixes(v_all_bucket_ids, v_all_names);
        END IF;
    END;

    -- 3) Create destination prefixes (NEW−OLD) BEFORE pruning sources
    IF array_length(v_add_bucket_ids, 1) IS NOT NULL THEN
        WITH candidates AS (
            SELECT DISTINCT t.bucket_id, unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(v_add_bucket_ids, v_add_names) AS t(bucket_id, name)
            WHERE name <> ''
        )
        INSERT INTO storage.prefixes (bucket_id, name)
        SELECT c.bucket_id, c.name
        FROM candidates c
        ON CONFLICT DO NOTHING;
    END IF;

    -- 4) Prune source prefixes bottom-up for OLD−NEW
    IF array_length(v_src_bucket_ids, 1) IS NOT NULL THEN
        -- re-entrancy guard so DELETE on prefixes won't recurse
        IF current_setting('storage.gc.prefixes', true) <> '1' THEN
            PERFORM set_config('storage.gc.prefixes', '1', true);
        END IF;

        PERFORM storage.delete_leaf_prefixes(v_src_bucket_ids, v_src_names);
    END IF;

    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.objects_update_cleanup() OWNER TO supabase_storage_admin;

--
-- TOC entry 624 (class 1255 OID 120098)
-- Name: objects_update_level_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_update_level_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Set the new level
        NEW."level" := "storage"."get_level"(NEW."name");
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_update_level_trigger() OWNER TO supabase_storage_admin;

--
-- TOC entry 505 (class 1255 OID 16656)
-- Name: objects_update_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_update_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_update_prefix_trigger() OWNER TO supabase_storage_admin;

--
-- TOC entry 672 (class 1255 OID 16657)
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- TOC entry 494 (class 1255 OID 120094)
-- Name: prefixes_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.prefixes_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.prefixes_delete_cleanup() OWNER TO supabase_storage_admin;

--
-- TOC entry 510 (class 1255 OID 16658)
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.prefixes_insert_trigger() OWNER TO supabase_storage_admin;

--
-- TOC entry 649 (class 1255 OID 16659)
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- TOC entry 495 (class 1255 OID 16660)
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- TOC entry 473 (class 1255 OID 16661)
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- TOC entry 550 (class 1255 OID 120089)
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    sort_col text;
    sort_ord text;
    cursor_op text;
    cursor_expr text;
    sort_expr text;
BEGIN
    -- Validate sort_order
    sort_ord := lower(sort_order);
    IF sort_ord NOT IN ('asc', 'desc') THEN
        sort_ord := 'asc';
    END IF;

    -- Determine cursor comparison operator
    IF sort_ord = 'asc' THEN
        cursor_op := '>';
    ELSE
        cursor_op := '<';
    END IF;
    
    sort_col := lower(sort_column);
    -- Validate sort column  
    IF sort_col IN ('updated_at', 'created_at') THEN
        cursor_expr := format(
            '($5 = '''' OR ROW(date_trunc(''milliseconds'', %I), name COLLATE "C") %s ROW(COALESCE(NULLIF($6, '''')::timestamptz, ''epoch''::timestamptz), $5))',
            sort_col, cursor_op
        );
        sort_expr := format(
            'COALESCE(date_trunc(''milliseconds'', %I), ''epoch''::timestamptz) %s, name COLLATE "C" %s',
            sort_col, sort_ord, sort_ord
        );
    ELSE
        cursor_expr := format('($5 = '''' OR name COLLATE "C" %s $5)', cursor_op);
        sort_expr := format('name COLLATE "C" %s', sort_ord);
    END IF;

    RETURN QUERY EXECUTE format(
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    NULL::uuid AS id,
                    updated_at,
                    created_at,
                    NULL::timestamptz AS last_accessed_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
            UNION ALL
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    id,
                    updated_at,
                    created_at,
                    last_accessed_at,
                    metadata
                FROM storage.objects
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
        ) obj
        ORDER BY %s
        LIMIT $3
        $sql$,
        cursor_expr,    -- prefixes WHERE
        sort_expr,      -- prefixes ORDER BY
        cursor_expr,    -- objects WHERE
        sort_expr,      -- objects ORDER BY
        sort_expr       -- final ORDER BY
    )
    USING prefix, bucket_name, limits, levels, start_after, sort_column_after;
END;
$_$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text, sort_order text, sort_column text, sort_column_after text) OWNER TO supabase_storage_admin;

--
-- TOC entry 600 (class 1255 OID 16663)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

--
-- TOC entry 356 (class 1259 OID 16525)
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- TOC entry 5833 (class 0 OID 0)
-- Dependencies: 356
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- TOC entry 372 (class 1259 OID 16927)
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- TOC entry 5835 (class 0 OID 0)
-- Dependencies: 372
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- TOC entry 363 (class 1259 OID 16725)
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- TOC entry 5837 (class 0 OID 0)
-- Dependencies: 363
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- TOC entry 5838 (class 0 OID 0)
-- Dependencies: 363
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- TOC entry 355 (class 1259 OID 16518)
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- TOC entry 5840 (class 0 OID 0)
-- Dependencies: 355
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- TOC entry 367 (class 1259 OID 16814)
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- TOC entry 5842 (class 0 OID 0)
-- Dependencies: 367
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- TOC entry 366 (class 1259 OID 16802)
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- TOC entry 5844 (class 0 OID 0)
-- Dependencies: 366
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- TOC entry 365 (class 1259 OID 16789)
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- TOC entry 5846 (class 0 OID 0)
-- Dependencies: 365
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- TOC entry 428 (class 1259 OID 58411)
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_id text NOT NULL,
    client_secret_hash text NOT NULL,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048))
);


ALTER TABLE auth.oauth_clients OWNER TO supabase_auth_admin;

--
-- TOC entry 373 (class 1259 OID 16977)
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- TOC entry 354 (class 1259 OID 16507)
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- TOC entry 5850 (class 0 OID 0)
-- Dependencies: 354
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- TOC entry 353 (class 1259 OID 16506)
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- TOC entry 5852 (class 0 OID 0)
-- Dependencies: 353
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- TOC entry 370 (class 1259 OID 16856)
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- TOC entry 5854 (class 0 OID 0)
-- Dependencies: 370
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- TOC entry 371 (class 1259 OID 16874)
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- TOC entry 5856 (class 0 OID 0)
-- Dependencies: 371
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- TOC entry 357 (class 1259 OID 16533)
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- TOC entry 5858 (class 0 OID 0)
-- Dependencies: 357
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- TOC entry 364 (class 1259 OID 16755)
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- TOC entry 5859 (class 0 OID 0)
-- Dependencies: 364
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- TOC entry 5860 (class 0 OID 0)
-- Dependencies: 364
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- TOC entry 369 (class 1259 OID 16841)
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- TOC entry 5862 (class 0 OID 0)
-- Dependencies: 369
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- TOC entry 368 (class 1259 OID 16832)
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- TOC entry 5864 (class 0 OID 0)
-- Dependencies: 368
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- TOC entry 5865 (class 0 OID 0)
-- Dependencies: 368
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- TOC entry 352 (class 1259 OID 16495)
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- TOC entry 5867 (class 0 OID 0)
-- Dependencies: 352
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- TOC entry 5868 (class 0 OID 0)
-- Dependencies: 352
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- TOC entry 410 (class 1259 OID 31734)
-- Name: analytics_active_tables_now; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.analytics_active_tables_now WITH (security_invoker='on') AS
 SELECT tenant_id,
    (count(*) FILTER (WHERE (status = ANY (ARRAY['occupied'::text, 'serving'::text]))))::integer AS active_tables_now
   FROM public.tables t
  GROUP BY tenant_id;


ALTER VIEW public.analytics_active_tables_now OWNER TO postgres;

--
-- TOC entry 424 (class 1259 OID 45850)
-- Name: analytics_daily; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.analytics_daily (
    tenant_id uuid NOT NULL,
    day date NOT NULL,
    orders_count integer DEFAULT 0 NOT NULL,
    revenue_total numeric DEFAULT 0 NOT NULL,
    dine_in_count integer DEFAULT 0 NOT NULL,
    takeaway_count integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.analytics_daily OWNER TO postgres;

--
-- TOC entry 389 (class 1259 OID 17659)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    tenant_id uuid NOT NULL,
    customer_id uuid,
    table_id uuid,
    staff_id uuid,
    order_number text NOT NULL,
    order_type text DEFAULT 'dine_in'::text,
    status public.order_status DEFAULT 'pending'::public.order_status,
    subtotal numeric(10,2) DEFAULT 0 NOT NULL,
    tax_amount numeric(10,2) DEFAULT 0 NOT NULL,
    discount_amount numeric(10,2) DEFAULT 0 NOT NULL,
    tip_amount numeric(10,2) DEFAULT 0 NOT NULL,
    total_amount numeric(10,2) DEFAULT 0 NOT NULL,
    payment_status public.payment_status DEFAULT 'pending'::public.payment_status,
    special_instructions text,
    estimated_ready_time timestamp with time zone,
    ready_at timestamp with time zone,
    served_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    cancellation_reason text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    idempotency_key text,
    mode text DEFAULT 'takeaway'::text NOT NULL,
    total_cents integer DEFAULT 0 NOT NULL,
    session_id text DEFAULT ''::text NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL,
    order_code text DEFAULT ('ORD-'::text || substr(encode(extensions.gen_random_bytes(6), 'hex'::text), 1, 8)),
    currency text DEFAULT 'INR'::text NOT NULL,
    user_id uuid,
    archived_at timestamp with time zone,
    customer_name text,
    table_code text,
    cart_id uuid,
    CONSTRAINT orders_currency_len_chk CHECK (((char_length(currency) >= 3) AND (char_length(currency) <= 8)))
);

ALTER TABLE ONLY public.orders REPLICA IDENTITY FULL;

ALTER TABLE ONLY public.orders FORCE ROW LEVEL SECURITY;


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 391 (class 1259 OID 17722)
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    order_id uuid,
    amount numeric(10,2) NOT NULL,
    payment_method text NOT NULL,
    payment_provider text,
    provider_transaction_id text,
    status public.payment_status DEFAULT 'pending'::public.payment_status,
    processed_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE ONLY public.payments REPLICA IDENTITY FULL;

ALTER TABLE ONLY public.payments FORCE ROW LEVEL SECURITY;


ALTER TABLE public.payments OWNER TO postgres;

--
-- TOC entry 409 (class 1259 OID 31729)
-- Name: analytics_kpi_summary_7d; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.analytics_kpi_summary_7d WITH (security_invoker='on') AS
 WITH rev AS (
         SELECT o_1.tenant_id,
                CASE
                    WHEN (p.status = 'completed'::public.payment_status) THEN COALESCE(p.amount, (0)::numeric)
                    WHEN (p.status = 'refunded'::public.payment_status) THEN (- abs(COALESCE(p.amount, (0)::numeric)))
                    ELSE (0)::numeric
                END AS delta
           FROM (public.orders o_1
             LEFT JOIN public.payments p ON (((p.order_id = o_1.id) AND (p.created_at >= (now() - '7 days'::interval)))))
          WHERE (o_1.created_at >= (now() - '7 days'::interval))
        )
 SELECT tenant_id,
    count(DISTINCT id) AS orders_7d,
    ( SELECT sum(r.delta) AS sum
           FROM rev r
          WHERE (r.tenant_id = o.tenant_id)) AS revenue_7d,
    count(*) FILTER (WHERE (order_type = 'dine_in'::text)) AS dine_in_7d,
    count(*) FILTER (WHERE (order_type = 'takeaway'::text)) AS takeaway_7d
   FROM public.orders o
  WHERE (created_at >= (now() - '7 days'::interval))
  GROUP BY tenant_id;


ALTER VIEW public.analytics_kpi_summary_7d OWNER TO postgres;

--
-- TOC entry 408 (class 1259 OID 31724)
-- Name: analytics_revenue_7d; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.analytics_revenue_7d WITH (security_invoker='on') AS
 WITH money AS (
         SELECT p.tenant_id,
            (date_trunc('day'::text, p.created_at))::date AS d,
                CASE
                    WHEN (p.status = 'completed'::public.payment_status) THEN COALESCE(p.amount, (0)::numeric)
                    WHEN (p.status = 'refunded'::public.payment_status) THEN (- abs(COALESCE(p.amount, (0)::numeric)))
                    ELSE (0)::numeric
                END AS delta
           FROM public.payments p
          WHERE (p.created_at >= (now() - '7 days'::interval))
        )
 SELECT tenant_id,
    d,
    sum(delta) AS total
   FROM money
  GROUP BY tenant_id, d;


ALTER VIEW public.analytics_revenue_7d OWNER TO postgres;

--
-- TOC entry 395 (class 1259 OID 17804)
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    user_id uuid,
    action text NOT NULL,
    resource_type text NOT NULL,
    resource_id uuid,
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE ONLY public.audit_logs FORCE ROW LEVEL SECURITY;


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- TOC entry 443 (class 1259 OID 107542)
-- Name: billing_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.billing_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    price_cents integer NOT NULL,
    currency text DEFAULT 'USD'::text,
    "interval" text DEFAULT 'monthly'::text,
    features jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.billing_plans OWNER TO postgres;

--
-- TOC entry 441 (class 1259 OID 106058)
-- Name: billing_webhooks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.billing_webhooks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider text NOT NULL,
    event_id text NOT NULL,
    event_type text NOT NULL,
    payload jsonb NOT NULL,
    signature text,
    tenant_id uuid,
    status text DEFAULT 'received'::text NOT NULL,
    received_at timestamp with time zone DEFAULT now() NOT NULL,
    processed_at timestamp with time zone,
    CONSTRAINT billing_webhooks_provider_check CHECK ((provider = ANY (ARRAY['stripe'::text, 'razorpay'::text]))),
    CONSTRAINT billing_webhooks_status_check CHECK ((status = ANY (ARRAY['received'::text, 'processed'::text, 'error'::text])))
);


ALTER TABLE public.billing_webhooks OWNER TO postgres;

--
-- TOC entry 421 (class 1259 OID 37734)
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cart_id uuid NOT NULL,
    menu_item_id uuid NOT NULL,
    qty integer NOT NULL,
    instructions text,
    added_at timestamp with time zone DEFAULT now(),
    tenant_id uuid NOT NULL,
    price numeric DEFAULT 0 NOT NULL,
    name text,
    CONSTRAINT cart_items_quantity_check CHECK ((qty > 0))
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- TOC entry 420 (class 1259 OID 37670)
-- Name: cart_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    table_id uuid,
    session_token text NOT NULL,
    is_takeaway boolean DEFAULT false,
    expires_at timestamp with time zone DEFAULT (now() + '02:00:00'::interval),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.cart_sessions OWNER TO postgres;

--
-- TOC entry 432 (class 1259 OID 82145)
-- Name: carts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    mode text NOT NULL,
    table_code text,
    status text DEFAULT 'open'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid NOT NULL,
    CONSTRAINT carts_mode_check CHECK ((mode = ANY (ARRAY['dine_in'::text, 'takeaway'::text]))),
    CONSTRAINT carts_status_check CHECK ((status = ANY (ARRAY['open'::text, 'submitted'::text, 'abandoned'::text])))
);


ALTER TABLE public.carts OWNER TO postgres;

--
-- TOC entry 386 (class 1259 OID 17572)
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    name extensions.citext NOT NULL,
    description text,
    image_url text,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE ONLY public.categories FORCE ROW LEVEL SECURITY;


ALTER TABLE public.categories OWNER TO postgres;

--
-- TOC entry 388 (class 1259 OID 17636)
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    email text,
    phone text,
    first_name text,
    last_name text,
    date_of_birth date,
    preferences jsonb DEFAULT '{}'::jsonb,
    loyalty_points integer DEFAULT 0,
    total_spent numeric(10,2) DEFAULT 0,
    visit_count integer DEFAULT 0,
    last_visit_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE ONLY public.customers FORCE ROW LEVEL SECURITY;


ALTER TABLE public.customers OWNER TO postgres;

--
-- TOC entry 405 (class 1259 OID 27310)
-- Name: customization; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customization (
    tenant_id uuid NOT NULL,
    theme text DEFAULT 'default'::text,
    logo_url text,
    hero_video text,
    palette jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public.customization OWNER TO postgres;

--
-- TOC entry 396 (class 1259 OID 17823)
-- Name: daily_sales_summary; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.daily_sales_summary (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    date date NOT NULL,
    total_orders integer DEFAULT 0,
    total_revenue numeric(10,2) DEFAULT 0,
    total_customers integer DEFAULT 0,
    average_order_value numeric(10,2) DEFAULT 0,
    top_selling_items jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE ONLY public.daily_sales_summary FORCE ROW LEVEL SECURITY;


ALTER TABLE public.daily_sales_summary OWNER TO postgres;

--
-- TOC entry 406 (class 1259 OID 27364)
-- Name: domain_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.domain_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    aggregate_type text NOT NULL,
    aggregate_id uuid NOT NULL,
    event_type text NOT NULL,
    payload jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.domain_events OWNER TO postgres;

--
-- TOC entry 392 (class 1259 OID 17744)
-- Name: inventory_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    name text NOT NULL,
    description text,
    unit text NOT NULL,
    current_stock numeric(10,3) DEFAULT 0 NOT NULL,
    minimum_stock numeric(10,3) DEFAULT 0 NOT NULL,
    maximum_stock numeric(10,3),
    cost_per_unit numeric(10,2),
    supplier_info jsonb DEFAULT '{}'::jsonb,
    last_restocked_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE ONLY public.inventory_items FORCE ROW LEVEL SECURITY;


ALTER TABLE public.inventory_items OWNER TO postgres;

--
-- TOC entry 427 (class 1259 OID 54616)
-- Name: invitations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invitations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    tenant_id uuid NOT NULL,
    role text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    invited_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    accepted_at timestamp with time zone,
    CONSTRAINT invitations_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'manager'::text, 'staff'::text, 'kitchen'::text, 'cashier'::text]))),
    CONSTRAINT invitations_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'revoked'::text])))
);


ALTER TABLE public.invitations OWNER TO postgres;

--
-- TOC entry 402 (class 1259 OID 27223)
-- Name: locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.locations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name text NOT NULL,
    timezone text DEFAULT 'Australia/Brisbane'::text NOT NULL,
    currency text DEFAULT 'AUD'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.locations OWNER TO postgres;

--
-- TOC entry 404 (class 1259 OID 27296)
-- Name: menu_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name text NOT NULL,
    rank integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.menu_categories OWNER TO postgres;

--
-- TOC entry 387 (class 1259 OID 17589)
-- Name: menu_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    tenant_id uuid NOT NULL,
    category_id uuid,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    cost numeric(10,2),
    image_url text,
    images jsonb DEFAULT '[]'::jsonb,
    ingredients jsonb DEFAULT '[]'::jsonb,
    allergens jsonb DEFAULT '[]'::jsonb,
    nutritional_info jsonb DEFAULT '{}'::jsonb,
    dietary_info jsonb DEFAULT '{}'::jsonb,
    preparation_time integer,
    calories integer,
    is_available boolean DEFAULT true,
    is_featured boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    variants jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    active boolean DEFAULT true NOT NULL,
    section_id uuid NOT NULL,
    ord integer DEFAULT 0,
    tags jsonb DEFAULT '[]'::jsonb,
    spicy_level integer
);

ALTER TABLE ONLY public.menu_items FORCE ROW LEVEL SECURITY;


ALTER TABLE public.menu_items OWNER TO postgres;

--
-- TOC entry 431 (class 1259 OID 77126)
-- Name: menu_sections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_sections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name extensions.citext NOT NULL,
    ord integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.menu_sections OWNER TO postgres;

--
-- TOC entry 394 (class 1259 OID 17783)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    user_id uuid,
    type public.notification_type NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    data jsonb DEFAULT '{}'::jsonb,
    is_read boolean DEFAULT false,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE ONLY public.notifications FORCE ROW LEVEL SECURITY;


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 390 (class 1259 OID 17699)
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    order_id uuid,
    menu_item_id uuid,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(10,2) NOT NULL,
    customizations jsonb DEFAULT '{}'::jsonb,
    special_instructions text,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    tenant_id uuid NOT NULL,
    currency text,
    item_name text
);

ALTER TABLE ONLY public.order_items REPLICA IDENTITY FULL;

ALTER TABLE ONLY public.order_items FORCE ROW LEVEL SECURITY;


ALTER TABLE public.order_items OWNER TO postgres;

--
-- TOC entry 418 (class 1259 OID 37378)
-- Name: payment_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider text NOT NULL,
    event_id text,
    tenant_id uuid,
    order_id uuid,
    payload jsonb NOT NULL,
    received_at timestamp with time zone DEFAULT now() NOT NULL,
    processed_at timestamp with time zone,
    payment_intent_id uuid,
    event_type text,
    raw_payload jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    event_data jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT payment_events_provider_check CHECK ((provider = ANY (ARRAY['stripe'::text, 'razorpay'::text, 'other'::text])))
);

ALTER TABLE ONLY public.payment_events REPLICA IDENTITY FULL;


ALTER TABLE public.payment_events OWNER TO postgres;

--
-- TOC entry 417 (class 1259 OID 37148)
-- Name: payment_intents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_intents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    order_id uuid,
    provider text NOT NULL,
    provider_intent_id text,
    amount numeric(12,2) NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    status text NOT NULL,
    client_secret_last4 text,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_by_user_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    provider_id uuid,
    cart_id uuid,
    CONSTRAINT payment_intents_amount_check CHECK ((amount >= (0)::numeric)),
    CONSTRAINT payment_intents_provider_check CHECK ((provider = ANY (ARRAY['stripe'::text, 'razorpay'::text, 'mock'::text]))),
    CONSTRAINT payment_intents_status_check CHECK ((status = ANY (ARRAY['requires_payment_method'::text, 'requires_confirmation'::text, 'processing'::text, 'succeeded'::text, 'canceled'::text, 'requires_action'::text, 'failed'::text])))
);

ALTER TABLE ONLY public.payment_intents REPLICA IDENTITY FULL;


ALTER TABLE public.payment_intents OWNER TO postgres;

--
-- TOC entry 416 (class 1259 OID 34014)
-- Name: payment_providers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    provider text NOT NULL,
    api_key text NOT NULL,
    secret_key text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    display_name text,
    publishable_key text,
    secret_last4 text,
    is_live boolean DEFAULT false NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    CONSTRAINT payment_providers_provider_check CHECK ((provider = ANY (ARRAY['stripe'::text, 'razorpay'::text])))
);


ALTER TABLE public.payment_providers OWNER TO postgres;

--
-- TOC entry 412 (class 1259 OID 33845)
-- Name: payment_refunds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_refunds (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    payment_id uuid NOT NULL,
    refund_amount numeric(10,2) NOT NULL,
    refund_reason text,
    refunded_by uuid,
    refunded_at timestamp with time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'initiated'::text,
    tenant_id uuid,
    order_id uuid,
    amount numeric(12,2),
    reason text,
    processor_refund_id text,
    method text,
    requested_by_user_id uuid,
    processed_at timestamp with time zone,
    approved_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by_staff_id uuid,
    payment_intent_id uuid,
    CONSTRAINT payment_refunds_amount_chk CHECK ((amount > (0)::numeric)),
    CONSTRAINT payment_refunds_method_chk CHECK ((method = ANY (ARRAY['card'::text, 'cash'::text, 'wallet'::text, 'upi'::text]))),
    CONSTRAINT payment_refunds_status_check CHECK ((status = ANY (ARRAY['initiated'::text, 'processed'::text, 'failed'::text]))),
    CONSTRAINT payment_refunds_status_chk CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text])))
);


ALTER TABLE public.payment_refunds OWNER TO postgres;

--
-- TOC entry 413 (class 1259 OID 33866)
-- Name: payment_splits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_splits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    payment_id uuid NOT NULL,
    method text NOT NULL,
    amount numeric(10,2) NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    order_id uuid NOT NULL,
    tenant_id uuid,
    payer_type text,
    staff_user_id uuid,
    note text,
    payer_user uuid,
    payer_staff_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payment_splits_amount_chk CHECK ((amount > (0)::numeric)),
    CONSTRAINT payment_splits_method_chk CHECK ((method = ANY (ARRAY['card'::text, 'cash'::text, 'wallet'::text, 'upi'::text]))),
    CONSTRAINT payment_splits_payer_type_chk CHECK ((payer_type = ANY (ARRAY['customer'::text, 'staff'::text])))
);


ALTER TABLE public.payment_splits OWNER TO postgres;

--
-- TOC entry 415 (class 1259 OID 33897)
-- Name: printer_configs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.printer_configs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    printer_name text NOT NULL,
    printer_ip text,
    printer_port integer,
    is_enabled boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.printer_configs OWNER TO postgres;

--
-- TOC entry 419 (class 1259 OID 37610)
-- Name: qr_scans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.qr_scans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    table_id uuid,
    scanned_by_user uuid,
    session_id text,
    device_info jsonb,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.qr_scans OWNER TO postgres;

--
-- TOC entry 414 (class 1259 OID 33880)
-- Name: receipt_deliveries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.receipt_deliveries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    delivery_method text NOT NULL,
    delivery_address text NOT NULL,
    sent_at timestamp with time zone DEFAULT now(),
    status text DEFAULT 'pending'::text,
    CONSTRAINT receipt_deliveries_delivery_method_check CHECK ((delivery_method = ANY (ARRAY['email'::text, 'sms'::text]))),
    CONSTRAINT receipt_deliveries_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'sent'::text, 'failed'::text])))
);


ALTER TABLE public.receipt_deliveries OWNER TO postgres;

--
-- TOC entry 429 (class 1259 OID 65126)
-- Name: reservations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    table_id uuid NOT NULL,
    customer_name text NOT NULL,
    guest_count integer NOT NULL,
    reservation_time timestamp with time zone NOT NULL,
    status text DEFAULT 'reserved'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    starts_at timestamp with time zone,
    ends_at timestamp with time zone
);


ALTER TABLE public.reservations OWNER TO postgres;

--
-- TOC entry 450 (class 1259 OID 117494)
-- Name: restaurant_tables_backup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restaurant_tables_backup (
    id uuid,
    tenant_id uuid,
    table_number text,
    capacity integer,
    location text,
    status public.table_status,
    qr_code text,
    notes text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    is_locked boolean,
    is_occupied boolean,
    zone_id uuid
);


ALTER TABLE public.restaurant_tables_backup OWNER TO postgres;

--
-- TOC entry 401 (class 1259 OID 27206)
-- Name: staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text,
    status text DEFAULT 'available'::text NOT NULL,
    CONSTRAINT staff_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'manager'::text, 'waiter'::text, 'kitchen'::text, 'counter'::text]))),
    CONSTRAINT staff_status_check CHECK ((status = ANY (ARRAY['available'::text, 'busy'::text, 'offline'::text])))
);


ALTER TABLE public.staff OWNER TO postgres;

--
-- TOC entry 393 (class 1259 OID 17762)
-- Name: staff_schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_schedules (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    staff_id uuid,
    shift_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    break_duration integer DEFAULT 0,
    hourly_rate numeric(8,2),
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE ONLY public.staff_schedules FORCE ROW LEVEL SECURITY;


ALTER TABLE public.staff_schedules OWNER TO postgres;

--
-- TOC entry 440 (class 1259 OID 105862)
-- Name: subscription_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    event_type text NOT NULL,
    details jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.subscription_events OWNER TO postgres;

--
-- TOC entry 438 (class 1259 OID 105732)
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    price_monthly numeric(10,2) NOT NULL,
    price_yearly numeric(10,2),
    features jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.subscription_plans OWNER TO postgres;

--
-- TOC entry 400 (class 1259 OID 22961)
-- Name: table_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.table_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    table_id uuid NOT NULL,
    pin_hash text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    locked_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_by text,
    cart_version integer DEFAULT 0 NOT NULL,
    ended_at timestamp with time zone
);

ALTER TABLE ONLY public.table_sessions FORCE ROW LEVEL SECURITY;


ALTER TABLE public.table_sessions OWNER TO postgres;

--
-- TOC entry 437 (class 1259 OID 105644)
-- Name: tenant_subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenant_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    plan_id uuid NOT NULL,
    status public.subscription_status DEFAULT 'trialing'::public.subscription_status NOT NULL,
    trial_start_at timestamp with time zone,
    trial_end_at timestamp with time zone,
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    cancel_at_period_end boolean DEFAULT false NOT NULL,
    canceled_at timestamp with time zone,
    provider text,
    external_subscription_id text,
    external_customer_id text,
    latest_invoice_id text,
    meta jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    cancel_at timestamp with time zone,
    CONSTRAINT tenant_subscriptions_dates_chk CHECK (((trial_end_at IS NULL) OR (trial_start_at IS NULL) OR (trial_end_at >= trial_start_at)))
);


ALTER TABLE public.tenant_subscriptions OWNER TO postgres;

--
-- TOC entry 442 (class 1259 OID 106150)
-- Name: tenant_active_subscription_v; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.tenant_active_subscription_v AS
 SELECT DISTINCT ON (ts.tenant_id) ts.tenant_id,
    ts.id AS subscription_id,
    ts.status,
    sp.code AS plan_code,
    sp.name AS plan_name,
    sp.features,
    ts.current_period_start,
    ts.current_period_end
   FROM (public.tenant_subscriptions ts
     JOIN public.subscription_plans sp ON ((sp.id = ts.plan_id)))
  WHERE ((ts.status = ANY (ARRAY['trialing'::public.subscription_status, 'active'::public.subscription_status])) AND (ts.current_period_end > now()))
  ORDER BY ts.tenant_id, ts.current_period_end DESC, ts.created_at DESC;


ALTER VIEW public.tenant_active_subscription_v OWNER TO postgres;

--
-- TOC entry 439 (class 1259 OID 105826)
-- Name: tenant_entitlements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenant_entitlements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    feature_key text NOT NULL,
    feature_value jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    plan_code text DEFAULT 'basic'::text NOT NULL,
    limits jsonb DEFAULT '{}'::jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.tenant_entitlements OWNER TO postgres;

--
-- TOC entry 434 (class 1259 OID 85662)
-- Name: tenant_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenant_settings (
    tenant_id uuid NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    tax_mode text DEFAULT 'single'::text NOT NULL,
    total_rate numeric DEFAULT 0 NOT NULL,
    components jsonb DEFAULT '[]'::jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tenant_settings OWNER TO postgres;

--
-- TOC entry 433 (class 1259 OID 82659)
-- Name: tenant_tax_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenant_tax_config (
    tenant_id uuid NOT NULL,
    mode text DEFAULT 'single'::text NOT NULL,
    total_rate numeric(6,3) DEFAULT 8.000 NOT NULL,
    components jsonb,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    inclusion text,
    CONSTRAINT chk_tenant_tax_inclusion CHECK ((inclusion = ANY (ARRAY['inclusive'::text, 'exclusive'::text]))),
    CONSTRAINT tenant_tax_components_valid_chk CHECK (public.is_valid_tax_components(components)),
    CONSTRAINT tenant_tax_config_mode_check CHECK ((mode = ANY (ARRAY['single'::text, 'components'::text]))),
    CONSTRAINT tenant_tax_currency_chk CHECK (((char_length(currency) >= 3) AND (char_length(currency) <= 8)))
);


ALTER TABLE public.tenant_tax_config OWNER TO postgres;

--
-- TOC entry 384 (class 1259 OID 17537)
-- Name: tenants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenants (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    logo_url text,
    website text,
    phone text,
    email text,
    address jsonb,
    settings jsonb DEFAULT '{}'::jsonb,
    subscription_plan text DEFAULT 'basic'::text,
    subscription_status text DEFAULT 'active'::text,
    trial_ends_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    code text NOT NULL,
    plan_type text DEFAULT 'basic'::text,
    CONSTRAINT tenants_code_len_chk CHECK ((length(code) = 4)),
    CONSTRAINT tenants_plan_type_check CHECK ((plan_type = ANY (ARRAY['basic'::text, 'pro'::text, 'elite'::text])))
);


ALTER TABLE public.tenants OWNER TO postgres;

--
-- TOC entry 430 (class 1259 OID 67236)
-- Name: tm_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tm_settings (
    tenant_id text NOT NULL,
    hold_minutes integer DEFAULT 15 NOT NULL,
    cleaning_minutes integer DEFAULT 10 NOT NULL,
    allow_transfers boolean DEFAULT true NOT NULL,
    allow_merge_split boolean DEFAULT true NOT NULL,
    require_manager_override boolean DEFAULT false NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tm_settings OWNER TO postgres;

--
-- TOC entry 385 (class 1259 OID 17552)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    email text NOT NULL,
    password_hash text,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text,
    avatar_url text,
    role public.user_role DEFAULT 'staff'::public.user_role,
    permissions jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    last_login_at timestamp with time zone,
    email_verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE ONLY public.users FORCE ROW LEVEL SECURITY;


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 425 (class 1259 OID 45950)
-- Name: v_analytics_daily_secure; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_analytics_daily_secure WITH (security_invoker='true', security_barrier='true') AS
 SELECT tenant_id,
    day,
    orders_count,
    revenue_total,
    dine_in_count,
    takeaway_count,
    updated_at
   FROM public.analytics_daily ad
  WHERE (tenant_id IN ( SELECT s.tenant_id
           FROM public.staff s
          WHERE (s.user_id = auth.uid())));


ALTER VIEW public.v_analytics_daily_secure OWNER TO postgres;

--
-- TOC entry 407 (class 1259 OID 29026)
-- Name: v_current_staff; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_current_staff WITH (security_invoker='true', security_barrier='true') AS
 SELECT id,
    tenant_id,
    user_id,
    role,
    created_at
   FROM public.staff s
  WHERE (user_id = auth.uid());


ALTER VIEW public.v_current_staff OWNER TO postgres;

--
-- TOC entry 422 (class 1259 OID 45574)
-- Name: v_orders_latest_status; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_orders_latest_status WITH (security_invoker='true', security_barrier='true') AS
 SELECT ose.order_id,
    ose.to_status AS latest_status,
    ose.changed_at,
        CASE
            WHEN (ose.to_status = ANY (ARRAY['pending'::text, 'placed'::text])) THEN 'queued'::text
            WHEN (ose.to_status = 'preparing'::text) THEN 'preparing'::text
            WHEN (ose.to_status = 'ready'::text) THEN 'ready'::text
            WHEN (ose.to_status = ANY (ARRAY['served'::text, 'paid'::text])) THEN 'completed'::text
            WHEN (ose.to_status = 'cancelled'::text) THEN 'cancelled'::text
            ELSE 'other'::text
        END AS lane
   FROM (public.order_status_events ose
     JOIN ( SELECT order_status_events.order_id,
            max(order_status_events.changed_at) AS latest_changed
           FROM public.order_status_events
          GROUP BY order_status_events.order_id) last ON (((last.order_id = ose.order_id) AND (last.latest_changed = ose.changed_at))));


ALTER VIEW public.v_orders_latest_status OWNER TO postgres;

--
-- TOC entry 423 (class 1259 OID 45579)
-- Name: v_kds_lane_counts; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_kds_lane_counts WITH (security_invoker='true', security_barrier='true') AS
 SELECT lane,
    (count(*))::integer AS orders
   FROM public.v_orders_latest_status
  GROUP BY lane;


ALTER VIEW public.v_kds_lane_counts OWNER TO postgres;

--
-- TOC entry 426 (class 1259 OID 51838)
-- Name: v_payment_events_amounts; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_payment_events_amounts WITH (security_invoker='true', security_barrier='true') AS
 SELECT id,
    tenant_id,
    event_type,
    COALESCE((NULLIF((payload ->> 'amount'::text), ''::text))::numeric, (0)::numeric) AS amount_num,
    created_at
   FROM public.payment_events e;


ALTER VIEW public.v_payment_events_amounts OWNER TO postgres;

--
-- TOC entry 436 (class 1259 OID 98424)
-- Name: v_tenant_tax_effective; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_tenant_tax_effective AS
 SELECT tenant_id,
    mode,
    total_rate AS effective_rate,
    components AS breakdown,
    COALESCE(inclusion, 'inclusive'::text) AS inclusion,
    currency,
    updated_at
   FROM public.tenant_tax_config t;


ALTER VIEW public.v_tenant_tax_effective OWNER TO postgres;

--
-- TOC entry 452 (class 1259 OID 118432)
-- Name: zones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.zones (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name text NOT NULL,
    color text DEFAULT '#3B82F6'::text NOT NULL,
    ord integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.zones OWNER TO postgres;

--
-- TOC entry 382 (class 1259 OID 17255)
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- TOC entry 444 (class 1259 OID 111031)
-- Name: messages_2025_09_28; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_09_28 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_09_28 OWNER TO supabase_admin;

--
-- TOC entry 445 (class 1259 OID 111104)
-- Name: messages_2025_09_29; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_09_29 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_09_29 OWNER TO supabase_admin;

--
-- TOC entry 446 (class 1259 OID 112219)
-- Name: messages_2025_09_30; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_09_30 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_09_30 OWNER TO supabase_admin;

--
-- TOC entry 447 (class 1259 OID 113555)
-- Name: messages_2025_10_01; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_10_01 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_10_01 OWNER TO supabase_admin;

--
-- TOC entry 448 (class 1259 OID 114670)
-- Name: messages_2025_10_02; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_10_02 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_10_02 OWNER TO supabase_admin;

--
-- TOC entry 449 (class 1259 OID 115785)
-- Name: messages_2025_10_03; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_10_03 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_10_03 OWNER TO supabase_admin;

--
-- TOC entry 451 (class 1259 OID 117882)
-- Name: messages_2025_10_04; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_10_04 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_10_04 OWNER TO supabase_admin;

--
-- TOC entry 453 (class 1259 OID 120077)
-- Name: messages_2025_10_05; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_10_05 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_10_05 OWNER TO supabase_admin;

--
-- TOC entry 376 (class 1259 OID 17087)
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- TOC entry 379 (class 1259 OID 17109)
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE realtime.subscription OWNER TO supabase_admin;

--
-- TOC entry 378 (class 1259 OID 17108)
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 358 (class 1259 OID 16546)
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- TOC entry 5939 (class 0 OID 0)
-- Dependencies: 358
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- TOC entry 398 (class 1259 OID 19036)
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_analytics (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.buckets_analytics OWNER TO supabase_storage_admin;

--
-- TOC entry 360 (class 1259 OID 16588)
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- TOC entry 359 (class 1259 OID 16561)
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    level integer
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- TOC entry 5942 (class 0 OID 0)
-- Dependencies: 359
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- TOC entry 397 (class 1259 OID 18991)
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE storage.prefixes OWNER TO supabase_storage_admin;

--
-- TOC entry 374 (class 1259 OID 17035)
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- TOC entry 375 (class 1259 OID 17049)
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- TOC entry 383 (class 1259 OID 17272)
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: postgres
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text
);


ALTER TABLE supabase_migrations.schema_migrations OWNER TO postgres;

--
-- TOC entry 399 (class 1259 OID 22805)
-- Name: seed_files; Type: TABLE; Schema: supabase_migrations; Owner: postgres
--

CREATE TABLE supabase_migrations.seed_files (
    path text NOT NULL,
    hash text NOT NULL
);


ALTER TABLE supabase_migrations.seed_files OWNER TO postgres;

--
-- TOC entry 4150 (class 0 OID 0)
-- Name: messages_2025_09_28; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_28 FOR VALUES FROM ('2025-09-28 00:00:00') TO ('2025-09-29 00:00:00');


--
-- TOC entry 4151 (class 0 OID 0)
-- Name: messages_2025_09_29; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_29 FOR VALUES FROM ('2025-09-29 00:00:00') TO ('2025-09-30 00:00:00');


--
-- TOC entry 4152 (class 0 OID 0)
-- Name: messages_2025_09_30; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_30 FOR VALUES FROM ('2025-09-30 00:00:00') TO ('2025-10-01 00:00:00');


--
-- TOC entry 4153 (class 0 OID 0)
-- Name: messages_2025_10_01; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_10_01 FOR VALUES FROM ('2025-10-01 00:00:00') TO ('2025-10-02 00:00:00');


--
-- TOC entry 4154 (class 0 OID 0)
-- Name: messages_2025_10_02; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_10_02 FOR VALUES FROM ('2025-10-02 00:00:00') TO ('2025-10-03 00:00:00');


--
-- TOC entry 4155 (class 0 OID 0)
-- Name: messages_2025_10_03; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_10_03 FOR VALUES FROM ('2025-10-03 00:00:00') TO ('2025-10-04 00:00:00');


--
-- TOC entry 4156 (class 0 OID 0)
-- Name: messages_2025_10_04; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_10_04 FOR VALUES FROM ('2025-10-04 00:00:00') TO ('2025-10-05 00:00:00');


--
-- TOC entry 4157 (class 0 OID 0)
-- Name: messages_2025_10_05; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_10_05 FOR VALUES FROM ('2025-10-05 00:00:00') TO ('2025-10-06 00:00:00');


--
-- TOC entry 4167 (class 2604 OID 17053)
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- TOC entry 5503 (class 0 OID 16525)
-- Dependencies: 356
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
00000000-0000-0000-0000-000000000000	c6cf3f88-ff71-4e83-862e-2bac1237704f	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"demo@example.com","user_id":"79bbda7d-ea19-4dfd-a479-b5fafe7460c6","user_phone":""}}	2025-08-26 03:06:44.490878+00	
00000000-0000-0000-0000-000000000000	3f05cf8c-6fd8-435b-8d2c-8e061a429c29	{"action":"login","actor_id":"79bbda7d-ea19-4dfd-a479-b5fafe7460c6","actor_username":"demo@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-26 03:49:46.572058+00	
00000000-0000-0000-0000-000000000000	6d852dbe-a179-4f01-a71a-aaff188cb1e9	{"action":"login","actor_id":"79bbda7d-ea19-4dfd-a479-b5fafe7460c6","actor_username":"demo@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-26 03:59:24.150971+00	
00000000-0000-0000-0000-000000000000	0f111825-42e4-46c8-8795-0105fe9cfe25	{"action":"login","actor_id":"79bbda7d-ea19-4dfd-a479-b5fafe7460c6","actor_username":"demo@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-26 06:31:07.733808+00	
00000000-0000-0000-0000-000000000000	7a353db1-18f3-474f-a6b9-a1753800e2bb	{"action":"login","actor_id":"79bbda7d-ea19-4dfd-a479-b5fafe7460c6","actor_username":"demo@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-26 07:42:22.183306+00	
00000000-0000-0000-0000-000000000000	080015d7-6c95-4603-8dc5-ef4a6ab303b2	{"action":"login","actor_id":"79bbda7d-ea19-4dfd-a479-b5fafe7460c6","actor_username":"demo@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-26 07:43:56.072683+00	
00000000-0000-0000-0000-000000000000	07a8d6ed-8f8c-4350-be43-39c95604ca68	{"action":"login","actor_id":"79bbda7d-ea19-4dfd-a479-b5fafe7460c6","actor_username":"demo@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-29 12:55:17.065287+00	
00000000-0000-0000-0000-000000000000	1f389773-57c6-472d-aac3-2c37f9e7c2e1	{"action":"login","actor_id":"79bbda7d-ea19-4dfd-a479-b5fafe7460c6","actor_username":"demo@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-29 14:44:23.423253+00	
00000000-0000-0000-0000-000000000000	52d36e3a-56bd-4853-a09b-f94cc81e9b8e	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"you@example.com","user_id":"d8a4a477-8c80-4239-a6ef-b8b2781036b4","user_phone":""}}	2025-08-31 04:29:07.9163+00	
00000000-0000-0000-0000-000000000000	aaf0c5d2-6231-42d7-9b4d-a5762a9d0511	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"admin@projectkaf.local","user_id":"62debc4f-7e65-47f0-b2d4-9e43f20cb10c","user_phone":""}}	2025-08-31 05:34:10.573515+00	
00000000-0000-0000-0000-000000000000	ab6e08d3-aa2a-4104-85d5-0aad513a2d6a	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"skm@projectkaf.local","user_id":"e1328e76-0967-4b16-a10d-a400e04905d1","user_phone":""}}	2025-08-31 08:58:27.817964+00	
00000000-0000-0000-0000-000000000000	bacc544d-7e41-473f-add9-fe9e70e3bc24	{"action":"login","actor_id":"e1328e76-0967-4b16-a10d-a400e04905d1","actor_username":"skm@projectkaf.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-31 12:15:27.509018+00	
00000000-0000-0000-0000-000000000000	dcaba900-38ab-428e-a77a-276d1e6fdc38	{"action":"token_refreshed","actor_id":"e1328e76-0967-4b16-a10d-a400e04905d1","actor_username":"skm@projectkaf.local","actor_via_sso":false,"log_type":"token"}	2025-08-31 13:13:45.938786+00	
00000000-0000-0000-0000-000000000000	4f5bcb00-4eb0-4d7d-abb4-fd04d9fe11c2	{"action":"token_revoked","actor_id":"e1328e76-0967-4b16-a10d-a400e04905d1","actor_username":"skm@projectkaf.local","actor_via_sso":false,"log_type":"token"}	2025-08-31 13:13:45.955551+00	
00000000-0000-0000-0000-000000000000	6a96636b-1233-4dbc-81fd-998fcdf13d85	{"action":"logout","actor_id":"e1328e76-0967-4b16-a10d-a400e04905d1","actor_username":"skm@projectkaf.local","actor_via_sso":false,"log_type":"account"}	2025-08-31 13:29:00.833839+00	
00000000-0000-0000-0000-000000000000	c24850d3-1021-495c-98be-e8ab93874c1c	{"action":"user_signedup","actor_id":"63da76de-e468-489d-bba7-351759125e9d","actor_username":"newuser@projectkaf.local","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-08-31 13:29:42.53924+00	
00000000-0000-0000-0000-000000000000	72bbdc1d-1698-45e6-bb63-9d704081ea06	{"action":"login","actor_id":"63da76de-e468-489d-bba7-351759125e9d","actor_username":"newuser@projectkaf.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-31 13:29:42.547231+00	
00000000-0000-0000-0000-000000000000	c726eb9c-c9b2-49ba-a774-0d2a0383e1f3	{"action":"user_signedup","actor_id":"26163ea2-2882-4487-a9c1-2f83ec83d435","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-08-31 13:46:30.36363+00	
00000000-0000-0000-0000-000000000000	ce0296fe-7b16-423f-b8b3-5eab9447ba25	{"action":"login","actor_id":"26163ea2-2882-4487-a9c1-2f83ec83d435","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-31 13:46:30.375618+00	
00000000-0000-0000-0000-000000000000	6f2145c0-27e3-4dfc-9bd9-eb82004f69e2	{"action":"logout","actor_id":"26163ea2-2882-4487-a9c1-2f83ec83d435","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-08-31 14:33:53.847556+00	
00000000-0000-0000-0000-000000000000	17abd519-98e5-4e32-af5a-79ac3b26f321	{"action":"login","actor_id":"26163ea2-2882-4487-a9c1-2f83ec83d435","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-31 14:35:17.131107+00	
00000000-0000-0000-0000-000000000000	b87aad0d-361b-4f2e-93b7-f800de296d40	{"action":"logout","actor_id":"26163ea2-2882-4487-a9c1-2f83ec83d435","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-08-31 14:41:17.605017+00	
00000000-0000-0000-0000-000000000000	1c71d482-7305-4289-a2b0-da081acb3980	{"action":"login","actor_id":"26163ea2-2882-4487-a9c1-2f83ec83d435","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-31 14:42:40.898764+00	
00000000-0000-0000-0000-000000000000	495eaa45-33df-4bc4-be67-9ceecfbed9de	{"action":"token_refreshed","actor_id":"26163ea2-2882-4487-a9c1-2f83ec83d435","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-01 02:06:15.681209+00	
00000000-0000-0000-0000-000000000000	135de1b1-911c-4686-927a-d051606a7264	{"action":"token_revoked","actor_id":"26163ea2-2882-4487-a9c1-2f83ec83d435","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-01 02:06:15.706491+00	
00000000-0000-0000-0000-000000000000	9c0d3069-7ff1-4b57-8a8a-5ef2da3f0e7b	{"action":"token_refreshed","actor_id":"26163ea2-2882-4487-a9c1-2f83ec83d435","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-01 02:36:56.645835+00	
00000000-0000-0000-0000-000000000000	4a80631e-8bbc-4a00-9061-3d6088e3b0b9	{"action":"token_revoked","actor_id":"26163ea2-2882-4487-a9c1-2f83ec83d435","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-01 02:36:56.654404+00	
00000000-0000-0000-0000-000000000000	cbdb5e34-826a-491a-a2e4-86ba56accaaf	{"action":"token_refreshed","actor_id":"26163ea2-2882-4487-a9c1-2f83ec83d435","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-01 02:41:59.005672+00	
00000000-0000-0000-0000-000000000000	48f25c69-cfb1-4cce-b5d9-a81f7c8a27c2	{"action":"token_revoked","actor_id":"26163ea2-2882-4487-a9c1-2f83ec83d435","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-01 02:41:59.007347+00	
00000000-0000-0000-0000-000000000000	f61d4d6c-82fb-4770-b6dc-a88c5905dba2	{"action":"token_refreshed","actor_id":"26163ea2-2882-4487-a9c1-2f83ec83d435","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-01 04:15:26.370709+00	
00000000-0000-0000-0000-000000000000	79af1a65-e796-48c5-9d4b-e570aeeac427	{"action":"token_revoked","actor_id":"26163ea2-2882-4487-a9c1-2f83ec83d435","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-01 04:15:26.403125+00	
00000000-0000-0000-0000-000000000000	9d13dc44-045f-43e6-bc7d-7e04183238f8	{"action":"token_refreshed","actor_id":"26163ea2-2882-4487-a9c1-2f83ec83d435","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-01 05:24:31.634126+00	
00000000-0000-0000-0000-000000000000	0b483206-cbf7-4a3e-a3ee-b1a54a301f88	{"action":"token_revoked","actor_id":"26163ea2-2882-4487-a9c1-2f83ec83d435","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-01 05:24:31.662538+00	
00000000-0000-0000-0000-000000000000	27bc4e80-d603-4c1c-8de5-3c7be88b8484	{"action":"user_recovery_requested","actor_id":"26163ea2-2882-4487-a9c1-2f83ec83d435","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-01 05:44:31.497021+00	
00000000-0000-0000-0000-000000000000	6f46c8ce-a38f-44f0-9e5e-4a463b8ce062	{"action":"login","actor_id":"26163ea2-2882-4487-a9c1-2f83ec83d435","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-01 05:44:46.803268+00	
00000000-0000-0000-0000-000000000000	c6ebbf32-8a08-47ce-bda8-2c0a20613e1f	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"shaik173khaja@gmail.com","user_id":"26163ea2-2882-4487-a9c1-2f83ec83d435","user_phone":""}}	2025-09-01 05:45:30.587835+00	
00000000-0000-0000-0000-000000000000	26532388-f5dc-46b6-80ef-266956618b16	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"shaik173khaja@gmail.com","user_id":"bda8c4d3-f38a-4bde-82ff-261503c8aeef","user_phone":""}}	2025-09-01 05:46:21.849029+00	
00000000-0000-0000-0000-000000000000	0efe4756-2cd3-4e96-8de0-fa7121ce39d9	{"action":"user_recovery_requested","actor_id":"bda8c4d3-f38a-4bde-82ff-261503c8aeef","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-01 05:54:28.961518+00	
00000000-0000-0000-0000-000000000000	a9d25cbe-1154-4dc5-a922-c046baf1ebf4	{"action":"login","actor_id":"bda8c4d3-f38a-4bde-82ff-261503c8aeef","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-01 05:54:48.67216+00	
00000000-0000-0000-0000-000000000000	b307ebcb-29f1-47f0-9c9f-0ae2b2d20880	{"action":"user_recovery_requested","actor_id":"bda8c4d3-f38a-4bde-82ff-261503c8aeef","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-01 05:59:03.917642+00	
00000000-0000-0000-0000-000000000000	dd909d81-8ece-4fb6-98de-dc88ca48a4fa	{"action":"user_recovery_requested","actor_id":"bda8c4d3-f38a-4bde-82ff-261503c8aeef","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-01 13:16:25.625404+00	
00000000-0000-0000-0000-000000000000	3ce4af23-798b-4334-9f9c-369f5db2bf64	{"action":"login","actor_id":"bda8c4d3-f38a-4bde-82ff-261503c8aeef","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-01 13:16:50.405609+00	
00000000-0000-0000-0000-000000000000	d8f66772-2749-49c9-8a79-bda0c88c0c79	{"action":"user_recovery_requested","actor_id":"bda8c4d3-f38a-4bde-82ff-261503c8aeef","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-01 13:20:23.728282+00	
00000000-0000-0000-0000-000000000000	5c0161c1-719f-4065-9d53-e966c936b9ea	{"action":"login","actor_id":"bda8c4d3-f38a-4bde-82ff-261503c8aeef","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-01 13:20:38.058172+00	
00000000-0000-0000-0000-000000000000	6dc2a1f1-8f1f-4c63-a91c-4566370de46b	{"action":"user_signedup","actor_id":"3d22ddde-535b-48f5-ac15-d978d821f84b","actor_username":"shaik173kkhaja@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-01 13:25:05.992649+00	
00000000-0000-0000-0000-000000000000	3018a298-9880-49b6-8762-b7b856914f5a	{"action":"login","actor_id":"3d22ddde-535b-48f5-ac15-d978d821f84b","actor_username":"shaik173kkhaja@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-01 13:25:06.000352+00	
00000000-0000-0000-0000-000000000000	8f997066-a2d7-4f4a-b377-1766816ce1c2	{"action":"user_recovery_requested","actor_id":"3d22ddde-535b-48f5-ac15-d978d821f84b","actor_username":"shaik173kkhaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-01 13:25:06.060253+00	
00000000-0000-0000-0000-000000000000	c133b5d1-c5af-4a3d-ac33-e908d458c55c	{"action":"user_recovery_requested","actor_id":"bda8c4d3-f38a-4bde-82ff-261503c8aeef","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-01 13:26:33.749563+00	
00000000-0000-0000-0000-000000000000	a0991535-0fa0-4afa-a789-01f6232efad7	{"action":"login","actor_id":"bda8c4d3-f38a-4bde-82ff-261503c8aeef","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-01 13:26:40.973225+00	
00000000-0000-0000-0000-000000000000	3f6ec7e6-4696-40a7-b0c7-36459729f84d	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"shaik173khaja@gmail.com","user_id":"bda8c4d3-f38a-4bde-82ff-261503c8aeef","user_phone":""}}	2025-09-01 13:31:54.565024+00	
00000000-0000-0000-0000-000000000000	4e16fa00-b9d8-498b-8696-9cb48cdff77d	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"shaik173kkhaja@gmail.com","user_id":"3d22ddde-535b-48f5-ac15-d978d821f84b","user_phone":""}}	2025-09-01 13:31:54.564809+00	
00000000-0000-0000-0000-000000000000	81a5ab18-d70e-442f-b44c-0a98de70735f	{"action":"user_signedup","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-01 13:32:03.415591+00	
00000000-0000-0000-0000-000000000000	8fbbe3b7-4ec7-4de2-9723-0cadf40f9984	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-01 13:32:03.425065+00	
00000000-0000-0000-0000-000000000000	01189fdb-de24-4b5d-84ba-c6c787447221	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-01 13:32:03.443662+00	
00000000-0000-0000-0000-000000000000	04e9f8d5-cdc7-4d84-9753-abd679ace378	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-01 13:32:48.405015+00	
00000000-0000-0000-0000-000000000000	3190635f-075f-4849-b16b-181f74cbfe78	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-01 13:34:14.867179+00	
00000000-0000-0000-0000-000000000000	794277b8-9b59-4d6f-93d6-f9e103cb7f32	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-01 13:34:27.006286+00	
00000000-0000-0000-0000-000000000000	63396102-4933-4810-8f88-9e80ad8670c5	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-01 13:46:55.140129+00	
00000000-0000-0000-0000-000000000000	06efc465-ea22-4d3f-aac2-56048d3aa644	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-01 13:47:05.337263+00	
00000000-0000-0000-0000-000000000000	82823956-8978-4446-bd46-6a624269d11e	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-01 13:56:17.133354+00	
00000000-0000-0000-0000-000000000000	f385f80e-9d44-4940-9b6b-d8f6720b8bdf	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-01 13:56:29.812469+00	
00000000-0000-0000-0000-000000000000	1e94bfcc-d394-472f-b342-c89ab1bc1260	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-01 14:03:04.193095+00	
00000000-0000-0000-0000-000000000000	cd9650f7-5221-43ef-b241-23b6d5076d43	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-01 14:03:28.097075+00	
00000000-0000-0000-0000-000000000000	c1031fb0-0818-4400-903d-88b11c63d7b3	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-02 01:37:53.791517+00	
00000000-0000-0000-0000-000000000000	af4109da-f89b-40c0-8090-018510e6f4c0	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-02 01:38:06.527692+00	
00000000-0000-0000-0000-000000000000	56475cb8-1065-4d8b-aaf7-11e7d2365948	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-02 01:48:53.299306+00	
00000000-0000-0000-0000-000000000000	aec98044-9bff-4cd5-8e29-fe101311f91e	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-02 01:49:02.424476+00	
00000000-0000-0000-0000-000000000000	4b6c9a4b-f77b-4be4-ade0-97b4b7d718c0	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-02 01:55:07.493851+00	
00000000-0000-0000-0000-000000000000	790abd70-1fad-4d7b-92d9-ed2ac34d0a80	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-02 01:55:19.141153+00	
00000000-0000-0000-0000-000000000000	b7b9d5fe-c6ba-4ca3-adea-9b5724c92d3a	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"magiclink"}}	2025-09-02 01:55:19.600983+00	
00000000-0000-0000-0000-000000000000	c2fcccea-828e-4438-941f-99e6079b9fe1	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-02 02:04:52.550754+00	
00000000-0000-0000-0000-000000000000	eb80c083-6fd8-4e99-b03a-9fea8667f2bd	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-02 02:05:00.051519+00	
00000000-0000-0000-0000-000000000000	4c4fd589-c7b1-48a2-ae49-a8094d154f36	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-02 03:03:06.95792+00	
00000000-0000-0000-0000-000000000000	e0d5af16-3a4d-4670-9df3-381b074caae6	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-02 03:03:06.97883+00	
00000000-0000-0000-0000-000000000000	6424c067-ec6d-49d5-b606-bf2c9b18250a	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-02 04:07:55.406031+00	
00000000-0000-0000-0000-000000000000	a4cf89b4-0192-4739-8c01-fbb00039e70d	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-02 04:07:55.430683+00	
00000000-0000-0000-0000-000000000000	47359d85-b313-4ba2-8ba4-9629c59feb39	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-02 05:26:36.799449+00	
00000000-0000-0000-0000-000000000000	70985b9b-5ddd-4bb0-9820-dbcfcd0923a0	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-02 05:26:36.811208+00	
00000000-0000-0000-0000-000000000000	3237b2b4-5df0-426d-92ea-7415617e2f7e	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-02 06:24:46.856982+00	
00000000-0000-0000-0000-000000000000	edbb4486-7dd1-410b-8dff-0c4c6d10042a	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-02 06:24:46.88614+00	
00000000-0000-0000-0000-000000000000	e3b35512-0454-45ba-9e38-290c58ad121e	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-02 07:23:13.674151+00	
00000000-0000-0000-0000-000000000000	747242a5-bd80-4408-b96c-0e07a6c30e96	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-02 07:23:13.690097+00	
00000000-0000-0000-0000-000000000000	41f22f7b-07a1-447f-97d8-03d5758d9531	{"action":"logout","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-02 07:41:16.539024+00	
00000000-0000-0000-0000-000000000000	0f3fd6df-1bb9-4857-a54e-8bc4a82fbd9b	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-02 09:10:58.326586+00	
00000000-0000-0000-0000-000000000000	f057a348-b25e-4c24-887e-dddeb21dbacd	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-02 09:11:08.979809+00	
00000000-0000-0000-0000-000000000000	0be0ced3-f7d4-4fb8-9d54-2cb6d256efc1	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-02 09:18:40.575267+00	
00000000-0000-0000-0000-000000000000	80fa8b25-4d08-4dca-ab64-ab6ede482663	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-02 09:18:50.330673+00	
00000000-0000-0000-0000-000000000000	c0e4c47d-8882-4391-ba72-728803617822	{"action":"logout","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-02 09:19:06.017556+00	
00000000-0000-0000-0000-000000000000	4277593f-4e56-432c-83a3-7d540e22075d	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-02 09:19:54.815784+00	
00000000-0000-0000-0000-000000000000	742717c2-7e49-4edc-989c-59fd54303683	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-02 09:20:06.391425+00	
00000000-0000-0000-0000-000000000000	527d389a-6277-4602-a86c-5f00f53c1137	{"action":"logout","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-02 09:21:01.588302+00	
00000000-0000-0000-0000-000000000000	5794a09f-f214-4bcd-ab65-27d8708d20cd	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-02 09:26:36.261477+00	
00000000-0000-0000-0000-000000000000	4508fc33-55ee-467c-a777-c5a29784a609	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-02 09:26:48.027586+00	
00000000-0000-0000-0000-000000000000	1062a635-a3a5-44aa-9a04-48cfa176ae48	{"action":"logout","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-02 09:48:00.760735+00	
00000000-0000-0000-0000-000000000000	26654ea5-1f03-4eea-891c-be9a875398d1	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-02 09:48:11.173027+00	
00000000-0000-0000-0000-000000000000	da9d85d6-72d6-4d0a-b49f-34e243914862	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-02 09:48:21.425021+00	
00000000-0000-0000-0000-000000000000	1c4e783f-6498-48a0-8648-922762ed0530	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-02 10:51:01.774823+00	
00000000-0000-0000-0000-000000000000	0a12c19e-a359-4ed4-9f5a-1a76a7870421	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-02 10:51:01.789868+00	
00000000-0000-0000-0000-000000000000	13460375-3ee1-4d49-992d-a1e7f0db5e2d	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-02 12:03:06.099854+00	
00000000-0000-0000-0000-000000000000	0fba4a29-0622-4366-a1ad-a36714588c18	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-02 12:03:06.12895+00	
00000000-0000-0000-0000-000000000000	d0d6da2f-33c2-41f1-8e12-30e629eefa9c	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-02 13:04:52.398653+00	
00000000-0000-0000-0000-000000000000	f3a24e3e-57ae-4628-bb9a-8c489147a341	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-02 13:04:52.41122+00	
00000000-0000-0000-0000-000000000000	6ffc9921-7709-41d8-9810-3d25d833ecac	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-02 14:03:10.184361+00	
00000000-0000-0000-0000-000000000000	368bdb3b-0683-4443-b6cc-b841480f883f	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-02 14:03:10.201901+00	
00000000-0000-0000-0000-000000000000	872caf76-94d9-4d2f-86fc-689d3cf144ec	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-02 15:25:41.239106+00	
00000000-0000-0000-0000-000000000000	7c718006-c9c8-4839-83a2-a0b38dc3e9ac	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-02 15:25:41.261636+00	
00000000-0000-0000-0000-000000000000	f3d835a2-c89f-4487-a301-b373f7a10b59	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 04:58:58.77235+00	
00000000-0000-0000-0000-000000000000	b483cc66-b113-4cd0-a877-d61c30b36a80	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 04:58:58.802381+00	
00000000-0000-0000-0000-000000000000	38bc9d70-a897-4fd1-84ba-b53aaef01745	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 05:57:23.568317+00	
00000000-0000-0000-0000-000000000000	7d30fd26-5cb8-485c-ac97-1645c1948ea1	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 05:57:23.58786+00	
00000000-0000-0000-0000-000000000000	7e7a2377-abbf-4960-96af-8c32167db97e	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 06:55:49.770944+00	
00000000-0000-0000-0000-000000000000	8c5c16da-c28e-4df9-89e2-76aa07d02bd7	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 06:55:49.781258+00	
00000000-0000-0000-0000-000000000000	c971f687-1619-46a9-828f-540ec0daab81	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 07:54:19.47234+00	
00000000-0000-0000-0000-000000000000	53048881-1bdd-4446-8a28-b09b8dae802c	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 07:54:19.499947+00	
00000000-0000-0000-0000-000000000000	13a3a08c-8b0f-4215-9504-e41264d45817	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-04 12:13:39.731868+00	
00000000-0000-0000-0000-000000000000	1b367eb2-d584-4d50-9f24-d54b4bb590a7	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-04 12:13:39.762037+00	
00000000-0000-0000-0000-000000000000	07b066dc-e9f2-4daa-898c-27dc835daea0	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-04 12:13:40.634812+00	
00000000-0000-0000-0000-000000000000	bee7f0d9-18d4-4169-8b95-155619fdc44d	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-04 12:13:40.747461+00	
00000000-0000-0000-0000-000000000000	ff5b9a72-5efc-4188-a9f1-0ab381f1071a	{"action":"logout","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-04 12:30:44.753667+00	
00000000-0000-0000-0000-000000000000	c62e2275-b914-4933-9c51-9d3fd5de9e02	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-04 14:11:21.709843+00	
00000000-0000-0000-0000-000000000000	13726c82-23f2-4348-873e-6482aadc5e9f	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-04 14:11:35.59797+00	
00000000-0000-0000-0000-000000000000	4a20ed41-7f49-4994-b5b2-b97ae90e56ff	{"action":"logout","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-04 14:34:28.193414+00	
00000000-0000-0000-0000-000000000000	7b1736a7-593c-4bb8-b00e-46ad347cfaa1	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-04 14:49:42.076934+00	
00000000-0000-0000-0000-000000000000	0ca314dc-9be6-4ae9-ade3-bdf687d6fe77	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-04 14:49:58.5338+00	
00000000-0000-0000-0000-000000000000	3b6fcfb5-fc0b-4050-977b-1555aa30bf66	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 13:46:08.370851+00	
00000000-0000-0000-0000-000000000000	a4057431-fb1c-4ba0-a329-cb52950072d3	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 13:46:08.405324+00	
00000000-0000-0000-0000-000000000000	32de6700-c095-428a-8b15-e0fccd225ffb	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 14:47:52.429726+00	
00000000-0000-0000-0000-000000000000	2784477d-9b30-4884-a2e1-a24c4fb78475	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 14:47:52.446537+00	
00000000-0000-0000-0000-000000000000	51a13e5c-d0f4-469f-9526-653ff92d6d0b	{"action":"logout","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-05 14:48:07.677836+00	
00000000-0000-0000-0000-000000000000	0fe2b736-7f7e-4d73-84f3-51276511f841	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-05 14:52:18.122387+00	
00000000-0000-0000-0000-000000000000	7bfa3f27-47cb-4c6b-8310-968c46c871c7	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-05 14:52:30.992618+00	
00000000-0000-0000-0000-000000000000	04c129b1-625f-4ac1-9053-873f7328acab	{"action":"logout","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-05 14:57:36.425356+00	
00000000-0000-0000-0000-000000000000	5733c463-a65e-4a14-8fb7-ba5855fa7e14	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-05 14:57:44.742331+00	
00000000-0000-0000-0000-000000000000	41cc201c-dd5f-48b8-83b1-c049d3ecc6bf	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-05 14:57:55.095732+00	
00000000-0000-0000-0000-000000000000	2f2fb752-95e3-4aa4-addb-6591b3c05fd0	{"action":"logout","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-05 15:13:02.991325+00	
00000000-0000-0000-0000-000000000000	f8a23495-4ef3-49fb-b86b-56296fcfeffb	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-05 15:13:15.976865+00	
00000000-0000-0000-0000-000000000000	e9026ac0-dd91-4307-8178-aca7ce298826	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-05 15:13:28.178296+00	
00000000-0000-0000-0000-000000000000	2f86b1e9-80ce-4f97-b20b-6deb00df1d81	{"action":"logout","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-05 15:20:57.475089+00	
00000000-0000-0000-0000-000000000000	6744a4e6-8bd5-4d5d-b5b3-303345540664	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-05 15:21:12.701532+00	
00000000-0000-0000-0000-000000000000	d9c9794a-47d4-4a90-a7d0-6d5592e851b0	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-05 15:21:24.075416+00	
00000000-0000-0000-0000-000000000000	f5d72ed7-e323-44d3-861c-3b239a2557b7	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 23:43:59.093002+00	
00000000-0000-0000-0000-000000000000	8325d2b0-b1e3-473c-9b9b-360ec01e6238	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 23:43:59.118401+00	
00000000-0000-0000-0000-000000000000	9c0860e7-31c9-44c9-a32b-c07ee394a8ba	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 00:42:05.825079+00	
00000000-0000-0000-0000-000000000000	90bb6b9d-a4a0-4304-82ea-2a6bb81a49ca	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 00:42:05.853788+00	
00000000-0000-0000-0000-000000000000	134fc008-ff75-4ea0-9ec3-fac12de6ef93	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 01:40:32.979034+00	
00000000-0000-0000-0000-000000000000	640da8ea-7ed9-41df-ab0d-31ff3bd6ef64	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 01:40:33.002747+00	
00000000-0000-0000-0000-000000000000	f9090721-8f24-4c84-9612-9850c3ef5e92	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 03:49:32.204043+00	
00000000-0000-0000-0000-000000000000	79cea66c-9a3f-415e-b482-524b4c3ab932	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 03:49:32.234482+00	
00000000-0000-0000-0000-000000000000	d252e664-7e8d-4adf-954b-89b9bc005a2b	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 04:52:42.087686+00	
00000000-0000-0000-0000-000000000000	f9bb45bd-0123-4a57-bd7e-b2e5d586e6c7	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 04:52:42.105847+00	
00000000-0000-0000-0000-000000000000	bb860632-494c-43f5-89f0-428cf3fdfe7a	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 05:55:42.790343+00	
00000000-0000-0000-0000-000000000000	17a57045-16ed-449c-b208-197d3094ea7c	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 05:55:42.809431+00	
00000000-0000-0000-0000-000000000000	291ee70d-9997-44e6-a942-476c86bbf9a7	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 06:56:14.083769+00	
00000000-0000-0000-0000-000000000000	09056256-8779-4a8d-9aea-60ed44da4b89	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 06:56:14.117271+00	
00000000-0000-0000-0000-000000000000	01df9a35-5e2f-4fc3-bb37-9bee85c2b682	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 07:57:27.601588+00	
00000000-0000-0000-0000-000000000000	89dedd77-22a1-4c5e-8409-189faa08ae13	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 07:57:27.626498+00	
00000000-0000-0000-0000-000000000000	06d308ec-b927-4388-b621-d481953f18ed	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 08:58:47.030989+00	
00000000-0000-0000-0000-000000000000	3e84ec7a-ac1b-483a-844b-2d934bf54d6e	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 08:58:47.05495+00	
00000000-0000-0000-0000-000000000000	c484c5f6-da82-4070-a663-8ac6012e9d99	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 10:00:08.169771+00	
00000000-0000-0000-0000-000000000000	17905092-5ec6-4bc2-9bf0-0b5ed7ee429e	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 10:00:08.18802+00	
00000000-0000-0000-0000-000000000000	f4515a96-892a-4429-94bb-6dbdfedb9202	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 11:28:44.942936+00	
00000000-0000-0000-0000-000000000000	e3247df4-0774-4fd5-9ecd-e33bbd1c9288	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 11:28:44.963453+00	
00000000-0000-0000-0000-000000000000	62ab773b-952f-4ab4-8c2d-8bd1de316876	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 12:28:00.194637+00	
00000000-0000-0000-0000-000000000000	17a98bd1-f87b-4bee-96e7-38f1c9a31e96	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 12:28:00.211412+00	
00000000-0000-0000-0000-000000000000	49c0ac17-69b5-4b26-a3db-369bd46d65c3	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 13:33:34.44499+00	
00000000-0000-0000-0000-000000000000	aa76bfb3-9917-464d-b38f-f44fde00cd10	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 13:33:34.467266+00	
00000000-0000-0000-0000-000000000000	7292b49c-355c-4202-936d-5048a33f3a5d	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-06 13:41:01.605493+00	
00000000-0000-0000-0000-000000000000	981dc868-65a4-42c9-a3c4-9dc829794ace	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-06 13:41:10.509037+00	
00000000-0000-0000-0000-000000000000	cf2f7b7c-6173-4fcb-b745-39cbc7f48c6e	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 14:32:43.988684+00	
00000000-0000-0000-0000-000000000000	98d36dea-ffc1-4709-be25-b5cce4090b4c	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 14:32:44.020031+00	
00000000-0000-0000-0000-000000000000	0aea309d-d715-4bb5-8a91-8599858ab0f8	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 15:31:20.450488+00	
00000000-0000-0000-0000-000000000000	9b911c99-e0f3-4a12-a586-47ffdf8c5ba5	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 15:31:20.479288+00	
00000000-0000-0000-0000-000000000000	542a77c1-a93a-4495-b00d-261ea725e9ec	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 16:30:00.167975+00	
00000000-0000-0000-0000-000000000000	3d86723e-788d-473b-908e-2b7f4fc30965	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 16:30:00.221841+00	
00000000-0000-0000-0000-000000000000	a6e4c14d-b96f-4ba3-85a1-c79c3f4aaaa5	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 17:28:44.642822+00	
00000000-0000-0000-0000-000000000000	e122f64c-8cac-4232-877a-79c0d49e3560	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 17:28:44.667464+00	
00000000-0000-0000-0000-000000000000	12cd0001-24b5-4dc7-8221-c379cc7e955c	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 18:27:25.384615+00	
00000000-0000-0000-0000-000000000000	17d5e3a7-acdb-4732-88d9-d2ea68a38fe1	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 18:27:25.404058+00	
00000000-0000-0000-0000-000000000000	691aab69-47ef-4bb5-8a2a-9819f71072ab	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 19:25:59.489343+00	
00000000-0000-0000-0000-000000000000	93342005-1e86-468d-b6f2-188348f5dfd6	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 19:25:59.514591+00	
00000000-0000-0000-0000-000000000000	96ced3ef-15e0-462e-b75c-63645556c420	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 20:24:36.537406+00	
00000000-0000-0000-0000-000000000000	4b07c076-b5da-4295-ad44-c8dcbd60ec99	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 20:24:36.564383+00	
00000000-0000-0000-0000-000000000000	a856af3d-8447-4814-bf2d-f45bd74949e9	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 21:23:20.640671+00	
00000000-0000-0000-0000-000000000000	8a71f436-5ba3-49d9-8b9c-7655f9442138	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 21:23:20.669013+00	
00000000-0000-0000-0000-000000000000	f4ffbb47-cb1a-4769-8950-631738cf03a7	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 22:21:59.517717+00	
00000000-0000-0000-0000-000000000000	d82c29d6-a568-42ca-9585-ae788b28bc37	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 22:21:59.545805+00	
00000000-0000-0000-0000-000000000000	e45eefe0-c525-4cb1-a372-7421839ebc6e	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 23:20:40.378626+00	
00000000-0000-0000-0000-000000000000	c294f22a-3228-421c-b487-194f1f9bf1e8	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 23:20:40.406599+00	
00000000-0000-0000-0000-000000000000	f2c3d0af-dc79-4228-9fef-c9eb2ed45f30	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 00:19:14.774565+00	
00000000-0000-0000-0000-000000000000	af46b85d-e72f-4fff-afd6-4289843e42f0	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 00:19:14.798919+00	
00000000-0000-0000-0000-000000000000	2ec1622a-094c-4181-be4e-48c4816f26cc	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 01:17:56.538959+00	
00000000-0000-0000-0000-000000000000	19a7f13a-6305-4227-adf7-291d62ff80da	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 01:17:56.568895+00	
00000000-0000-0000-0000-000000000000	9bca0217-d96c-4968-8c27-82603e26593e	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 02:16:42.234232+00	
00000000-0000-0000-0000-000000000000	7a238a76-7999-4c96-b350-d9e9c41e2883	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 02:16:42.258861+00	
00000000-0000-0000-0000-000000000000	d59e5954-2cd4-43b1-9c6e-97c37c204ba2	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 03:15:28.57177+00	
00000000-0000-0000-0000-000000000000	7af0242a-ce94-4a70-ae02-e88908d0c18a	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 03:15:28.59933+00	
00000000-0000-0000-0000-000000000000	f2ab39a1-897a-41aa-a49f-f73782559878	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 05:16:55.928694+00	
00000000-0000-0000-0000-000000000000	7c73aed1-d2b2-496e-9f76-865a69332b5c	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 05:16:55.956219+00	
00000000-0000-0000-0000-000000000000	1c0a456b-9f59-4201-a6f0-a768b2e379ea	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 06:15:32.454334+00	
00000000-0000-0000-0000-000000000000	92c89d6b-712d-4077-8baa-8c8557029b70	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 06:15:32.478203+00	
00000000-0000-0000-0000-000000000000	362f1581-c120-4306-b523-610dd680a8f7	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 07:37:39.562223+00	
00000000-0000-0000-0000-000000000000	ddc880ec-9037-4dc2-9abf-9e37eeaa0551	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 07:37:39.587795+00	
00000000-0000-0000-0000-000000000000	bbb7842a-9609-4245-9110-e43f69b2b246	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 08:36:08.666281+00	
00000000-0000-0000-0000-000000000000	5d0c83bd-6fb5-4b76-9c16-6eeb09d9ceca	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 08:36:08.692599+00	
00000000-0000-0000-0000-000000000000	418e09c6-c24b-498e-b1b7-8cf976a8348f	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 09:43:15.057359+00	
00000000-0000-0000-0000-000000000000	93e5e0ec-aba8-47a8-8a76-62589fb02fd1	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 09:43:15.078175+00	
00000000-0000-0000-0000-000000000000	50acb87c-bdb9-4861-a7e3-45fedd0cea75	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 10:41:38.43709+00	
00000000-0000-0000-0000-000000000000	28afed7c-6cdd-4949-8aaa-756d1c3876c5	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 10:41:38.45158+00	
00000000-0000-0000-0000-000000000000	45df1c04-3296-4fa1-8fd3-a48af839e63a	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 11:40:09.169503+00	
00000000-0000-0000-0000-000000000000	8e3cf66b-ad91-428a-8f7a-3f6f8febfb98	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 11:40:09.184269+00	
00000000-0000-0000-0000-000000000000	f05bde8d-0417-49a8-a9dd-49c127262c55	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 12:38:18.947211+00	
00000000-0000-0000-0000-000000000000	7f583af4-a70a-44d9-99c9-f5bd0aa604ba	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 12:38:18.959577+00	
00000000-0000-0000-0000-000000000000	18773b48-0221-4f09-89b5-3595f801db3d	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 13:36:19.532766+00	
00000000-0000-0000-0000-000000000000	410bd94f-c769-450b-a134-49c7d2918cc8	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 13:36:19.549095+00	
00000000-0000-0000-0000-000000000000	f89ae818-759f-4423-959b-1d81b6f8696c	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 14:34:25.269594+00	
00000000-0000-0000-0000-000000000000	95bed35d-5794-4006-b34a-2f9aae7e3d11	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 14:34:25.291688+00	
00000000-0000-0000-0000-000000000000	a0cefeea-acab-458b-bfd2-d00910407fa0	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 15:33:06.702876+00	
00000000-0000-0000-0000-000000000000	b88d94bc-32ab-4ff7-93a2-8ddd34f9dec5	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 15:33:06.71812+00	
00000000-0000-0000-0000-000000000000	8eaf9b3b-e3d7-4262-9aa7-0095ffb7f284	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 01:51:02.137861+00	
00000000-0000-0000-0000-000000000000	08ffd1d3-61b3-4fb6-bceb-69816f197049	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 01:51:02.162733+00	
00000000-0000-0000-0000-000000000000	d1440e05-4ea3-47d8-867e-46e984d684a9	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 02:49:37.964212+00	
00000000-0000-0000-0000-000000000000	5d914070-dfef-430a-839b-613dccef76ca	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 02:49:37.981104+00	
00000000-0000-0000-0000-000000000000	db34e1d3-437d-4760-9fbd-be704f5c592e	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 03:47:45.311387+00	
00000000-0000-0000-0000-000000000000	2127b23c-8713-4a75-8891-cdb0be110d67	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 03:47:45.334175+00	
00000000-0000-0000-0000-000000000000	6e5b6889-a9de-4e4d-9894-de5e6f324060	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 04:46:23.286623+00	
00000000-0000-0000-0000-000000000000	146bf224-48e2-412d-b170-641dc9b480e7	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 04:46:23.305625+00	
00000000-0000-0000-0000-000000000000	3cc2bb15-d97f-48e7-909f-d2941f7f939e	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 05:45:22.389054+00	
00000000-0000-0000-0000-000000000000	765fe1c6-341f-4a48-9cea-89470adfe0c5	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 05:45:22.394647+00	
00000000-0000-0000-0000-000000000000	25c23443-2b0e-4c8d-98f4-a658cd86014c	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 06:43:23.041773+00	
00000000-0000-0000-0000-000000000000	deae2f8e-ca5a-41ab-bb53-a488590a95aa	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 06:43:23.067727+00	
00000000-0000-0000-0000-000000000000	5729a5de-10a4-4acb-aa4d-44e3216feb26	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 07:41:54.891486+00	
00000000-0000-0000-0000-000000000000	b9989ac3-eab6-4eb7-bff4-d30e554621f1	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 07:41:54.90575+00	
00000000-0000-0000-0000-000000000000	3ce295a3-0de2-4e45-9131-11993be0bdfd	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 08:40:11.715041+00	
00000000-0000-0000-0000-000000000000	07b9ad05-46f8-44ad-a75f-1a9ef8f2e6c9	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 08:40:11.730335+00	
00000000-0000-0000-0000-000000000000	bae88467-75d2-4c0a-846d-6123d3e2bf37	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 09:38:21.639226+00	
00000000-0000-0000-0000-000000000000	db0fbcfe-8a27-4b12-959c-d23fc47facea	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 09:38:21.65639+00	
00000000-0000-0000-0000-000000000000	c6d68760-f9c5-4549-91b8-1ebb0e6ae6d3	{"action":"logout","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-08 09:47:10.517896+00	
00000000-0000-0000-0000-000000000000	86653615-2ecc-445d-9406-6e20703a98e6	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-08 09:47:57.222572+00	
00000000-0000-0000-0000-000000000000	da06543e-9a83-4e99-86b1-738e6727f3ca	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-08 09:48:23.348654+00	
00000000-0000-0000-0000-000000000000	e812e7f1-18e1-4c62-9017-6568eb628095	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 10:47:22.409071+00	
00000000-0000-0000-0000-000000000000	6e635a35-ceea-4fda-934d-3a612e384d86	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 10:47:22.432266+00	
00000000-0000-0000-0000-000000000000	87ca4279-e339-474c-9e30-50b83f4d8a1d	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 11:45:43.522415+00	
00000000-0000-0000-0000-000000000000	16e06cb1-172b-4f00-908a-307d50c92a9f	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 11:45:43.536636+00	
00000000-0000-0000-0000-000000000000	7132d6b8-f67a-46c7-94b5-aae0d0b94ca9	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 12:43:58.125097+00	
00000000-0000-0000-0000-000000000000	6cb82d95-9d29-4367-9ac5-62a76f318a50	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 12:43:58.140407+00	
00000000-0000-0000-0000-000000000000	fee051fc-65f2-42ea-9ab5-d4e8af9e4339	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 13:42:20.062148+00	
00000000-0000-0000-0000-000000000000	711730c3-70f0-4c60-9dcd-1c9497dcb6ad	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 13:42:20.069737+00	
00000000-0000-0000-0000-000000000000	4c93eb28-d455-4e05-ab95-e965977b8912	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 14:41:22.071012+00	
00000000-0000-0000-0000-000000000000	f8418845-1048-4f02-83cf-d0656a992f75	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 14:41:22.09169+00	
00000000-0000-0000-0000-000000000000	12fc931c-5d67-49cb-9107-ce8dc9337f19	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 15:39:59.427517+00	
00000000-0000-0000-0000-000000000000	07aa97d3-176c-4054-9edf-bbedd9f0530a	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 15:39:59.447486+00	
00000000-0000-0000-0000-000000000000	91ce5e58-fb83-4aa1-844c-7eb41aff64f8	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 16:39:21.629343+00	
00000000-0000-0000-0000-000000000000	8040fdff-8c69-4f53-ae03-55f53e7bc95b	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 16:39:21.648934+00	
00000000-0000-0000-0000-000000000000	a2bb6a47-6012-48b2-99a2-2719737f470f	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 17:38:21.532741+00	
00000000-0000-0000-0000-000000000000	30b3e497-01a6-4e67-b04e-ed754404654a	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 17:38:21.549844+00	
00000000-0000-0000-0000-000000000000	6eceb36e-9ce4-47f4-8f19-d1e288b9f387	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 18:37:21.313051+00	
00000000-0000-0000-0000-000000000000	6c98d2b1-6ebb-45d6-9843-b6a0be26fa04	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 18:37:21.32122+00	
00000000-0000-0000-0000-000000000000	327c99df-7b90-49f7-aba1-0dca88ab9815	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 19:36:22.027524+00	
00000000-0000-0000-0000-000000000000	31fd2b0d-b610-47fd-aff1-0cc7e8da77b3	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 19:36:22.040783+00	
00000000-0000-0000-0000-000000000000	684ffc10-8820-4bfb-9676-8390cf9bde91	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 19:36:22.726979+00	
00000000-0000-0000-0000-000000000000	220fe5d4-9dc6-4ee1-a6ce-eb0eba13659b	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 20:35:00.148381+00	
00000000-0000-0000-0000-000000000000	6d5cad78-eaeb-41a3-8022-06b136c9587e	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 20:35:00.166344+00	
00000000-0000-0000-0000-000000000000	5866a436-4d17-4c60-be3f-214098809ae3	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 21:33:53.716137+00	
00000000-0000-0000-0000-000000000000	92418d4e-d3c3-480a-a676-934c0468c89a	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 21:33:53.734948+00	
00000000-0000-0000-0000-000000000000	4e19d753-f06d-4cdb-8fbd-83c1fba77c58	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 22:32:34.984959+00	
00000000-0000-0000-0000-000000000000	2ff4f0fd-4188-40c1-ade4-4149455c3619	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 22:32:35.001851+00	
00000000-0000-0000-0000-000000000000	ec9a977d-8f53-4440-8ae9-322837e23fff	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 23:31:24.908803+00	
00000000-0000-0000-0000-000000000000	7a73b38c-7cb2-415a-ab0a-0bf3979d9f4b	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 23:31:24.924222+00	
00000000-0000-0000-0000-000000000000	04e09422-8325-4f50-ac60-378eddb9c7b6	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 00:30:22.195041+00	
00000000-0000-0000-0000-000000000000	94114c4c-9e07-476d-8a12-25f538694070	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 00:30:22.213779+00	
00000000-0000-0000-0000-000000000000	1d39ce8d-6880-48ec-8c0f-d758b222837e	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 01:29:21.783632+00	
00000000-0000-0000-0000-000000000000	8c9a0552-3a1d-40e6-908c-a3a9361cb3b0	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 01:29:21.794477+00	
00000000-0000-0000-0000-000000000000	9616ae6a-9247-47cf-8417-25adefe15d8f	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 02:28:22.166993+00	
00000000-0000-0000-0000-000000000000	ab18630e-2bf5-413f-8123-40b5a3c37e58	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 02:28:22.184611+00	
00000000-0000-0000-0000-000000000000	c5c588f6-53b3-4dec-a4cf-396df28dcf3f	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 03:26:59.306725+00	
00000000-0000-0000-0000-000000000000	ab23c915-1833-428c-8465-b072b9c9f0bd	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 03:26:59.321234+00	
00000000-0000-0000-0000-000000000000	74306cd9-c50d-4456-90af-ac1cf37bd5d5	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 04:25:16.496784+00	
00000000-0000-0000-0000-000000000000	2af03926-f807-4100-836b-aa84455e7f74	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 04:25:16.516771+00	
00000000-0000-0000-0000-000000000000	f96f90c7-3595-49f4-b3dd-e73c1a6e6a90	{"action":"logout","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-09 04:58:10.826402+00	
00000000-0000-0000-0000-000000000000	5f848756-fba8-4676-bce2-2297dd3127cc	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-09 04:58:25.143474+00	
00000000-0000-0000-0000-000000000000	75eb0e18-64a7-4716-819d-c15b2c20fd29	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-09 04:58:39.186517+00	
00000000-0000-0000-0000-000000000000	e3eea1a2-3ce4-4b65-9fba-8f6b52e156e0	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 05:57:21.7578+00	
00000000-0000-0000-0000-000000000000	fff3acc9-eb0e-4dd0-a07c-c35de17c60c2	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 05:57:21.770609+00	
00000000-0000-0000-0000-000000000000	87551acd-ad23-4bed-a54e-98f26985ac51	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 06:56:21.728272+00	
00000000-0000-0000-0000-000000000000	bac66cdb-455a-4983-88c2-b857442bb8ba	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 06:56:21.747076+00	
00000000-0000-0000-0000-000000000000	1b5b053a-3bd6-4911-9a53-28b8536bbcb3	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 07:54:54.517307+00	
00000000-0000-0000-0000-000000000000	983be2ce-2848-465e-a168-da62951cd2bc	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 07:54:54.53757+00	
00000000-0000-0000-0000-000000000000	36702fe4-5a70-4527-91ab-8dc1a261e395	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 08:53:32.648126+00	
00000000-0000-0000-0000-000000000000	fe50ffab-edc0-44b1-8a3b-c44a7d324131	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 08:53:32.662507+00	
00000000-0000-0000-0000-000000000000	3a4cd352-50bb-45ed-b663-36b936fc0111	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 09:51:54.509507+00	
00000000-0000-0000-0000-000000000000	ca750007-184e-40a3-80d5-d31ef78c664c	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 09:51:54.527525+00	
00000000-0000-0000-0000-000000000000	7b59e2dc-b07e-4809-bd75-949d7ab7f991	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 10:49:55.713895+00	
00000000-0000-0000-0000-000000000000	09a01796-1b06-4136-b911-682c6992f08c	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 10:49:55.72978+00	
00000000-0000-0000-0000-000000000000	1edea5de-d169-405b-ad9e-a5102e63ecfa	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 11:48:48.434325+00	
00000000-0000-0000-0000-000000000000	a79da1e2-20e2-4ac0-9795-48f6c8b9326c	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 11:48:48.450462+00	
00000000-0000-0000-0000-000000000000	50193b6f-8263-4705-85e5-88b0ee5921db	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 12:47:03.032549+00	
00000000-0000-0000-0000-000000000000	c4f05249-6862-48b5-9804-6317e0d3d027	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 12:47:03.044337+00	
00000000-0000-0000-0000-000000000000	55918520-2860-462c-b4c9-f17951fda034	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 13:45:15.9837+00	
00000000-0000-0000-0000-000000000000	48d0d94c-215a-4cf3-996c-860d18a354d9	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 13:45:16.006049+00	
00000000-0000-0000-0000-000000000000	7281c63d-a78c-4d3d-a002-a563c2ab8154	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 14:43:46.605759+00	
00000000-0000-0000-0000-000000000000	c11ecec9-aeff-43cf-80cf-39f87d01a681	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 14:43:46.637838+00	
00000000-0000-0000-0000-000000000000	b970b627-04ee-4ea8-b940-39503d4d953f	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 15:42:17.138282+00	
00000000-0000-0000-0000-000000000000	8014c96a-4e0d-4340-b997-de42704123fd	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 15:42:17.169391+00	
00000000-0000-0000-0000-000000000000	b7acd72d-f9f9-457f-9aa0-76ef8282999d	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 16:40:47.499824+00	
00000000-0000-0000-0000-000000000000	7af20c52-cfc6-45d7-b7bb-d804b7aa9e35	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 16:40:47.527318+00	
00000000-0000-0000-0000-000000000000	825e63b5-a139-4fd6-aee3-b6500a8c999c	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 17:38:59.28875+00	
00000000-0000-0000-0000-000000000000	d40fd859-1fd7-429e-a8de-9bca308b45b6	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 17:38:59.304449+00	
00000000-0000-0000-0000-000000000000	20fa2dd7-d306-4050-a4f3-fd1a8a329525	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 18:37:30.86904+00	
00000000-0000-0000-0000-000000000000	470a7898-fdf8-4e04-9996-a1805999aad2	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 18:37:30.894304+00	
00000000-0000-0000-0000-000000000000	8e74712c-2aab-4450-bb7c-c681ccd73c72	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 19:36:02.900543+00	
00000000-0000-0000-0000-000000000000	3775dd6c-615f-4f86-99f9-5b0496002c68	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 19:36:02.915975+00	
00000000-0000-0000-0000-000000000000	929f7c4e-e1c1-428a-ba1c-ca1724ca38d6	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 20:34:47.119129+00	
00000000-0000-0000-0000-000000000000	a2ee5d91-188d-4d3c-8f17-057357260275	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 20:34:47.134873+00	
00000000-0000-0000-0000-000000000000	3ba924ae-49db-409e-a793-d7f46ddddcff	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 21:33:53.200417+00	
00000000-0000-0000-0000-000000000000	23993f17-5d4e-421d-84f7-97b1a7846ac5	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 21:33:53.22475+00	
00000000-0000-0000-0000-000000000000	dfbf7953-2a9d-4aa7-8774-cde253d9fcf8	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 22:32:27.37118+00	
00000000-0000-0000-0000-000000000000	3d740f42-a4ca-472f-bfa7-d64672089dd4	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 22:32:27.386732+00	
00000000-0000-0000-0000-000000000000	c25d407c-c650-4fd2-9fe6-eb559ec15da2	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 23:31:06.315803+00	
00000000-0000-0000-0000-000000000000	a2fba1c5-5290-4110-ada8-61a552c1e51d	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 23:31:06.335851+00	
00000000-0000-0000-0000-000000000000	b0bcaa5e-572c-4840-9146-0ad600203508	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 00:30:12.795781+00	
00000000-0000-0000-0000-000000000000	88796bb3-d92a-4da9-adce-ff8db88d242f	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 00:30:12.81432+00	
00000000-0000-0000-0000-000000000000	a7fa0561-c2ce-4829-acbd-620a68fbde1c	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 01:29:19.195597+00	
00000000-0000-0000-0000-000000000000	e7232242-1e5c-4860-8172-595850fe61f6	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 01:29:19.208566+00	
00000000-0000-0000-0000-000000000000	36021ee2-e43a-4290-bb47-09d4729985a0	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 02:28:25.68779+00	
00000000-0000-0000-0000-000000000000	71a59e46-1a43-4faa-9774-9687965d391d	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 02:28:25.710393+00	
00000000-0000-0000-0000-000000000000	035d9e1a-8ccb-4e3b-a80d-ba5ed674f6c8	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 03:26:57.098122+00	
00000000-0000-0000-0000-000000000000	1cbf3343-c4df-407f-bf04-2486be099caf	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 03:26:57.11899+00	
00000000-0000-0000-0000-000000000000	944a2cef-99d5-46f4-b7d8-efd74a48de3a	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 04:25:09.365725+00	
00000000-0000-0000-0000-000000000000	01ae8fdf-532d-4919-a895-5994027b0527	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 04:25:09.375718+00	
00000000-0000-0000-0000-000000000000	e793bf4c-73f7-4348-ab7d-1a8745ce2c0d	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 05:23:36.808538+00	
00000000-0000-0000-0000-000000000000	9f5a7927-851f-4ad5-ad8a-8ddd4a019ee1	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 05:23:36.820365+00	
00000000-0000-0000-0000-000000000000	c0c96760-4de9-49f7-8aae-c30bbcb8054f	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 06:21:57.823043+00	
00000000-0000-0000-0000-000000000000	f634685c-acb9-4285-99a2-c130a30b8fdd	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 06:21:57.831646+00	
00000000-0000-0000-0000-000000000000	0dd3c7e2-0b3b-49de-b123-0d2261774f32	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 07:20:27.508339+00	
00000000-0000-0000-0000-000000000000	3397c69e-45fa-4cd1-b281-8b949eab3850	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 07:20:27.523453+00	
00000000-0000-0000-0000-000000000000	9a06fcd4-a8a9-4dd2-baee-df7a9489b4f1	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 08:18:49.868921+00	
00000000-0000-0000-0000-000000000000	d235a150-ddff-4fab-9f32-c101ee42d831	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 08:18:49.887201+00	
00000000-0000-0000-0000-000000000000	aa5fdc8a-9890-402c-9ab1-dddf03ea0452	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 09:17:26.674464+00	
00000000-0000-0000-0000-000000000000	c9044f99-9f82-4169-ba9f-e3035f404b23	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 09:17:26.694248+00	
00000000-0000-0000-0000-000000000000	eff9ca41-f660-411f-85d8-099d100d45a9	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 10:16:26.722976+00	
00000000-0000-0000-0000-000000000000	dcefafb1-847d-4236-8d5b-3ed5a338171f	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 10:16:26.73505+00	
00000000-0000-0000-0000-000000000000	4df43e37-a983-4d0d-bae0-2e7866bf91e4	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 11:14:44.108784+00	
00000000-0000-0000-0000-000000000000	03e78939-dfe0-49b9-a185-f2e979126d8f	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 11:14:44.124791+00	
00000000-0000-0000-0000-000000000000	dc4dc046-abf1-4da4-9130-bb5da3db0a53	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 12:12:55.881851+00	
00000000-0000-0000-0000-000000000000	0db2b678-b510-4d98-8839-8d45516bf10e	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 12:12:55.895252+00	
00000000-0000-0000-0000-000000000000	d626c4ce-ddcb-4b67-9378-205e468b99bd	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 13:11:25.392959+00	
00000000-0000-0000-0000-000000000000	1e6fb32e-be12-4f4f-aa6c-5e11d9b3df41	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 13:11:25.41308+00	
00000000-0000-0000-0000-000000000000	70e14907-165c-4344-b474-1e262a675eb6	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 14:10:01.100361+00	
00000000-0000-0000-0000-000000000000	ccc205ca-0197-45d7-bf03-1e8baafa7c13	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 14:10:01.122729+00	
00000000-0000-0000-0000-000000000000	51ca551c-c347-438c-835e-b9151c030d74	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 15:08:37.25065+00	
00000000-0000-0000-0000-000000000000	d5baac7f-9b7f-4c62-b781-7ce791e898a3	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 15:08:37.264868+00	
00000000-0000-0000-0000-000000000000	fc44efb9-52b2-4e28-b90b-79070a8a1eeb	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 16:07:44.227083+00	
00000000-0000-0000-0000-000000000000	e917dd1c-6e11-47c4-9b18-621847884b05	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 16:07:44.240752+00	
00000000-0000-0000-0000-000000000000	faba14a8-4532-4672-a162-17360d9e54fc	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 17:06:50.239646+00	
00000000-0000-0000-0000-000000000000	e236a44d-5927-4ec7-b2d6-f64f33a9a481	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 17:06:50.250123+00	
00000000-0000-0000-0000-000000000000	6ab3546c-4382-4953-8550-d9de31b39ab2	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 18:05:57.322046+00	
00000000-0000-0000-0000-000000000000	ffdb79d6-acc1-4033-ade9-d22f62d0553f	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 18:05:57.342605+00	
00000000-0000-0000-0000-000000000000	cfbd9503-79ef-4b7b-978c-77c683ddf93e	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 19:05:03.461149+00	
00000000-0000-0000-0000-000000000000	49eefd95-5260-458f-868c-be4c93373df6	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 19:05:03.478265+00	
00000000-0000-0000-0000-000000000000	06b38ae2-fbaa-411e-b2f7-ba7cce4bd8ca	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 20:04:09.978267+00	
00000000-0000-0000-0000-000000000000	9d966122-c39f-4bc0-bb25-680833fd6402	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 20:04:09.995886+00	
00000000-0000-0000-0000-000000000000	892c9c0c-9a82-417b-b571-281b70e6dce1	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 21:03:16.573488+00	
00000000-0000-0000-0000-000000000000	1d0aa888-e8be-463a-b1e5-0aeae7244758	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 21:03:16.58939+00	
00000000-0000-0000-0000-000000000000	7810e5bd-f838-472a-9069-290bca6c5bd4	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 22:02:23.149997+00	
00000000-0000-0000-0000-000000000000	c08503c1-ee3a-4ffd-a3b5-03c935cef08c	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 22:02:23.169286+00	
00000000-0000-0000-0000-000000000000	bb02eba8-0484-4b91-b616-3b8eee8e7813	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 23:01:29.935898+00	
00000000-0000-0000-0000-000000000000	dfe41e40-ccd2-47ac-b3e4-25c87a2dfbae	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 23:01:29.948256+00	
00000000-0000-0000-0000-000000000000	34500125-511b-47cd-b4fa-07f72e0c1881	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 00:00:32.500603+00	
00000000-0000-0000-0000-000000000000	192f834d-df98-4671-b57f-10ef6225abe9	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 00:00:32.517574+00	
00000000-0000-0000-0000-000000000000	23fce34a-4c49-48bd-963a-5d1963815644	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 00:58:46.130805+00	
00000000-0000-0000-0000-000000000000	bd3e27a3-78d4-4209-bef9-35f995284c8f	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 00:58:46.144874+00	
00000000-0000-0000-0000-000000000000	74b4b06a-1c69-44d1-ad25-ba936dcd82f3	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 01:57:32.586372+00	
00000000-0000-0000-0000-000000000000	90991e5f-885e-4141-9516-cd2da7c832e4	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 01:57:32.600054+00	
00000000-0000-0000-0000-000000000000	9a5bfb50-8ae7-4462-add3-600767b6fc28	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 02:56:32.502319+00	
00000000-0000-0000-0000-000000000000	0423be99-cb73-43f4-8065-75e5ec773400	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 02:56:32.526414+00	
00000000-0000-0000-0000-000000000000	75d4bb0d-a100-4708-bce2-bc989155a73e	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 03:54:38.663382+00	
00000000-0000-0000-0000-000000000000	2840a995-2b14-4d4e-a741-097855f86bd4	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 03:54:38.686462+00	
00000000-0000-0000-0000-000000000000	43e7dd40-24a8-40ab-bcad-feff1f520275	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 04:52:51.538113+00	
00000000-0000-0000-0000-000000000000	1a17c9e0-620a-46e1-9bcb-88f207b49d54	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 04:52:51.564717+00	
00000000-0000-0000-0000-000000000000	8685af65-4f81-49ab-851b-e5768c591a6d	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 05:51:09.049086+00	
00000000-0000-0000-0000-000000000000	6acef107-14ca-4011-8d3c-0093a3dde991	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 05:51:09.068383+00	
00000000-0000-0000-0000-000000000000	97459b49-9bfb-428b-9714-1eba665f7c47	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 06:49:13.81943+00	
00000000-0000-0000-0000-000000000000	0d08ef61-e687-48c6-9f6d-459e40c7f689	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 06:49:13.84094+00	
00000000-0000-0000-0000-000000000000	bf72d795-3e60-4d74-be0c-aae3d5cd4f94	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 07:47:16.582428+00	
00000000-0000-0000-0000-000000000000	f77dee1a-be70-4355-a8de-9b233347bbc4	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 07:47:16.600788+00	
00000000-0000-0000-0000-000000000000	10cbf11a-5323-4e08-8458-733fd77d94cb	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 08:45:34.746964+00	
00000000-0000-0000-0000-000000000000	55497a90-9629-4254-9c6d-e44886df5d28	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 08:45:34.76475+00	
00000000-0000-0000-0000-000000000000	e53243be-35c6-4f76-b10f-2f3486d1fc5d	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 09:44:06.39247+00	
00000000-0000-0000-0000-000000000000	0f12f033-eed8-4ccc-9004-1892b52878ff	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 09:44:06.401893+00	
00000000-0000-0000-0000-000000000000	3abf5d54-332f-4b11-a4ca-03decd198dc0	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 10:42:55.496334+00	
00000000-0000-0000-0000-000000000000	2604f68d-a8c9-4589-8c7e-276cacca41f0	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 10:42:55.516107+00	
00000000-0000-0000-0000-000000000000	77b00fda-a6d6-4e56-a50f-419485a5e343	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 11:41:02.293035+00	
00000000-0000-0000-0000-000000000000	867fba8c-6236-4999-bf3a-d43adee1318d	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 11:41:02.312394+00	
00000000-0000-0000-0000-000000000000	ec375757-3541-4100-9f25-eb0fa65bb1fb	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 12:40:31.348416+00	
00000000-0000-0000-0000-000000000000	0e2eeb22-76c7-4f86-93c9-27865ebc2c63	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 12:40:31.369258+00	
00000000-0000-0000-0000-000000000000	571ff0a7-37d3-42b8-98fa-8e45f704d742	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 13:39:00.5536+00	
00000000-0000-0000-0000-000000000000	50618ecf-84a6-4114-82c2-dd25f4e22495	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 13:39:00.566627+00	
00000000-0000-0000-0000-000000000000	88b6106b-3853-4b6b-8804-ae6c0619a88d	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 14:37:31.389936+00	
00000000-0000-0000-0000-000000000000	7f9e75f5-dd59-4d57-8d6f-f4b21641bd93	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 14:37:31.408986+00	
00000000-0000-0000-0000-000000000000	138559d0-a21b-4e69-b15e-dda81a63da84	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 15:36:10.835604+00	
00000000-0000-0000-0000-000000000000	3a2935ec-1c34-43d8-b059-68a96d40db75	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 15:36:10.85392+00	
00000000-0000-0000-0000-000000000000	508a34be-8c17-4909-9a6c-a9f2ee6cfa92	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 16:34:45.969411+00	
00000000-0000-0000-0000-000000000000	4f1ad9e7-7377-47ee-9ced-0e04518c6402	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 16:34:45.985206+00	
00000000-0000-0000-0000-000000000000	dd1b229a-87cd-4f7d-a256-a4d4180e2e9d	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 17:33:52.838171+00	
00000000-0000-0000-0000-000000000000	290396ba-a765-4108-a71f-205975450b03	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 17:33:52.855446+00	
00000000-0000-0000-0000-000000000000	129c98ad-6e43-47ef-a6fc-efaac470d442	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 18:32:27.4378+00	
00000000-0000-0000-0000-000000000000	fc244f2c-64fd-41dc-8500-8f58d95e6a75	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 18:32:27.451496+00	
00000000-0000-0000-0000-000000000000	2450618b-ce8f-42e8-aa2d-aa6afae99fe5	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 19:31:06.585487+00	
00000000-0000-0000-0000-000000000000	30499ca1-cf38-41c7-9ef2-5f2f550d4112	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 19:31:06.601565+00	
00000000-0000-0000-0000-000000000000	93cad1c5-72af-4126-92a6-5b6241c174cb	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 20:30:13.835783+00	
00000000-0000-0000-0000-000000000000	32222474-8a8e-4ac6-a8e3-c6b793499780	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 20:30:13.855218+00	
00000000-0000-0000-0000-000000000000	edafc678-bbad-4cda-ae51-d2cccec0353b	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 21:29:20.604096+00	
00000000-0000-0000-0000-000000000000	11d7bcd4-4d67-4eda-abe2-e717d167e17d	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 21:29:20.616688+00	
00000000-0000-0000-0000-000000000000	a52f36f6-98a1-4cf1-8307-10574635f985	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 22:28:15.606566+00	
00000000-0000-0000-0000-000000000000	2d339004-b1e9-4b1f-8799-3ebd4b12ef89	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 22:28:15.619383+00	
00000000-0000-0000-0000-000000000000	ea67087e-b7de-4d06-b40b-ee4e1655e601	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 10:15:55.499343+00	
00000000-0000-0000-0000-000000000000	5a4a7e4d-34f9-456a-ba40-69d7ae1f2bf4	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 10:15:55.532842+00	
00000000-0000-0000-0000-000000000000	731abbab-d2b2-458b-922a-e131609e0ee2	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 11:13:59.591004+00	
00000000-0000-0000-0000-000000000000	0571b42f-4c93-4ac8-a0e4-6289fa3c666e	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 11:13:59.604637+00	
00000000-0000-0000-0000-000000000000	c2e03f07-557c-4ed0-a087-99138778592e	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 12:12:20.631476+00	
00000000-0000-0000-0000-000000000000	eac5da8a-eb2d-495f-8f08-e2851c90d900	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 12:12:20.642859+00	
00000000-0000-0000-0000-000000000000	c38cfb12-9f1a-4b0c-8376-847dcbd0bd1d	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 13:11:04.25986+00	
00000000-0000-0000-0000-000000000000	2e7a0aee-7ff4-4a68-980a-92efdafd7563	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 13:11:04.299118+00	
00000000-0000-0000-0000-000000000000	e439dd07-1460-4cd3-a577-63df4b2ddfa7	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 14:10:31.033132+00	
00000000-0000-0000-0000-000000000000	51a0a32d-61a4-4f72-86c1-bb646e675787	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 14:10:31.051283+00	
00000000-0000-0000-0000-000000000000	339178bc-1536-4285-bde5-bba61b69c727	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 15:09:30.780227+00	
00000000-0000-0000-0000-000000000000	940fb1ef-c565-421b-885a-0e4f35a54482	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 15:09:30.797046+00	
00000000-0000-0000-0000-000000000000	054ef0cf-577b-4f27-8c93-78af1d5fe0cd	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 16:08:30.28602+00	
00000000-0000-0000-0000-000000000000	6465c505-4395-403b-b1c3-588341d899c4	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 16:08:30.306369+00	
00000000-0000-0000-0000-000000000000	7cb42422-9c50-477f-949c-3265bf1f939b	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 17:07:30.473319+00	
00000000-0000-0000-0000-000000000000	af4a402e-3018-40a1-9865-d2ed75b2dd28	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 17:07:30.498034+00	
00000000-0000-0000-0000-000000000000	d114365a-7589-46b1-9845-0c2a69915da5	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 18:06:30.441762+00	
00000000-0000-0000-0000-000000000000	7d4441a7-60e8-424b-88df-af0dd1548d5f	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 18:06:30.466283+00	
00000000-0000-0000-0000-000000000000	963b7f2c-fbba-476a-b317-01e23cd4f45f	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 19:05:30.474076+00	
00000000-0000-0000-0000-000000000000	afb0b71f-7a78-4c2e-8109-548ec5057535	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 19:05:30.485998+00	
00000000-0000-0000-0000-000000000000	4a3acf6c-f29b-4307-b006-fea3b37ba0f1	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 20:04:30.418098+00	
00000000-0000-0000-0000-000000000000	dea94148-4e81-418a-a28e-cd2c9b19f8f5	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 20:04:30.432319+00	
00000000-0000-0000-0000-000000000000	22ab69ea-28ce-483a-a4be-90420a8c68d2	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 21:03:02.257096+00	
00000000-0000-0000-0000-000000000000	081452e1-f01f-4a18-b341-ac6959813681	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 21:03:02.273819+00	
00000000-0000-0000-0000-000000000000	d3d1ef81-16f0-455d-8da8-3e443ee6939f	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 22:01:33.899285+00	
00000000-0000-0000-0000-000000000000	7739f397-8b28-4d4b-a514-f8c0ad219f9e	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 22:01:33.922711+00	
00000000-0000-0000-0000-000000000000	adbdb182-cbb3-4432-b6aa-01e9a711a017	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 23:00:31.06055+00	
00000000-0000-0000-0000-000000000000	45168dc4-77dc-4286-95cf-016dfa87d868	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 23:00:31.069952+00	
00000000-0000-0000-0000-000000000000	9015a516-99a7-4214-b56c-d32e194381fb	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 23:59:31.086151+00	
00000000-0000-0000-0000-000000000000	5a67fb67-b4e0-417f-a34e-1b87d329c60a	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 23:59:31.108997+00	
00000000-0000-0000-0000-000000000000	bee354f1-7893-4454-88dc-b6321895c922	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 00:58:14.107294+00	
00000000-0000-0000-0000-000000000000	093901e5-4a22-4329-8d2d-dede1c15b3be	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 00:58:14.127816+00	
00000000-0000-0000-0000-000000000000	cf59b71b-a007-4ce7-8e9b-fc41dd739bdb	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 01:57:38.153123+00	
00000000-0000-0000-0000-000000000000	bdb6439c-80e0-4f9f-b849-61a169ef4d8c	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 01:57:38.173927+00	
00000000-0000-0000-0000-000000000000	46c2dc21-9e3d-454c-aa0a-cdc4a3da1909	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 02:56:09.303967+00	
00000000-0000-0000-0000-000000000000	b8631aab-d07f-4a91-9525-8d059b7e660e	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 02:56:09.320858+00	
00000000-0000-0000-0000-000000000000	12cdde76-fc85-4b08-b069-e5593e3325ca	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 03:54:36.410681+00	
00000000-0000-0000-0000-000000000000	19208ab1-8dc0-4899-9714-1d0d61ec1d06	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 03:54:36.428796+00	
00000000-0000-0000-0000-000000000000	dbd727f5-18d7-4361-9aa8-6acfc539115f	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 04:52:53.701028+00	
00000000-0000-0000-0000-000000000000	b70da0dc-1c58-4522-9c61-bfc027b892c1	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 04:52:53.721821+00	
00000000-0000-0000-0000-000000000000	7d1b1bc7-7469-447b-96e1-1c3e871fa4db	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 05:51:38.597964+00	
00000000-0000-0000-0000-000000000000	8e94b627-8b75-4918-9bd9-d1798627e59e	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 05:51:38.612901+00	
00000000-0000-0000-0000-000000000000	500505de-685c-405b-8948-1715db05e6ae	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 06:50:37.940865+00	
00000000-0000-0000-0000-000000000000	5b7f7127-fe68-4c52-a575-fa42038eaa3c	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 06:50:37.958312+00	
00000000-0000-0000-0000-000000000000	a1baece9-7f77-4caa-ad89-75971b80e459	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 07:48:41.87165+00	
00000000-0000-0000-0000-000000000000	5feecbdd-6a5c-45a9-830b-0e1acfe563f2	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 07:48:41.891982+00	
00000000-0000-0000-0000-000000000000	354c809c-163d-4a8e-a71d-7afeefbfb1d6	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 08:47:04.693681+00	
00000000-0000-0000-0000-000000000000	267179c4-8f9c-4cfb-91a7-73a012dd5d89	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 08:47:04.704311+00	
00000000-0000-0000-0000-000000000000	f8c6eba0-2d6b-4a04-a1a4-aba78bf64641	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 09:45:37.870023+00	
00000000-0000-0000-0000-000000000000	5032c06c-c77a-4b91-b6de-f496b8ae676f	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 09:45:37.894315+00	
00000000-0000-0000-0000-000000000000	7f41d1ae-83ef-46c1-b6d5-61c734dbfd50	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 10:43:48.267248+00	
00000000-0000-0000-0000-000000000000	7f3a68bb-62be-439f-a9e1-0ad2d1ac6f58	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 10:43:48.286929+00	
00000000-0000-0000-0000-000000000000	e7096873-102d-413f-a8e6-faa7da15f9fe	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 11:49:06.040633+00	
00000000-0000-0000-0000-000000000000	808b6670-863a-44dd-bd26-8147337bb489	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 11:49:06.070126+00	
00000000-0000-0000-0000-000000000000	5fb87384-a254-42a3-8c50-89334dcec86b	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 12:47:18.080163+00	
00000000-0000-0000-0000-000000000000	57877739-0c32-4ae6-ab8f-532328ece9a6	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 12:47:18.099348+00	
00000000-0000-0000-0000-000000000000	0cceccf7-48a6-4f59-aee4-b982cb0c7cf0	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 13:45:40.312247+00	
00000000-0000-0000-0000-000000000000	c6fef08b-7441-4bff-bdde-02c5ac09cd95	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 13:45:40.332841+00	
00000000-0000-0000-0000-000000000000	a3e43c07-e1f0-4546-8403-48e09f51b894	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 14:44:37.568976+00	
00000000-0000-0000-0000-000000000000	0d7072d2-fec2-4de2-8907-2adae73e6158	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 14:44:37.587003+00	
00000000-0000-0000-0000-000000000000	eba9ba03-0983-4845-bbac-32b2b48400cc	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 15:43:37.530278+00	
00000000-0000-0000-0000-000000000000	5844ab7b-e5c6-40bd-af92-8b39123eb25b	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 15:43:37.5478+00	
00000000-0000-0000-0000-000000000000	9eb663cb-f74f-4ebd-9384-458e8d394e45	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 16:42:37.62805+00	
00000000-0000-0000-0000-000000000000	af197ada-55c0-47e8-965c-fe2e478a066c	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 16:42:37.64749+00	
00000000-0000-0000-0000-000000000000	05f76701-39b6-4b3f-bf74-accedcf6543e	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 17:41:37.495649+00	
00000000-0000-0000-0000-000000000000	3a5943ad-3deb-4b31-87a1-1e39562626ef	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 17:41:37.517329+00	
00000000-0000-0000-0000-000000000000	fa7bec6e-4b6d-44fa-9684-26ff37b463be	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 18:40:38.010566+00	
00000000-0000-0000-0000-000000000000	a36c165f-0263-4089-9e51-eafa6669bfe9	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 18:40:38.030812+00	
00000000-0000-0000-0000-000000000000	f05b0d92-837c-42b6-b765-9641a9439051	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 19:39:38.042539+00	
00000000-0000-0000-0000-000000000000	7ed3b9ec-03a9-4924-a5a1-9471c3d962c9	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 19:39:38.061459+00	
00000000-0000-0000-0000-000000000000	61c33d8a-7660-4e6b-b08f-10512c713b48	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 20:38:38.029257+00	
00000000-0000-0000-0000-000000000000	79e491cd-72bd-4eac-b3ae-4fc02186b4f9	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 20:38:38.050831+00	
00000000-0000-0000-0000-000000000000	cbeec92e-b3aa-40f8-aad7-6355194bebd5	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 21:37:37.379993+00	
00000000-0000-0000-0000-000000000000	9626f41d-94cf-4746-84fc-1131676cba0c	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 21:37:37.402734+00	
00000000-0000-0000-0000-000000000000	822b5990-1710-402c-8977-30f770271e0c	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 22:36:37.450606+00	
00000000-0000-0000-0000-000000000000	1d6d511b-fe00-4e5f-9461-9600ce5043cd	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 22:36:37.467772+00	
00000000-0000-0000-0000-000000000000	8e78665b-00b3-415e-9f2c-d43434954a37	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 23:35:37.452135+00	
00000000-0000-0000-0000-000000000000	6d9d6354-119d-4400-98a4-9e1fd4af4e57	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 23:35:37.477039+00	
00000000-0000-0000-0000-000000000000	fd70e452-5d9b-4dde-a6c6-e787f21e352a	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 00:34:30.386475+00	
00000000-0000-0000-0000-000000000000	aeb5c965-24a1-4867-adf0-944ef4361ea5	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 00:34:30.40099+00	
00000000-0000-0000-0000-000000000000	4cb9e6df-f36b-483a-9328-d901d7f85d65	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 01:33:34.448119+00	
00000000-0000-0000-0000-000000000000	10dadd83-4785-4999-97c6-043e75fd8586	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 01:33:34.462363+00	
00000000-0000-0000-0000-000000000000	bf2b0106-f435-427d-8a9b-2ec22e51fe2a	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 02:32:14.843645+00	
00000000-0000-0000-0000-000000000000	43e83fcf-8e89-4fc8-a350-8d5bb5a7fc06	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 02:32:14.863991+00	
00000000-0000-0000-0000-000000000000	87ca910e-f440-4354-84f0-b49412d48dc1	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 03:31:37.882416+00	
00000000-0000-0000-0000-000000000000	a0c52df9-18dd-4675-81bb-44d686c9a951	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 03:31:37.902527+00	
00000000-0000-0000-0000-000000000000	8c5fc490-b764-4c5c-b201-642ba6744ed4	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 04:30:06.583139+00	
00000000-0000-0000-0000-000000000000	32f5ecc4-a814-4ec2-909b-355195f3edb3	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 04:30:06.598425+00	
00000000-0000-0000-0000-000000000000	5f24eb28-953b-401d-b563-b4062cd7d9d5	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 05:28:29.175207+00	
00000000-0000-0000-0000-000000000000	d7fced2d-5e24-4637-9510-875c879fd1bc	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 05:28:29.194782+00	
00000000-0000-0000-0000-000000000000	68bdf857-c5f6-495d-b711-40497f87aa86	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 06:27:36.988444+00	
00000000-0000-0000-0000-000000000000	1c6209aa-5d47-46e7-b1f4-4f7905f35ee1	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 06:27:37.012648+00	
00000000-0000-0000-0000-000000000000	e8bc5336-f67d-416a-a6c7-9c65a2694b86	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 07:26:37.39295+00	
00000000-0000-0000-0000-000000000000	f99ccc95-fcc7-4856-bcec-872b8af4d859	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 07:26:37.406852+00	
00000000-0000-0000-0000-000000000000	24185f8f-0a69-4385-954b-d006b3a32eb5	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 08:25:37.401679+00	
00000000-0000-0000-0000-000000000000	c9d4454a-66e7-4658-880e-abdb392050c9	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 08:25:37.423718+00	
00000000-0000-0000-0000-000000000000	551fea35-1d77-4ab8-8bb6-7d8ee1101864	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 09:24:37.012272+00	
00000000-0000-0000-0000-000000000000	8b37d4b8-1281-471f-bd23-2280dee2eabc	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 09:24:37.033284+00	
00000000-0000-0000-0000-000000000000	1a0fcdf2-f28d-4c49-820a-a2978c3c5251	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 10:37:53.882741+00	
00000000-0000-0000-0000-000000000000	f70229a1-5fff-4503-a8f7-952438c03853	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 10:37:53.909646+00	
00000000-0000-0000-0000-000000000000	b24f5fa0-eead-4a5c-bed0-d355798b8c4e	{"action":"logout","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-14 11:29:06.974644+00	
00000000-0000-0000-0000-000000000000	0ddae0f9-7517-4873-b080-c6d0a2ea10da	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-14 11:29:19.761014+00	
00000000-0000-0000-0000-000000000000	85f192cb-7234-41e3-a210-50521cc82d0e	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-14 11:29:59.206678+00	
00000000-0000-0000-0000-000000000000	4ee65a5d-2dc1-43b0-a4ae-e9413a3ab5e6	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 12:28:35.976498+00	
00000000-0000-0000-0000-000000000000	cca701ea-2d00-4c2a-ac73-a197f7050584	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 12:28:35.997143+00	
00000000-0000-0000-0000-000000000000	e783d2c7-8eef-442f-b995-35b9a7825a25	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 13:26:56.853118+00	
00000000-0000-0000-0000-000000000000	5272d78a-baa5-4060-b7f5-79c5cd1110cc	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 13:26:56.884845+00	
00000000-0000-0000-0000-000000000000	a62942c3-7042-4f5d-83d5-0044f9903cd3	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 14:25:18.595098+00	
00000000-0000-0000-0000-000000000000	87c3a6a9-5076-4f26-b3a1-2a01b7f04c54	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 14:25:18.612803+00	
00000000-0000-0000-0000-000000000000	69e2191c-4dd8-4210-aa51-8fa02152ccf1	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 15:23:45.071347+00	
00000000-0000-0000-0000-000000000000	539777c3-967c-4014-818c-480dbc53b261	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 15:23:45.102887+00	
00000000-0000-0000-0000-000000000000	b745072d-41f6-48b3-bc31-772010419b7e	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 16:22:36.69784+00	
00000000-0000-0000-0000-000000000000	a0cc9a42-d223-4a8a-a518-9c62db62a097	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 16:22:36.71749+00	
00000000-0000-0000-0000-000000000000	4b91924f-0bbd-4d4e-b98b-94fc591d2a89	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 17:21:36.462976+00	
00000000-0000-0000-0000-000000000000	db267ce0-0063-4249-bb48-93997fda4de9	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 17:21:36.480152+00	
00000000-0000-0000-0000-000000000000	d48b3890-e144-4dd6-9c69-d95e775da9b5	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 18:20:35.996875+00	
00000000-0000-0000-0000-000000000000	73d9530e-9358-4600-8042-6091785c5755	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 18:20:36.009333+00	
00000000-0000-0000-0000-000000000000	15eeffb7-0eae-4896-bf0e-b596996909e7	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 19:19:36.078848+00	
00000000-0000-0000-0000-000000000000	806a1408-62a3-4f94-87b9-2eaa2384e080	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 19:19:36.101037+00	
00000000-0000-0000-0000-000000000000	dc4ec8f3-50ef-45cf-91da-7a6391fb230e	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 20:18:35.977006+00	
00000000-0000-0000-0000-000000000000	2c768a29-32c7-4e26-8c3e-59d337ae0fcc	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 20:18:36.002851+00	
00000000-0000-0000-0000-000000000000	97e7ba45-0650-4fc8-8feb-110e3d70c628	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 21:17:35.949076+00	
00000000-0000-0000-0000-000000000000	aa87e4ad-69bd-46d7-a5e5-a45acf014cad	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 21:17:35.964777+00	
00000000-0000-0000-0000-000000000000	1eb22e95-86c9-4a68-b308-238bb2e9426d	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 22:16:35.822825+00	
00000000-0000-0000-0000-000000000000	58dfa833-9dd7-4a99-be64-8ba1073b2fa0	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 22:16:35.840304+00	
00000000-0000-0000-0000-000000000000	91ea7b4d-fced-41ce-9d03-0912f1d4bfec	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 23:15:22.134221+00	
00000000-0000-0000-0000-000000000000	10318859-62e7-48c5-98b5-fcec23686926	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 23:15:22.156784+00	
00000000-0000-0000-0000-000000000000	021d6f39-dcaa-4490-ab29-acac7293ea26	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 00:14:36.662815+00	
00000000-0000-0000-0000-000000000000	7d8a266a-4eb1-4c3d-b96b-083b05cd66e2	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 00:14:36.679916+00	
00000000-0000-0000-0000-000000000000	bdf5f96e-560c-4a1c-905e-d7251f14ac79	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 01:13:36.674713+00	
00000000-0000-0000-0000-000000000000	9658673c-c7ff-4e98-96db-7d4ad0914269	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 01:13:36.697889+00	
00000000-0000-0000-0000-000000000000	98c1b81b-64ce-4394-98c3-2f0a768a6c88	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 02:12:36.79338+00	
00000000-0000-0000-0000-000000000000	b1ad653b-10ed-41a8-8d3d-cf528e628d65	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 02:12:36.818259+00	
00000000-0000-0000-0000-000000000000	eb5aae2d-95e9-43f7-ad8e-68686c4bbfcc	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 03:11:04.967053+00	
00000000-0000-0000-0000-000000000000	27dcbbad-5959-4732-bbe7-144b10187b32	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 03:11:04.98425+00	
00000000-0000-0000-0000-000000000000	04e2d355-f8c9-4c74-ab88-8f7095f3eccc	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 04:09:30.113512+00	
00000000-0000-0000-0000-000000000000	370fe0a3-56ad-4a3d-965c-7046c6333b6c	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 04:09:30.133367+00	
00000000-0000-0000-0000-000000000000	f2fed0e6-5de6-4146-ad53-d529c256ba5d	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 05:07:31.515022+00	
00000000-0000-0000-0000-000000000000	5471a77c-9b0b-4e7f-addb-210f13fcb483	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 05:07:31.534091+00	
00000000-0000-0000-0000-000000000000	f7a909a6-4ea3-4c67-86a8-070011f9625a	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 06:06:36.486146+00	
00000000-0000-0000-0000-000000000000	205ecfa2-4f10-4205-8f8a-a7ff1e28833c	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 06:06:36.503686+00	
00000000-0000-0000-0000-000000000000	73ef98f3-8692-4cf9-bbe0-658d19803b9c	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 07:05:36.290772+00	
00000000-0000-0000-0000-000000000000	df961cad-4e1a-4f8b-810c-a2cd5f60c243	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 07:05:36.308715+00	
00000000-0000-0000-0000-000000000000	5dae2639-0f62-4819-8a57-fe9c310d2260	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 08:03:44.74463+00	
00000000-0000-0000-0000-000000000000	296cbb5b-c8a6-45ad-9be7-18bd930d753b	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 08:03:44.761828+00	
00000000-0000-0000-0000-000000000000	883381a8-0e05-4a1e-8052-a4b0c1641e1d	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 09:02:36.111769+00	
00000000-0000-0000-0000-000000000000	226fe7da-937b-4897-aeb6-8f362cc2989d	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 09:02:36.133943+00	
00000000-0000-0000-0000-000000000000	193538b2-a0d9-4e08-9fd1-610822d6ceb5	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 10:01:36.542084+00	
00000000-0000-0000-0000-000000000000	603d8c4a-71c5-4524-9e9b-7d807bb4c7e1	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 10:01:36.564327+00	
00000000-0000-0000-0000-000000000000	93ae3ad2-fdb9-4c53-94c6-2276b623f101	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 11:00:36.665286+00	
00000000-0000-0000-0000-000000000000	0deb7843-55d4-451c-8695-76416a6f688a	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 11:00:36.684152+00	
00000000-0000-0000-0000-000000000000	a0ee1f7d-0fc7-4c6a-ae6a-e0e1e9a5cd13	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 11:58:40.350525+00	
00000000-0000-0000-0000-000000000000	38d34ada-6fda-4cb2-b141-a0e5236e444d	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 11:58:40.364424+00	
00000000-0000-0000-0000-000000000000	f43f45d2-bfb3-444d-b75d-4fcb1ad968d1	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 12:57:00.23214+00	
00000000-0000-0000-0000-000000000000	5e5eb197-196c-42d5-b0bc-8cfe4fad66f4	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 12:57:00.247367+00	
00000000-0000-0000-0000-000000000000	f66c8978-090b-44ae-9b2f-b65212e06be8	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 13:55:30.242838+00	
00000000-0000-0000-0000-000000000000	5aa90323-f266-4962-92ce-2c5d5808bb38	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 13:55:30.263917+00	
00000000-0000-0000-0000-000000000000	cb51b2c1-285c-4c0b-a11e-383058533e12	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 14:53:32.049348+00	
00000000-0000-0000-0000-000000000000	f39955c1-c960-4259-ae45-5bb4609fded9	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 14:53:32.075045+00	
00000000-0000-0000-0000-000000000000	6d5ac9ad-c234-4158-82ea-b5f0fa7d4719	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 15:52:34.478598+00	
00000000-0000-0000-0000-000000000000	5c216d2c-6f50-44bf-86b5-c60ec60e03e2	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 15:52:34.496709+00	
00000000-0000-0000-0000-000000000000	83437c0d-ea23-4705-9f21-c1fa5d52bec5	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 16:51:39.55324+00	
00000000-0000-0000-0000-000000000000	80ee681f-51d3-4913-a1dc-3baea1e70ff0	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 16:51:39.575167+00	
00000000-0000-0000-0000-000000000000	3ec5c508-1da9-47b0-8e13-c4df297e7f19	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 17:50:46.329938+00	
00000000-0000-0000-0000-000000000000	1ed2c951-7803-4112-9470-579bcc24dadc	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 17:50:46.345498+00	
00000000-0000-0000-0000-000000000000	ccb07471-6711-4e26-99c8-577f014a92ac	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 18:49:30.488579+00	
00000000-0000-0000-0000-000000000000	afe89c29-4b37-4c5f-b69a-93b1038ef0c8	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 18:49:30.510421+00	
00000000-0000-0000-0000-000000000000	95cc8aa5-0ba0-4174-aa26-1fd6158cc1a2	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 19:48:59.075108+00	
00000000-0000-0000-0000-000000000000	787832c2-d9ad-4c07-a22d-6dd7bf560ad6	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 19:48:59.086365+00	
00000000-0000-0000-0000-000000000000	3180b3fb-13e7-42cf-afa6-16cbb0c8b980	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 20:48:03.515063+00	
00000000-0000-0000-0000-000000000000	6253c469-46e1-48f2-b88a-20207bd0b3c5	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 20:48:03.52955+00	
00000000-0000-0000-0000-000000000000	80a4917a-9d69-4dc0-9e48-cc9ba2ac7628	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 21:47:12.169539+00	
00000000-0000-0000-0000-000000000000	38aee687-baba-48b5-9a69-d1be0fd8ab77	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 21:47:12.196091+00	
00000000-0000-0000-0000-000000000000	73e9599c-80b5-40fd-93be-6601b3bbaf19	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 22:46:18.776518+00	
00000000-0000-0000-0000-000000000000	0e578e05-9e07-4bd8-818b-aed071422769	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 22:46:18.79703+00	
00000000-0000-0000-0000-000000000000	e34d92f9-b78a-46bd-8375-fdd2346e509f	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 23:45:25.509678+00	
00000000-0000-0000-0000-000000000000	695e66ba-79e8-4581-a2f3-20c935e9f1ce	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 23:45:25.52742+00	
00000000-0000-0000-0000-000000000000	e0cc0d44-6fef-4396-bf45-0b777cee54f8	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 00:44:07.667157+00	
00000000-0000-0000-0000-000000000000	6035e213-7573-49d2-9dea-b4ccc3448707	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 00:44:07.696894+00	
00000000-0000-0000-0000-000000000000	587239fb-906f-4a47-a18c-ba8caa064151	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 01:42:10.308534+00	
00000000-0000-0000-0000-000000000000	f1503c56-d992-403b-b79b-6eab4b390056	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 01:42:10.331791+00	
00000000-0000-0000-0000-000000000000	6e10f2fd-939e-4952-9284-7d5c3c49fd29	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 02:40:17.335268+00	
00000000-0000-0000-0000-000000000000	bc8356dc-51d2-4f62-bba1-a3c4e693a79a	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 02:40:17.34962+00	
00000000-0000-0000-0000-000000000000	8744b13c-5c10-41a5-8895-4f5b748145a7	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 03:38:36.864697+00	
00000000-0000-0000-0000-000000000000	ce50938b-6ecd-47de-9f7d-b2bc56ff9c1a	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 03:38:36.879745+00	
00000000-0000-0000-0000-000000000000	cd242664-b195-478d-a2b9-66ffd651b5cb	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 04:36:52.837114+00	
00000000-0000-0000-0000-000000000000	1f4b1ab4-4e89-49d4-89b1-191a8d19c792	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 04:36:52.857415+00	
00000000-0000-0000-0000-000000000000	c9f83124-c985-4263-8353-3fee0ddef888	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 05:35:09.391941+00	
00000000-0000-0000-0000-000000000000	91556c75-6137-48cb-9ee8-bc4235e1c661	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 05:35:09.405629+00	
00000000-0000-0000-0000-000000000000	bf3c2c94-8ad0-403e-891f-5a1d1f2618ec	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 06:34:32.094925+00	
00000000-0000-0000-0000-000000000000	0a8a6923-8814-4f31-bc38-964f67e1a021	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 06:34:32.112918+00	
00000000-0000-0000-0000-000000000000	9c2c271c-27b6-4658-b2d2-b316e8b6999d	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 07:33:31.869193+00	
00000000-0000-0000-0000-000000000000	ef722650-2533-4c03-af32-f9ec74e89901	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 07:33:31.901301+00	
00000000-0000-0000-0000-000000000000	74416fa5-45c7-475b-913f-5934dd4f2286	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 08:32:31.820869+00	
00000000-0000-0000-0000-000000000000	6dc596e2-4bcd-4f3b-bb11-8d8acd9a0426	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 08:32:31.839737+00	
00000000-0000-0000-0000-000000000000	051c2c84-91d4-41db-879e-8a658c718ee1	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 09:30:59.970224+00	
00000000-0000-0000-0000-000000000000	29c6f9fc-6dbc-4add-886a-885f0e343d66	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 09:30:59.984151+00	
00000000-0000-0000-0000-000000000000	a033aacf-2217-4e42-b4af-b8fed1ed8303	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 10:29:29.570117+00	
00000000-0000-0000-0000-000000000000	07e651b0-0d34-4280-a734-0f15b45e9f13	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 10:29:29.591305+00	
00000000-0000-0000-0000-000000000000	e727de77-755d-4cd5-94ec-46396eb68f81	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 11:27:29.965336+00	
00000000-0000-0000-0000-000000000000	2d3db780-1002-4958-a773-df638d753a09	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 11:27:29.980391+00	
00000000-0000-0000-0000-000000000000	811089e2-cc11-4d9b-95e0-48732fd8d4dd	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 12:26:06.006106+00	
00000000-0000-0000-0000-000000000000	5888adad-ba8f-4082-859a-989bfb438be8	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 12:26:06.021296+00	
00000000-0000-0000-0000-000000000000	81683ba4-bdf2-4ba4-afeb-7fc9f90137dc	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 13:24:18.998372+00	
00000000-0000-0000-0000-000000000000	115fd028-faf5-4fbc-b499-9913846d4233	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 13:24:19.014991+00	
00000000-0000-0000-0000-000000000000	060b7390-4316-4e3b-a63a-58d821f6fcd9	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 14:22:38.28525+00	
00000000-0000-0000-0000-000000000000	10adc1a4-36e8-4bee-a358-eb805e43196e	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 14:22:38.302486+00	
00000000-0000-0000-0000-000000000000	01ed94c8-b4ba-4976-b4e8-aa0772f4ad33	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-17 00:22:29.53613+00	
00000000-0000-0000-0000-000000000000	9f2f4330-17aa-4df2-b377-a952d033ede5	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-17 00:22:29.560156+00	
00000000-0000-0000-0000-000000000000	e147851b-9c77-4460-8dc6-1a052cc58d81	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-17 01:21:15.264724+00	
00000000-0000-0000-0000-000000000000	13902cbb-bcfb-4c2f-9d26-cff6e955602b	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-17 01:21:15.280956+00	
00000000-0000-0000-0000-000000000000	ae897543-ff83-4ad5-be48-6547d0c106af	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-17 02:20:18.279373+00	
00000000-0000-0000-0000-000000000000	eb2abb6b-9930-4430-ab32-4811af1e0bc2	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-17 02:20:18.287722+00	
00000000-0000-0000-0000-000000000000	639987b0-a05b-4e81-b6cf-f58ba87da77d	{"action":"logout","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-17 03:18:05.609328+00	
00000000-0000-0000-0000-000000000000	01fe3a77-a7d8-4c7a-89a3-0f35af0408a4	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-17 03:18:45.39381+00	
00000000-0000-0000-0000-000000000000	d42b556f-804d-48e0-b0a0-7784da4fc9a3	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-17 03:18:58.631825+00	
00000000-0000-0000-0000-000000000000	3f23bfef-aa84-42b9-a478-ccdf2a27ee60	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-17 04:17:47.627966+00	
00000000-0000-0000-0000-000000000000	0c686e61-3934-445d-b1d4-cabcd177170d	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-17 04:17:47.644178+00	
00000000-0000-0000-0000-000000000000	7d26197b-7073-4d83-8fd0-fa429f6dc5f4	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-17 05:17:14.521152+00	
00000000-0000-0000-0000-000000000000	3386a51b-ff69-4af5-8cb7-a5f093a67403	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-17 05:17:14.5377+00	
00000000-0000-0000-0000-000000000000	18824fa8-76f4-4292-b666-3d7ea6ff823e	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-17 06:16:14.264122+00	
00000000-0000-0000-0000-000000000000	ef7616fd-4a2e-4275-b159-36661f16afff	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-17 06:16:14.277907+00	
00000000-0000-0000-0000-000000000000	bdc2f0ff-0faa-46ac-b3d2-e7295f606968	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-17 07:14:41.201941+00	
00000000-0000-0000-0000-000000000000	52bbc78a-4ecd-41aa-aa51-eb08435474cf	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-17 07:14:41.22125+00	
00000000-0000-0000-0000-000000000000	41ac16f4-21c4-46d0-836c-75cbb0565812	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-17 08:13:14.783543+00	
00000000-0000-0000-0000-000000000000	845cff8a-1e16-4335-8aec-1ebc1bf749d6	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-17 08:13:14.79547+00	
00000000-0000-0000-0000-000000000000	7eb66ec2-f445-4cb4-a472-3ae5768dc625	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-17 09:11:28.451104+00	
00000000-0000-0000-0000-000000000000	2efc9afa-ebca-42c6-a02f-61d03ae92a05	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-17 09:11:28.465982+00	
00000000-0000-0000-0000-000000000000	304a8c5d-abbc-40b0-bdd1-9858a91e4d9c	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-17 10:09:40.692991+00	
00000000-0000-0000-0000-000000000000	a8f43760-7355-48ef-b236-400019359170	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-17 10:09:40.706711+00	
00000000-0000-0000-0000-000000000000	ce220bab-5df3-444d-b5f6-5b1c765086c4	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-17 11:07:48.036497+00	
00000000-0000-0000-0000-000000000000	4264f137-2a0e-437b-b1eb-bdf94a016d55	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-17 11:07:48.048046+00	
00000000-0000-0000-0000-000000000000	c330b623-3966-4d57-805f-12d99eca1c5e	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-17 12:07:14.180617+00	
00000000-0000-0000-0000-000000000000	3ceb9011-5dd6-4d2a-a094-13209024a5a2	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-17 12:07:14.192256+00	
00000000-0000-0000-0000-000000000000	d1780544-7732-4c26-b1f7-a7861c84b61e	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-18 12:05:30.9676+00	
00000000-0000-0000-0000-000000000000	f311e746-46e1-4eff-b822-ac5c66311110	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-18 12:05:30.986971+00	
00000000-0000-0000-0000-000000000000	48bbde6d-6d90-4ee1-9caa-61653ad1f3a5	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-19 12:03:36.594046+00	
00000000-0000-0000-0000-000000000000	29bf176c-194d-4d42-8d74-2109fca17469	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-19 12:03:36.62453+00	
00000000-0000-0000-0000-000000000000	f2d68021-c434-498a-86ad-5d7e590e9f05	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 12:01:59.705511+00	
00000000-0000-0000-0000-000000000000	a65ee41a-59e7-4f16-8ac1-5cee3c590aad	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 12:01:59.718444+00	
00000000-0000-0000-0000-000000000000	f761277b-d4cb-4254-8ff2-a9b2f92c269b	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-21 12:00:14.911878+00	
00000000-0000-0000-0000-000000000000	556d2704-156c-4c65-a0a0-3180e0ffef7f	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-21 12:00:14.934896+00	
00000000-0000-0000-0000-000000000000	360f7e48-476b-49d8-a938-bc1eaa4b7578	{"action":"user_confirmation_requested","actor_id":"588ee1c2-26c4-41a2-9804-f4050c77ec41","actor_username":"khaja173@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-09-21 15:03:49.219542+00	
00000000-0000-0000-0000-000000000000	03787871-c8ab-4f22-939b-8c83992a8d43	{"action":"user_signedup","actor_id":"588ee1c2-26c4-41a2-9804-f4050c77ec41","actor_username":"khaja173@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-21 15:05:01.646707+00	
00000000-0000-0000-0000-000000000000	4388fd8f-e11a-4f9f-95c5-3611962381ff	{"action":"logout","actor_id":"588ee1c2-26c4-41a2-9804-f4050c77ec41","actor_username":"khaja173@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-22 10:01:29.702914+00	
00000000-0000-0000-0000-000000000000	46113fca-114b-4ef3-a227-9c9556293976	{"action":"user_recovery_requested","actor_id":"588ee1c2-26c4-41a2-9804-f4050c77ec41","actor_username":"khaja173@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-22 10:01:39.510352+00	
00000000-0000-0000-0000-000000000000	fa09ce50-ba36-4c88-b802-c3630075fd52	{"action":"login","actor_id":"588ee1c2-26c4-41a2-9804-f4050c77ec41","actor_username":"khaja173@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-22 10:01:51.094288+00	
00000000-0000-0000-0000-000000000000	5221548f-0719-40a8-9346-bab1227ea240	{"action":"logout","actor_id":"588ee1c2-26c4-41a2-9804-f4050c77ec41","actor_username":"khaja173@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-22 10:24:48.396363+00	
00000000-0000-0000-0000-000000000000	ae0cbeeb-939f-4a67-a570-e5248c7e9ef8	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-22 11:58:49.61505+00	
00000000-0000-0000-0000-000000000000	968415a8-40b9-4f8c-b5ed-8cc03779171e	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-22 11:58:49.63864+00	
00000000-0000-0000-0000-000000000000	4bb26d25-c6aa-4376-9c27-d3f5c4f34046	{"action":"user_recovery_requested","actor_id":"588ee1c2-26c4-41a2-9804-f4050c77ec41","actor_username":"khaja173@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-23 03:02:03.784668+00	
00000000-0000-0000-0000-000000000000	0bfcec0d-26a2-4a14-8cab-1914f8c7eb3b	{"action":"login","actor_id":"588ee1c2-26c4-41a2-9804-f4050c77ec41","actor_username":"khaja173@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-23 03:02:35.793072+00	
00000000-0000-0000-0000-000000000000	00e89f79-d5ea-4dff-bb3c-3a4fb2bc4dfd	{"action":"logout","actor_id":"588ee1c2-26c4-41a2-9804-f4050c77ec41","actor_username":"khaja173@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-23 03:03:29.027962+00	
00000000-0000-0000-0000-000000000000	7558ac2e-de03-429c-8322-b3b7e6aa6029	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-23 05:29:43.278211+00	
00000000-0000-0000-0000-000000000000	e35ef5ea-d39a-4ec5-987c-d5c9b6643cbc	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-23 05:30:44.243208+00	
00000000-0000-0000-0000-000000000000	75bfda49-4228-4899-9468-22e543807199	{"action":"logout","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-23 10:07:14.2166+00	
00000000-0000-0000-0000-000000000000	59ebee45-dd84-4f3f-b520-7147b0330230	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-23 13:10:58.149698+00	
00000000-0000-0000-0000-000000000000	fd5cdb2b-1e23-490f-a1f6-a3da6c259e19	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-23 13:11:29.226756+00	
00000000-0000-0000-0000-000000000000	35429b55-6aa5-4b97-a487-28a8af9dc764	{"action":"logout","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-24 11:03:19.334065+00	
00000000-0000-0000-0000-000000000000	3b37c251-a6e5-4d14-8716-0ece9d169c8c	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-24 11:03:40.67079+00	
00000000-0000-0000-0000-000000000000	475f9b63-8619-46ff-a3f1-bd0b9a32b9c7	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-24 11:03:53.626924+00	
00000000-0000-0000-0000-000000000000	b953b574-db88-472a-807a-a64f5d46e187	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-25 11:02:42.862391+00	
00000000-0000-0000-0000-000000000000	ef23f17b-747f-4bfe-833b-3fbef419f458	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-25 11:02:42.885106+00	
00000000-0000-0000-0000-000000000000	6b6f35ee-e9ab-4386-a04e-a1a1c4b4a644	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-26 11:01:18.589968+00	
00000000-0000-0000-0000-000000000000	e7baa519-8f1a-4f28-a24c-dd9445ed941e	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-26 11:01:18.614912+00	
00000000-0000-0000-0000-000000000000	c66a9598-495d-4937-ab53-a83f9c11fb4f	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-27 11:00:00.593529+00	
00000000-0000-0000-0000-000000000000	e2580233-4d42-4e4a-a692-656da6de5381	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-27 11:00:00.614798+00	
00000000-0000-0000-0000-000000000000	a5b206d1-57cf-47b3-8192-38ad514a4d50	{"action":"logout","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-27 18:20:28.89614+00	
00000000-0000-0000-0000-000000000000	757980e7-5a55-4446-8a7b-9e8c31f4cfd9	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-27 18:20:49.074656+00	
00000000-0000-0000-0000-000000000000	a62ef103-0392-40ac-9ff5-5e7e62c72fff	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-27 18:21:04.442583+00	
00000000-0000-0000-0000-000000000000	e8e42d87-44d1-464b-81e3-98e4e363b175	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-28 18:20:28.683634+00	
00000000-0000-0000-0000-000000000000	d2edac1f-62d9-42d0-b7c5-aeeda9730b05	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-28 18:20:28.707976+00	
00000000-0000-0000-0000-000000000000	c1b5bb8e-b31c-4dce-bcef-b11c5cf80c0d	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-29 18:19:09.440627+00	
00000000-0000-0000-0000-000000000000	8351d86d-7902-45a9-bc59-a3cca273528f	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-29 18:19:09.467079+00	
00000000-0000-0000-0000-000000000000	957aa20c-d51e-46df-98a3-58240d690415	{"action":"token_refreshed","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-30 18:18:27.825034+00	
00000000-0000-0000-0000-000000000000	0373a70c-59a1-4492-bfa6-87438ea7a263	{"action":"token_revoked","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-30 18:18:27.845732+00	
00000000-0000-0000-0000-000000000000	512ee93c-7e58-481c-b292-26543eae0b24	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-01 16:33:38.156434+00	
00000000-0000-0000-0000-000000000000	04385836-3edf-4b42-9d81-df7de28005f8	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-01 16:42:21.873052+00	
00000000-0000-0000-0000-000000000000	ca9c7cb8-b40a-40ac-8bde-a6db2fed244d	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-01 16:58:19.697961+00	
00000000-0000-0000-0000-000000000000	a231f59a-771b-42a1-b348-2acc5d1b6c03	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-01 16:58:47.467766+00	
00000000-0000-0000-0000-000000000000	fff29523-98dd-4958-ad1c-46bd4ec10410	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-01 17:41:06.197179+00	
00000000-0000-0000-0000-000000000000	1f975a28-2083-461a-9ae8-c327f57b0310	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-01 17:43:58.457238+00	
00000000-0000-0000-0000-000000000000	be18d62e-ce81-4b53-9246-142766b65f28	{"action":"login","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-01 17:44:22.483358+00	
00000000-0000-0000-0000-000000000000	8045ba90-8490-4d24-9ee0-b2475f2b3995	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-01 18:01:02.801087+00	
00000000-0000-0000-0000-000000000000	e9376077-acf1-4e04-83d2-bd87d0cd85b8	{"action":"user_recovery_requested","actor_id":"8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00","actor_username":"shaik173khaja@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-01 18:17:10.899472+00	
\.


--
-- TOC entry 5517 (class 0 OID 16927)
-- Dependencies: 372
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
1190b2d8-773f-4c27-94ed-fd38bfcb7bca	bda8c4d3-f38a-4bde-82ff-261503c8aeef	6e94d12d-9c7a-4e62-b4c8-a78718b2d290	s256	y34qYgrewUTnh5Hr4fcb9TAKJ4EL1omPl9ZgvSWi4P0	magiclink			2025-09-01 13:16:25.610259+00	2025-09-01 13:16:50.41067+00	magiclink	2025-09-01 13:16:50.410628+00
c3478146-3eb9-48d5-99b0-f48e1e882430	bda8c4d3-f38a-4bde-82ff-261503c8aeef	6b385158-f7ab-4177-ac68-1e3615f4d9ec	s256	XihteVAQa9TVaY4LZ7nC7QH0mUZc1AKnSbf6dijzybs	magiclink			2025-09-01 13:20:23.725965+00	2025-09-01 13:20:38.064561+00	magiclink	2025-09-01 13:20:38.064519+00
9731ee50-2581-4f5d-a21d-e65441feb024	3d22ddde-535b-48f5-ac15-d978d821f84b	37499121-d5db-4ee3-9011-f7573dec7297	s256	Dok2M87iaDuOkvRwlBfpnpmwsAa0m7wRxA5Uo1Bmjd0	magiclink			2025-09-01 13:25:06.058293+00	2025-09-01 13:25:06.058293+00	magiclink	\N
ce16afc0-51c5-4393-8a29-f75756a21e33	bda8c4d3-f38a-4bde-82ff-261503c8aeef	9ca4f4bb-e54a-46eb-8a84-4255ef7ac963	s256	IiZZn2okc8DWiaig1E1wPMYR8NJomXXQ53MMBCGQKeA	magiclink			2025-09-01 13:26:33.747133+00	2025-09-01 13:26:40.9783+00	magiclink	2025-09-01 13:26:40.978255+00
233fb811-bc54-4fe8-907b-4ecb79079dfb	8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00	5301a940-fb37-446c-a3cc-ccdb0880372e	s256	x6toSTCWLC0NOeQ52kvtv2wOzq-lOT4U1lDWcBzyiis	magiclink			2025-09-01 13:32:03.440153+00	2025-09-01 13:32:48.40889+00	magiclink	2025-09-01 13:32:48.408848+00
45e17cde-2c7a-4081-9887-af0ae8573293	8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00	095d79c0-68eb-4d36-9e74-f6803f64714e	s256	CLBjbIbuuL93SKtzts7gyMMOjSYw9fRoSLy1YMhnKh0	magiclink			2025-09-01 13:34:14.864787+00	2025-09-01 13:34:27.011819+00	magiclink	2025-09-01 13:34:27.011775+00
c30f1a1e-f0f9-41ba-ac8e-5648f87ac5e0	8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00	255bf0ba-08c6-4361-9887-06f4c1558218	s256	593ccgy1x6Ap-untAYJCa5oxQhLpJLag6fGazVZ7nHE	magiclink			2025-09-01 13:46:55.132539+00	2025-09-01 13:47:05.344526+00	magiclink	2025-09-01 13:47:05.344468+00
98be2675-b0d2-4410-a116-104cf45297aa	8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00	996e66f9-a0cd-4474-a4b4-153ac71018c6	s256	phUkvvsBuGGF7v29SrItpxUlJ8e8bIgIFFbfnAQJ3mg	magiclink			2025-09-01 13:56:17.124464+00	2025-09-01 13:56:29.816674+00	magiclink	2025-09-01 13:56:29.816633+00
ea02fd4a-edbc-484c-9c35-d3f6b5500341	8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00	018d93cf-cb0b-4dee-a3dd-6f194f12ddf3	s256	BrZnDZ2znqYtfyWozu6iEYvJQ2OQfX2ZhLufscjRTVM	magiclink			2025-09-01 14:03:04.183718+00	2025-09-01 14:03:28.101529+00	magiclink	2025-09-01 14:03:28.101486+00
93048d00-b78b-498c-995c-e1f4a3b8a0a4	8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00	23bd748e-f1b5-4649-98d1-1ae52f7dbb7e	s256	5nJJKrB9U0ODHvIuoGE3hXIQPkqzQHm5eDy0rpgGjCc	magiclink			2025-09-02 01:37:53.77343+00	2025-09-02 01:38:06.535092+00	magiclink	2025-09-02 01:38:06.535048+00
6a560e0f-d266-43d0-ae74-9f4031779dfb	8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00	bcc59626-cc25-4079-9485-ed9e0dc362ec	s256	vvJ6oKwriJKCl_QG7h3gR5PUnHvSjKyAco_nkhdmPwQ	magiclink			2025-09-02 01:48:53.286823+00	2025-09-02 01:49:02.432172+00	magiclink	2025-09-02 01:49:02.432128+00
\.


--
-- TOC entry 5508 (class 0 OID 16725)
-- Dependencies: 363
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
79bbda7d-ea19-4dfd-a479-b5fafe7460c6	79bbda7d-ea19-4dfd-a479-b5fafe7460c6	{"sub": "79bbda7d-ea19-4dfd-a479-b5fafe7460c6", "email": "demo@example.com", "email_verified": false, "phone_verified": false}	email	2025-08-26 03:06:44.48116+00	2025-08-26 03:06:44.481732+00	2025-08-26 03:06:44.481732+00	876a0865-dc62-408c-9d39-05c43068c149
d8a4a477-8c80-4239-a6ef-b8b2781036b4	d8a4a477-8c80-4239-a6ef-b8b2781036b4	{"sub": "d8a4a477-8c80-4239-a6ef-b8b2781036b4", "email": "you@example.com", "email_verified": false, "phone_verified": false}	email	2025-08-31 04:29:07.910175+00	2025-08-31 04:29:07.910821+00	2025-08-31 04:29:07.910821+00	2a145a64-837c-4a2b-bed2-0bfb256632d0
62debc4f-7e65-47f0-b2d4-9e43f20cb10c	62debc4f-7e65-47f0-b2d4-9e43f20cb10c	{"sub": "62debc4f-7e65-47f0-b2d4-9e43f20cb10c", "email": "admin@projectkaf.local", "email_verified": false, "phone_verified": false}	email	2025-08-31 05:34:10.564161+00	2025-08-31 05:34:10.564833+00	2025-08-31 05:34:10.564833+00	ad0d3cb9-75eb-460b-afeb-42f9b7a79e7b
e1328e76-0967-4b16-a10d-a400e04905d1	e1328e76-0967-4b16-a10d-a400e04905d1	{"sub": "e1328e76-0967-4b16-a10d-a400e04905d1", "email": "skm@projectkaf.local", "email_verified": false, "phone_verified": false}	email	2025-08-31 08:58:27.811168+00	2025-08-31 08:58:27.81239+00	2025-08-31 08:58:27.81239+00	5c12fdb4-f60a-4376-a62a-cccd5343c540
63da76de-e468-489d-bba7-351759125e9d	63da76de-e468-489d-bba7-351759125e9d	{"sub": "63da76de-e468-489d-bba7-351759125e9d", "email": "newuser@projectkaf.local", "email_verified": false, "phone_verified": false}	email	2025-08-31 13:29:42.534229+00	2025-08-31 13:29:42.53428+00	2025-08-31 13:29:42.53428+00	8bb593b5-d8a9-4d78-a6dc-14e032a3c2cc
8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00	8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00	{"sub": "8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00", "email": "shaik173khaja@gmail.com", "email_verified": false, "phone_verified": false}	email	2025-09-01 13:32:03.411432+00	2025-09-01 13:32:03.411493+00	2025-09-01 13:32:03.411493+00	21785bd9-bbd2-4d5f-9f71-b15c3ab97757
588ee1c2-26c4-41a2-9804-f4050c77ec41	588ee1c2-26c4-41a2-9804-f4050c77ec41	{"sub": "588ee1c2-26c4-41a2-9804-f4050c77ec41", "email": "khaja173@gmail.com", "email_verified": true, "phone_verified": false}	email	2025-09-21 15:03:49.205792+00	2025-09-21 15:03:49.205857+00	2025-09-21 15:03:49.205857+00	5bcc0757-58f7-4fcc-9ea6-b21ee9911a44
\.


--
-- TOC entry 5502 (class 0 OID 16518)
-- Dependencies: 355
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5512 (class 0 OID 16814)
-- Dependencies: 367
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
b63d4c3f-337c-4714-9177-38b4083acb53	2025-08-26 03:49:46.617946+00	2025-08-26 03:49:46.617946+00	password	54356e7f-136f-4453-91db-58d6a03bd697
31633e12-9aae-4fb7-ad82-8e2bdd86a956	2025-08-26 03:59:24.168935+00	2025-08-26 03:59:24.168935+00	password	581fd188-85d2-483e-b4b5-0db2bd4b63af
179f145c-af52-4083-a074-e98bac860a5f	2025-08-26 06:31:07.832721+00	2025-08-26 06:31:07.832721+00	password	1ff25572-1c8e-41b7-a47d-77137bd493f3
f641cd0e-59e6-46e6-b035-de6eccefefff	2025-08-26 07:42:22.268159+00	2025-08-26 07:42:22.268159+00	password	91b2c002-7934-407e-976e-6971f30d2f76
2198c2da-1b2b-49ea-8a1c-1f7ac843b620	2025-08-26 07:43:56.083441+00	2025-08-26 07:43:56.083441+00	password	f064ea36-d73c-4cc4-8a43-cab3a516a448
c485e558-5935-47f3-8b0f-e843d97e3034	2025-08-29 12:55:17.160976+00	2025-08-29 12:55:17.160976+00	password	ce6a7fe8-7273-402a-bc46-61c63bc4a58d
79b77ffc-743c-4316-86df-15e6ac5b99f2	2025-08-29 14:44:23.529694+00	2025-08-29 14:44:23.529694+00	password	c67f5885-2dea-4d21-b80c-ae5c2a72841f
28863af9-0e8f-4856-a7f5-8ef0694e176b	2025-08-31 13:29:42.554541+00	2025-08-31 13:29:42.554541+00	password	2ccb7013-dbcd-41fc-b0c3-5de6c8648dc5
9154ae27-389d-4f95-9dc0-f6411b4a61e4	2025-09-27 18:21:04.466802+00	2025-09-27 18:21:04.466802+00	otp	1c42cc63-212b-480b-ac67-af5194a7e171
d992c050-3e87-405b-b282-77109dfa8a6b	2025-10-01 16:42:21.921071+00	2025-10-01 16:42:21.921071+00	otp	99dfb210-1561-4b5c-8a25-7a35ea76da61
cb3d419a-7e8f-4974-8381-689c202240f7	2025-10-01 16:58:47.483959+00	2025-10-01 16:58:47.483959+00	otp	d34e4e1b-108e-428d-a0d9-61eb3b6ffe93
8159daa5-59d9-4b3d-9cab-00340ab02720	2025-10-01 17:44:22.537+00	2025-10-01 17:44:22.537+00	otp	f6e65591-2422-46c9-8e9f-caf3ddce381c
\.


--
-- TOC entry 5511 (class 0 OID 16802)
-- Dependencies: 366
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- TOC entry 5510 (class 0 OID 16789)
-- Dependencies: 365
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid) FROM stdin;
\.


--
-- TOC entry 5561 (class 0 OID 58411)
-- Dependencies: 428
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_clients (id, client_id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5518 (class 0 OID 16977)
-- Dependencies: 373
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
000d255c-b1ce-4d60-9dc5-e1e1c8d6561c	8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00	recovery_token	df3eaad82ac2b9dda877ae5f15d4004866b2855973d34cca69c82638	shaik173khaja@gmail.com	2025-10-01 18:17:12.44456	2025-10-01 18:17:12.44456
\.


--
-- TOC entry 5501 (class 0 OID 16507)
-- Dependencies: 354
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	1	aydxtecyjbgk	79bbda7d-ea19-4dfd-a479-b5fafe7460c6	f	2025-08-26 03:49:46.594948+00	2025-08-26 03:49:46.594948+00	\N	b63d4c3f-337c-4714-9177-38b4083acb53
00000000-0000-0000-0000-000000000000	2	m6eljd577jr4	79bbda7d-ea19-4dfd-a479-b5fafe7460c6	f	2025-08-26 03:59:24.162402+00	2025-08-26 03:59:24.162402+00	\N	31633e12-9aae-4fb7-ad82-8e2bdd86a956
00000000-0000-0000-0000-000000000000	3	c34qqzdwqz2t	79bbda7d-ea19-4dfd-a479-b5fafe7460c6	f	2025-08-26 06:31:07.784296+00	2025-08-26 06:31:07.784296+00	\N	179f145c-af52-4083-a074-e98bac860a5f
00000000-0000-0000-0000-000000000000	4	k6gc4tphw5tx	79bbda7d-ea19-4dfd-a479-b5fafe7460c6	f	2025-08-26 07:42:22.227877+00	2025-08-26 07:42:22.227877+00	\N	f641cd0e-59e6-46e6-b035-de6eccefefff
00000000-0000-0000-0000-000000000000	5	lrhku42pjz6t	79bbda7d-ea19-4dfd-a479-b5fafe7460c6	f	2025-08-26 07:43:56.079403+00	2025-08-26 07:43:56.079403+00	\N	2198c2da-1b2b-49ea-8a1c-1f7ac843b620
00000000-0000-0000-0000-000000000000	6	fc7dd5mwscd6	79bbda7d-ea19-4dfd-a479-b5fafe7460c6	f	2025-08-29 12:55:17.113725+00	2025-08-29 12:55:17.113725+00	\N	c485e558-5935-47f3-8b0f-e843d97e3034
00000000-0000-0000-0000-000000000000	7	oyngilewknmw	79bbda7d-ea19-4dfd-a479-b5fafe7460c6	f	2025-08-29 14:44:23.480114+00	2025-08-29 14:44:23.480114+00	\N	79b77ffc-743c-4316-86df-15e6ac5b99f2
00000000-0000-0000-0000-000000000000	10	cp7suz24ylyj	63da76de-e468-489d-bba7-351759125e9d	f	2025-08-31 13:29:42.552697+00	2025-08-31 13:29:42.552697+00	\N	28863af9-0e8f-4856-a7f5-8ef0694e176b
00000000-0000-0000-0000-000000000000	319	ntltjb6co37x	8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00	t	2025-09-27 18:21:04.451711+00	2025-09-28 18:20:28.711336+00	\N	9154ae27-389d-4f95-9dc0-f6411b4a61e4
00000000-0000-0000-0000-000000000000	320	k3fczjf42bic	8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00	t	2025-09-28 18:20:28.729316+00	2025-09-29 18:19:09.469119+00	ntltjb6co37x	9154ae27-389d-4f95-9dc0-f6411b4a61e4
00000000-0000-0000-0000-000000000000	321	mziouqllihoh	8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00	t	2025-09-29 18:19:09.49002+00	2025-09-30 18:18:27.848271+00	k3fczjf42bic	9154ae27-389d-4f95-9dc0-f6411b4a61e4
00000000-0000-0000-0000-000000000000	322	ig4ynmpvwbth	8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00	f	2025-09-30 18:18:27.86724+00	2025-09-30 18:18:27.86724+00	mziouqllihoh	9154ae27-389d-4f95-9dc0-f6411b4a61e4
00000000-0000-0000-0000-000000000000	323	wnsi6fn5odhk	8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00	f	2025-10-01 16:42:21.895471+00	2025-10-01 16:42:21.895471+00	\N	d992c050-3e87-405b-b282-77109dfa8a6b
00000000-0000-0000-0000-000000000000	324	wfhhs5k6gcw5	8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00	f	2025-10-01 16:58:47.476249+00	2025-10-01 16:58:47.476249+00	\N	cb3d419a-7e8f-4974-8381-689c202240f7
00000000-0000-0000-0000-000000000000	325	fdb3o2amurnm	8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00	f	2025-10-01 17:44:22.5041+00	2025-10-01 17:44:22.5041+00	\N	8159daa5-59d9-4b3d-9cab-00340ab02720
\.


--
-- TOC entry 5515 (class 0 OID 16856)
-- Dependencies: 370
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- TOC entry 5516 (class 0 OID 16874)
-- Dependencies: 371
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- TOC entry 5504 (class 0 OID 16533)
-- Dependencies: 357
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
\.


--
-- TOC entry 5509 (class 0 OID 16755)
-- Dependencies: 364
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag) FROM stdin;
b63d4c3f-337c-4714-9177-38b4083acb53	79bbda7d-ea19-4dfd-a479-b5fafe7460c6	2025-08-26 03:49:46.587342+00	2025-08-26 03:49:46.587342+00	\N	aal1	\N	\N	curl/8.1.1-webcontainer	2a06:98c0:3600::103	\N
31633e12-9aae-4fb7-ad82-8e2bdd86a956	79bbda7d-ea19-4dfd-a479-b5fafe7460c6	2025-08-26 03:59:24.159357+00	2025-08-26 03:59:24.159357+00	\N	aal1	\N	\N	curl/8.1.1-webcontainer	2a06:98c0:3600::103	\N
179f145c-af52-4083-a074-e98bac860a5f	79bbda7d-ea19-4dfd-a479-b5fafe7460c6	2025-08-26 06:31:07.758324+00	2025-08-26 06:31:07.758324+00	\N	aal1	\N	\N	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2a06:98c0:3600::103	\N
f641cd0e-59e6-46e6-b035-de6eccefefff	79bbda7d-ea19-4dfd-a479-b5fafe7460c6	2025-08-26 07:42:22.203966+00	2025-08-26 07:42:22.203966+00	\N	aal1	\N	\N	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2a06:98c0:3600::103	\N
2198c2da-1b2b-49ea-8a1c-1f7ac843b620	79bbda7d-ea19-4dfd-a479-b5fafe7460c6	2025-08-26 07:43:56.075417+00	2025-08-26 07:43:56.075417+00	\N	aal1	\N	\N	node-fetch/1.0 (+https://github.com/bitinn/node-fetch)	2a06:98c0:3600::103	\N
c485e558-5935-47f3-8b0f-e843d97e3034	79bbda7d-ea19-4dfd-a479-b5fafe7460c6	2025-08-29 12:55:17.089825+00	2025-08-29 12:55:17.089825+00	\N	aal1	\N	\N	node	202.4.28.14	\N
79b77ffc-743c-4316-86df-15e6ac5b99f2	79bbda7d-ea19-4dfd-a479-b5fafe7460c6	2025-08-29 14:44:23.453288+00	2025-08-29 14:44:23.453288+00	\N	aal1	\N	\N	curl/8.7.1	202.4.28.14	\N
28863af9-0e8f-4856-a7f5-8ef0694e176b	63da76de-e468-489d-bba7-351759125e9d	2025-08-31 13:29:42.547971+00	2025-08-31 13:29:42.547971+00	\N	aal1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	202.4.28.14	\N
9154ae27-389d-4f95-9dc0-f6411b4a61e4	8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00	2025-09-27 18:21:04.445914+00	2025-09-30 18:18:27.889806+00	\N	aal1	\N	2025-09-30 18:18:27.88973	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	202.4.28.132	\N
d992c050-3e87-405b-b282-77109dfa8a6b	8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00	2025-10-01 16:42:21.881007+00	2025-10-01 16:42:21.881007+00	\N	aal1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	202.4.28.132	\N
cb3d419a-7e8f-4974-8381-689c202240f7	8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00	2025-10-01 16:58:47.472181+00	2025-10-01 16:58:47.472181+00	\N	aal1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	202.4.28.132	\N
8159daa5-59d9-4b3d-9cab-00340ab02720	8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00	2025-10-01 17:44:22.489069+00	2025-10-01 17:44:22.489069+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36	202.4.28.132	\N
\.


--
-- TOC entry 5514 (class 0 OID 16841)
-- Dependencies: 369
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5513 (class 0 OID 16832)
-- Dependencies: 368
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- TOC entry 5499 (class 0 OID 16495)
-- Dependencies: 352
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	63da76de-e468-489d-bba7-351759125e9d	authenticated	authenticated	newuser@projectkaf.local	$2a$10$JeYHjiTQ9Wbm/d054CHGH.xCPQObExMNDISk4Sp1oDoWEpWWWCAgS	2025-08-31 13:29:42.539908+00	\N		\N		\N			\N	2025-08-31 13:29:42.547901+00	{"provider": "email", "providers": ["email"]}	{"sub": "63da76de-e468-489d-bba7-351759125e9d", "email": "newuser@projectkaf.local", "email_verified": true, "phone_verified": false}	\N	2025-08-31 13:29:42.530349+00	2025-08-31 13:29:42.554005+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	79bbda7d-ea19-4dfd-a479-b5fafe7460c6	authenticated	authenticated	demo@example.com	$2a$10$W2khCubKLgc7K.vxA2IXBufYjyWoPvU81ZCDRbQkhCxcljEeUruwS	2025-08-26 03:06:44.503827+00	\N		\N		\N			\N	2025-08-29 14:44:23.452309+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-08-26 03:06:44.45432+00	2025-08-29 14:44:23.518105+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	d8a4a477-8c80-4239-a6ef-b8b2781036b4	authenticated	authenticated	you@example.com	$2a$10$jBnoXDp7e27vaOkBISUz7OniQ23fjHKsFsYOIJMn7v7.UhAS49Av6	2025-08-31 04:29:07.935032+00	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-08-31 04:29:07.88933+00	2025-08-31 04:29:07.940993+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	62debc4f-7e65-47f0-b2d4-9e43f20cb10c	authenticated	authenticated	admin@projectkaf.local	$2a$10$e7zrMFqO4/iVRtHp6M68Fu2bZ.sF7LDRBvBID/IG/W8skItPfK6yq	2025-08-31 05:34:10.59165+00	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-08-31 05:34:10.545584+00	2025-08-31 05:34:10.598903+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	e1328e76-0967-4b16-a10d-a400e04905d1	authenticated	authenticated	skm@projectkaf.local	$2a$10$tbxqkqBUbl3ExEkl8r5hUe0YjxHVwzoTmaBKlM/V2t.PfMfP5bPb2	2025-08-31 08:58:27.833602+00	\N		\N		\N			\N	2025-08-31 12:15:27.535203+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-08-31 08:58:27.792135+00	2025-08-31 13:13:45.974463+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	588ee1c2-26c4-41a2-9804-f4050c77ec41	authenticated	authenticated	khaja173@gmail.com	$2a$10$XQW6c03zWLkra5HB2RoLIe7i5qBgsaZ60/nFSCPcQocQ518208GXm	2025-09-21 15:05:01.650222+00	\N		2025-09-21 15:03:49.229332+00		2025-09-23 03:02:03.812405+00			\N	2025-09-23 03:02:35.800994+00	{"provider": "email", "providers": ["email"]}	{"sub": "588ee1c2-26c4-41a2-9804-f4050c77ec41", "email": "khaja173@gmail.com", "email_verified": true, "phone_verified": false}	\N	2025-09-21 15:03:49.17594+00	2025-09-23 03:02:35.837718+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00	authenticated	authenticated	shaik173khaja@gmail.com	$2a$10$8zt49iT6YSVrXUFMx4MapuCzifIlc1onAOAuvxMzIsY27NRaKBnLG	2025-09-01 13:32:03.416174+00	\N		\N	df3eaad82ac2b9dda877ae5f15d4004866b2855973d34cca69c82638	2025-10-01 18:17:10.910408+00			\N	2025-10-01 17:44:22.488992+00	{"provider": "email", "providers": ["email"]}	{"sub": "8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00", "email": "shaik173khaja@gmail.com", "email_verified": true, "phone_verified": false}	\N	2025-09-01 13:32:03.405815+00	2025-10-01 18:17:12.424626+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- TOC entry 5559 (class 0 OID 45850)
-- Dependencies: 424
-- Data for Name: analytics_daily; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.analytics_daily (tenant_id, day, orders_count, revenue_total, dine_in_count, takeaway_count, updated_at) FROM stdin;
550e8400-e29b-41d4-a716-446655440000	2025-08-27	2	0.00	2	0	2025-08-27 14:34:21.510313+00
550e8400-e29b-41d4-a716-446655440000	2025-09-20	1	100.00	1	0	2025-09-20 03:39:55.076278+00
\.


--
-- TOC entry 5536 (class 0 OID 17804)
-- Dependencies: 395
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, tenant_id, user_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- TOC entry 5573 (class 0 OID 107542)
-- Dependencies: 443
-- Data for Name: billing_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.billing_plans (id, code, name, price_cents, currency, "interval", features, is_active, created_at, updated_at) FROM stdin;
fbbe9bfb-d654-43a9-bb3f-94a56c1fd66b	basic	Basic Plan	0	USD	monthly	{"seats": 1}	t	2025-09-23 08:04:12.834837+00	2025-09-23 08:04:12.834837+00
5992ec0c-4207-4803-909c-e75e8653ebe5	pro	Pro Plan	4900	USD	monthly	{"seats": 3}	t	2025-09-23 08:04:12.834837+00	2025-09-23 08:04:12.834837+00
e8178ab7-899b-48d2-9be2-9570f5b24ad5	elite	Elite Plan	9900	USD	monthly	{"seats": 5}	t	2025-09-23 08:04:12.834837+00	2025-09-23 08:04:12.834837+00
\.


--
-- TOC entry 5572 (class 0 OID 106058)
-- Dependencies: 441
-- Data for Name: billing_webhooks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.billing_webhooks (id, provider, event_id, event_type, payload, signature, tenant_id, status, received_at, processed_at) FROM stdin;
\.


--
-- TOC entry 5558 (class 0 OID 37734)
-- Dependencies: 421
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_items (id, cart_id, menu_item_id, qty, instructions, added_at, tenant_id, price, name) FROM stdin;
\.


--
-- TOC entry 5557 (class 0 OID 37670)
-- Dependencies: 420
-- Data for Name: cart_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_sessions (id, tenant_id, table_id, session_token, is_takeaway, expires_at, created_at) FROM stdin;
\.


--
-- TOC entry 5565 (class 0 OID 82145)
-- Dependencies: 432
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carts (id, tenant_id, mode, table_code, status, created_at, updated_at, user_id) FROM stdin;
aeafcb17-2a4a-4bf0-8e8a-875f0776ebc7	550e8400-e29b-41d4-a716-446655440000	takeaway	\N	open	2025-09-27 01:00:56.703828+00	2025-09-27 01:00:56.703828+00	8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00
90cbb756-cabd-42ad-901b-43c7f6f2a9b0	550e8400-e29b-41d4-a716-446655440000	takeaway	\N	open	2025-09-21 15:05:31.274352+00	2025-09-21 15:06:16.043252+00	6c497a84-8940-4047-a7aa-00549431db86
e56ae862-dece-46f8-a77f-d15aa445823d	550e8400-e29b-41d4-a716-446655440000	takeaway	\N	open	2025-10-02 04:27:15.526097+00	2025-10-02 04:57:29.610481+00	2ecdf029-319c-4be7-8cc7-47c474345df5
005406f4-4964-4f62-8bc0-e7390e1f170a	550e8400-e29b-41d4-a716-446655440000	takeaway	\N	open	2025-10-02 04:32:16.631298+00	2025-10-02 04:32:16.631298+00	fec984a7-9ff2-4947-a943-28b0b79a2cbf
09ac4d3a-394f-4654-9038-b27c2c9bf83b	550e8400-e29b-41d4-a716-446655440000	takeaway	\N	open	2025-10-02 04:32:17.640711+00	2025-10-02 04:32:17.640711+00	57dd6130-b7c9-4bec-9cb0-6f300ce8f055
d5faef92-b927-42fd-ac4d-c1ebe76d1757	550e8400-e29b-41d4-a716-446655440000	takeaway	\N	open	2025-10-02 04:48:46.290561+00	2025-10-02 04:48:46.290561+00	630f5850-f53b-4985-a4df-81f8215c6269
4025ba88-3d96-4f0e-bfcc-50d394b7d5c4	550e8400-e29b-41d4-a716-446655440000	takeaway	\N	open	2025-10-02 04:48:47.194031+00	2025-10-02 04:48:47.194031+00	69b88d10-652c-4c29-a43e-4e9e12a06b91
707e2e37-05a1-41c3-88f4-4a4106278c2a	550e8400-e29b-41d4-a716-446655440000	takeaway	\N	open	2025-09-18 03:26:59.077397+00	2025-09-24 12:18:10.809834+00	8da282af-080d-4e24-bdce-aedf1b06c0ba
3e03383b-e436-4708-be04-f2996f055f01	550e8400-e29b-41d4-a716-446655440000	takeaway	\N	open	2025-10-02 03:32:38.794213+00	2025-10-02 03:33:07.223169+00	6742dcdb-8393-47b4-8773-e798258253e0
a929c317-7508-4690-a878-f2600edf7f3e	550e8400-e29b-41d4-a716-446655440000	takeaway	\N	open	2025-10-02 04:30:56.57512+00	2025-10-02 04:30:56.57512+00	194f024b-e507-43bd-8f05-cd985011131b
b7d4402d-1a65-43b9-aff2-bbf788433ded	550e8400-e29b-41d4-a716-446655440000	takeaway	\N	open	2025-10-02 04:30:57.263429+00	2025-10-02 04:30:57.263429+00	2658cee7-8444-49b2-a846-1cda11167759
c0e7d29a-b5fa-4511-baeb-c0a31afeafff	550e8400-e29b-41d4-a716-446655440000	takeaway	\N	open	2025-10-02 04:33:16.216527+00	2025-10-02 04:33:16.216527+00	19391997-496c-402b-b2d9-12a6d664f7cc
58c63b68-a19c-4f77-9d74-d99a9eb7c466	550e8400-e29b-41d4-a716-446655440000	takeaway	\N	open	2025-10-02 04:33:17.16618+00	2025-10-02 04:33:17.16618+00	7d1d7e34-273d-4a69-a0bb-1b958cd1beb9
75a668a0-db9b-473b-a650-146ac30d37e1	550e8400-e29b-41d4-a716-446655440000	takeaway	\N	open	2025-10-02 04:51:45.678383+00	2025-10-02 04:51:45.678383+00	8c2b91d3-fb61-4169-98bc-8d49d870d7d3
1261c1e7-11ac-4fa3-a507-ea852c6e4fac	550e8400-e29b-41d4-a716-446655440000	takeaway	\N	open	2025-10-02 04:51:46.073901+00	2025-10-02 04:51:46.073901+00	eb5205fa-3673-48fc-83b5-cc55649b6cc5
5f04bc14-8782-445f-96cf-4d3670ad8921	550e8400-e29b-41d4-a716-446655440000	takeaway	\N	open	2025-10-02 04:52:01.443656+00	2025-10-02 04:52:01.443656+00	dc7553ba-5650-484a-a436-eba278001a9f
7ba011a3-2099-43ec-9b97-d4fc1aeb88b4	550e8400-e29b-41d4-a716-446655440000	takeaway	\N	open	2025-10-02 04:52:01.838085+00	2025-10-02 04:52:01.838085+00	cbf88a61-9460-40fa-be6d-62a8b6f6dbdf
\.


--
-- TOC entry 5527 (class 0 OID 17572)
-- Dependencies: 386
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, tenant_id, name, description, image_url, sort_order, is_active, created_at, updated_at) FROM stdin;
550e8400-e29b-41d4-a716-446655440020	550e8400-e29b-41d4-a716-446655440000	Appetizers	Start your meal right	\N	1	t	2025-08-21 02:15:33.620991+00	2025-08-21 02:15:33.620991+00
550e8400-e29b-41d4-a716-446655440021	550e8400-e29b-41d4-a716-446655440000	Main Courses	Hearty main dishes	\N	2	t	2025-08-21 02:15:33.620991+00	2025-08-21 02:15:33.620991+00
550e8400-e29b-41d4-a716-446655440022	550e8400-e29b-41d4-a716-446655440000	Desserts	Sweet endings	\N	3	t	2025-08-21 02:15:33.620991+00	2025-08-21 02:15:33.620991+00
550e8400-e29b-41d4-a716-446655440023	550e8400-e29b-41d4-a716-446655440000	Beverages	Refreshing drinks	\N	4	t	2025-08-21 02:15:33.620991+00	2025-08-21 02:15:33.620991+00
14af1d71-ead2-4893-aa5d-7a13db3619a8	a7871f2c-5da9-4f27-8566-7bdbe0e34700	Appetizers	Start your meal with our delicious appetizers	\N	1	t	2025-08-24 01:42:07.469133+00	2025-08-24 01:42:07.469133+00
3c678583-94b0-48cb-a5bd-17056664fe47	a7871f2c-5da9-4f27-8566-7bdbe0e34700	Main Courses	Our signature main dishes	\N	2	t	2025-08-24 01:42:07.469133+00	2025-08-24 01:42:07.469133+00
0e79f40c-7939-48d2-8e90-ff75383bf713	a7871f2c-5da9-4f27-8566-7bdbe0e34700	Desserts	Sweet endings to your meal	\N	3	t	2025-08-24 01:42:07.469133+00	2025-08-24 01:42:07.469133+00
a2319ba5-7ebb-4267-98d7-e1d38fbec058	a7871f2c-5da9-4f27-8566-7bdbe0e34700	Beverages	Drinks and cocktails	\N	4	t	2025-08-24 01:42:07.469133+00	2025-08-24 01:42:07.469133+00
0a2cc57b-5e1c-4449-bb33-b1110b51fc9f	550e8400-e29b-41d4-a716-446655440000	General	\N	\N	0	t	2025-09-11 09:29:16.496248+00	2025-09-11 09:29:16.496248+00
26a5b575-bdfc-45b6-9db4-c4749c8f64c2	550e8400-e29b-41d4-a716-446655440000	Healthy	\N	\N	0	t	2025-09-11 13:37:55.351444+00	2025-09-11 13:37:55.351444+00
463f4cc9-1252-4675-8b59-adeaeb852a52	550e8400-e29b-41d4-a716-446655440000	Pizza	\N	\N	0	t	2025-09-11 13:37:55.807821+00	2025-09-11 13:37:55.807821+00
2aa8fa37-7d17-4c39-9923-94b871467b86	550e8400-e29b-41d4-a716-446655440000	Cakes	\N	\N	0	t	2025-09-11 13:37:56.155931+00	2025-09-11 13:37:56.155931+00
\.


--
-- TOC entry 5529 (class 0 OID 17636)
-- Dependencies: 388
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, tenant_id, email, phone, first_name, last_name, date_of_birth, preferences, loyalty_points, total_spent, visit_count, last_visit_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5546 (class 0 OID 27310)
-- Dependencies: 405
-- Data for Name: customization; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customization (tenant_id, theme, logo_url, hero_video, palette) FROM stdin;
\.


--
-- TOC entry 5537 (class 0 OID 17823)
-- Dependencies: 396
-- Data for Name: daily_sales_summary; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.daily_sales_summary (id, tenant_id, date, total_orders, total_revenue, total_customers, average_order_value, top_selling_items, created_at) FROM stdin;
\.


--
-- TOC entry 5547 (class 0 OID 27364)
-- Dependencies: 406
-- Data for Name: domain_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.domain_events (id, tenant_id, aggregate_type, aggregate_id, event_type, payload, created_at) FROM stdin;
\.


--
-- TOC entry 5533 (class 0 OID 17744)
-- Dependencies: 392
-- Data for Name: inventory_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_items (id, tenant_id, name, description, unit, current_stock, minimum_stock, maximum_stock, cost_per_unit, supplier_info, last_restocked_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5560 (class 0 OID 54616)
-- Dependencies: 427
-- Data for Name: invitations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invitations (id, email, tenant_id, role, status, invited_by, created_at, accepted_at) FROM stdin;
2a365805-5da8-4e8a-a6e4-90249ac0a2e5	newuser@projectkaf.local	550e8400-e29b-41d4-a716-446655440000	staff	pending	e1328e76-0967-4b16-a10d-a400e04905d1	2025-08-31 13:26:59.501708+00	\N
0cb7f1fe-8c76-415d-a222-dca59b1507ed	shaik173khaja@gmail.com	550e8400-e29b-41d4-a716-446655440000	staff	accepted	26163ea2-2882-4487-a9c1-2f83ec83d435	2025-08-31 14:32:28.663306+00	2025-08-31 14:39:23.563+00
\.


--
-- TOC entry 5543 (class 0 OID 27223)
-- Dependencies: 402
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.locations (id, tenant_id, name, timezone, currency, created_at) FROM stdin;
\.


--
-- TOC entry 5545 (class 0 OID 27296)
-- Dependencies: 404
-- Data for Name: menu_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menu_categories (id, tenant_id, name, rank) FROM stdin;
0b92a95e-3955-4a30-b3fa-4074c1a2ea50	550e8400-e29b-41d4-a716-446655440000	General	0
\.


--
-- TOC entry 5528 (class 0 OID 17589)
-- Dependencies: 387
-- Data for Name: menu_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menu_items (id, tenant_id, category_id, name, description, price, cost, image_url, images, ingredients, allergens, nutritional_info, dietary_info, preparation_time, calories, is_available, is_featured, sort_order, variants, created_at, updated_at, active, section_id, ord, tags, spicy_level) FROM stdin;
7b24f3bd-b5f1-42e3-9b10-5b36d5dee5e9	550e8400-e29b-41d4-a716-446655440000	0a2cc57b-5e1c-4449-bb33-b1110b51fc9f	Item 3	Item 3	3.30	\N	blob:http://localhost:5173/862be5d3-4f2a-4ff5-a9f2-68f4f47ff434	[]	[]	[]	{}	{}	3	3	t	f	0	[]	2025-09-16 03:40:04.392003+00	2025-09-16 05:30:59.917422+00	t	2ee17d78-dbea-4fc0-9474-5d733c4fcc68	0	[]	0
29c8c338-d13a-4e06-8862-4936b042c2e1	550e8400-e29b-41d4-a716-446655440000	0a2cc57b-5e1c-4449-bb33-b1110b51fc9f	Item 3.1	Item 3.1	33.30	\N	blob:http://localhost:5173/e375bcb5-c263-46af-9da3-c244c816511e	[]	[]	[]	{}	{}	33	333	t	f	0	[]	2025-09-16 03:47:13.989641+00	2025-09-16 05:30:59.917422+00	t	2ee17d78-dbea-4fc0-9474-5d733c4fcc68	0	[]	0
df4df09d-8acb-44e4-9451-badd5cc42f24	550e8400-e29b-41d4-a716-446655440000	0a2cc57b-5e1c-4449-bb33-b1110b51fc9f	Item 5	Item 5	5.50	\N	blob:http://localhost:5173/1601eaa9-ae74-49a8-8278-28034a5b1c0c	[]	[]	[]	{}	{}	5	5	t	f	0	[]	2025-09-16 03:41:08.517156+00	2025-09-17 07:32:50.040669+00	t	8f2cdfc8-48ed-4ac7-8ee9-18f51ac79116	0	[]	0
95669663-6ac4-444c-85a9-995822caee6a	550e8400-e29b-41d4-a716-446655440000	0a2cc57b-5e1c-4449-bb33-b1110b51fc9f	Item 5.1	Item 5.1	99.90	\N	blob:http://localhost:5173/310e041c-120b-4104-839f-1654fe93daad	[]	[]	[]	{}	{}	55	555	t	f	0	[]	2025-09-16 03:48:35.358793+00	2025-09-28 06:08:44.692437+00	t	8f2cdfc8-48ed-4ac7-8ee9-18f51ac79116	0	[]	3
e4f8b06d-88f0-452a-a17e-cda4482ee2f3	550e8400-e29b-41d4-a716-446655440000	0a2cc57b-5e1c-4449-bb33-b1110b51fc9f	Item 1.1	Item 1.1	100.00	\N	blob:http://localhost:5173/f3d9786d-bc3d-4e09-a1bb-becf14b60121	[]	[]	[]	{}	{}	115	1111	t	f	0	[]	2025-09-16 03:45:58.611457+00	2025-09-28 10:05:30.719294+00	t	51aa44e2-3cfc-45a2-8988-c3938501b6a4	0	[]	3
7e11982e-963a-492a-9db4-3899cf2616d7	550e8400-e29b-41d4-a716-446655440000	0a2cc57b-5e1c-4449-bb33-b1110b51fc9f	Test	Test	151.00	\N	\N	[]	[]	[]	{}	{}	25	150	t	f	0	[]	2025-09-28 10:01:24.837982+00	2025-10-02 04:37:38.481463+00	t	ef9a5333-8f06-4688-b920-c80cb1ae926e	0	[]	3
87df35c4-67f3-4368-83bc-554f99ef03fe	550e8400-e29b-41d4-a716-446655440000	0a2cc57b-5e1c-4449-bb33-b1110b51fc9f	Item 4.1	Item 4.1	44.40	\N	blob:http://localhost:5173/85d16a32-6a35-49e2-889f-0a58af0a74c9	[]	[]	[]	{}	{}	44	444	t	f	0	[]	2025-09-16 03:47:55.548657+00	2025-09-16 05:30:37.335145+00	t	b0add472-387d-463b-bc6d-c1a47bcc058e	0	[]	3
463253b2-c63e-49fa-8e03-7d1dd93dc0aa	550e8400-e29b-41d4-a716-446655440000	0a2cc57b-5e1c-4449-bb33-b1110b51fc9f	Item 4	Item 4	4.40	\N	blob:http://localhost:5173/efd95772-82d0-4385-b327-61b85ddb2c73	[]	[]	[]	{}	{}	4	4	t	f	0	[]	2025-09-16 03:40:38.054539+00	2025-09-28 06:00:27.801707+00	t	b0add472-387d-463b-bc6d-c1a47bcc058e	0	[]	2
18b89839-e698-4436-8b42-2757aecf57a7	550e8400-e29b-41d4-a716-446655440000	0a2cc57b-5e1c-4449-bb33-b1110b51fc9f	Item 2.1	Item 2.1	22.20	\N	blob:http://localhost:5173/4925a205-bebf-4d1d-bc18-ba2903d7f41c	[]	[]	[]	{}	{}	22	222	t	f	0	[]	2025-09-16 03:46:34.731093+00	2025-09-28 08:49:26.855096+00	t	45f293f9-6f75-4b64-8e8f-8c6a49e3f4ff	0	[]	0
ce7d5fd1-c0d0-4f0b-a76c-b379cb2438ec	550e8400-e29b-41d4-a716-446655440000	0a2cc57b-5e1c-4449-bb33-b1110b51fc9f	Item 2	Item 2	2.20	\N	blob:http://localhost:5173/d82b9cf8-1b9d-410d-8bc1-eb029750acbf	[]	[]	[]	{}	{}	2	2	t	f	0	[]	2025-09-16 03:39:32.551916+00	2025-09-28 08:49:26.855096+00	t	45f293f9-6f75-4b64-8e8f-8c6a49e3f4ff	0	[]	1
\.


--
-- TOC entry 5564 (class 0 OID 77126)
-- Dependencies: 431
-- Data for Name: menu_sections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menu_sections (id, tenant_id, name, ord, is_active, created_at, updated_at) FROM stdin;
51aa44e2-3cfc-45a2-8988-c3938501b6a4	550e8400-e29b-41d4-a716-446655440000	Section 1	1	t	2025-09-16 03:36:51.381149+00	2025-09-16 03:36:51.381149+00
45f293f9-6f75-4b64-8e8f-8c6a49e3f4ff	550e8400-e29b-41d4-a716-446655440000	Section 2	2	t	2025-09-16 03:36:52.527889+00	2025-09-16 03:36:52.527889+00
2ee17d78-dbea-4fc0-9474-5d733c4fcc68	550e8400-e29b-41d4-a716-446655440000	Section 3	3	t	2025-09-16 03:36:53.560169+00	2025-09-16 03:36:53.560169+00
b0add472-387d-463b-bc6d-c1a47bcc058e	550e8400-e29b-41d4-a716-446655440000	Section 4	4	t	2025-09-16 03:36:54.577808+00	2025-09-16 03:36:54.577808+00
8f2cdfc8-48ed-4ac7-8ee9-18f51ac79116	550e8400-e29b-41d4-a716-446655440000	Section 5	5	t	2025-09-16 03:36:55.607127+00	2025-09-16 03:36:55.607127+00
ef9a5333-8f06-4688-b920-c80cb1ae926e	550e8400-e29b-41d4-a716-446655440000	Section 6 Test	0	t	2025-09-28 04:34:35.356739+00	2025-09-28 04:34:35.356739+00
\.


--
-- TOC entry 5535 (class 0 OID 17783)
-- Dependencies: 394
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, tenant_id, user_id, type, title, message, data, is_read, expires_at, created_at) FROM stdin;
\.


--
-- TOC entry 5531 (class 0 OID 17699)
-- Dependencies: 390
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, menu_item_id, quantity, unit_price, total_price, customizations, special_instructions, status, created_at, updated_at, tenant_id, currency, item_name) FROM stdin;
e0a01c31-d147-4582-81cc-a3ae8ed7c085	fadbbb77-02aa-4704-8734-c81ffd6a6a73	7e11982e-963a-492a-9db4-3899cf2616d7	4	151.00	604.00	{}	\N	pending	2025-10-02 04:39:05.495089+00	2025-10-02 04:39:05.495089+00	550e8400-e29b-41d4-a716-446655440000	INR	\N
a5a6670e-e9c4-41d3-b5c3-547e6601a7ea	fadbbb77-02aa-4704-8734-c81ffd6a6a73	e4f8b06d-88f0-452a-a17e-cda4482ee2f3	1	100.00	100.00	{}	\N	pending	2025-10-02 04:39:05.495089+00	2025-10-02 04:39:05.495089+00	550e8400-e29b-41d4-a716-446655440000	INR	\N
b0a789e0-f85a-4c55-b1ba-62d71081abc5	fadbbb77-02aa-4704-8734-c81ffd6a6a73	87df35c4-67f3-4368-83bc-554f99ef03fe	1	44.40	44.40	{}	\N	pending	2025-10-02 04:39:05.495089+00	2025-10-02 04:39:05.495089+00	550e8400-e29b-41d4-a716-446655440000	INR	\N
3e9b6d98-b6a6-43e6-a2bc-c3c2e77e3dd1	fadbbb77-02aa-4704-8734-c81ffd6a6a73	463253b2-c63e-49fa-8e03-7d1dd93dc0aa	1	4.40	4.40	{}	\N	pending	2025-10-02 04:39:05.495089+00	2025-10-02 04:39:05.495089+00	550e8400-e29b-41d4-a716-446655440000	INR	\N
952e4a23-87dd-4b21-a621-5be16f670752	fadbbb77-02aa-4704-8734-c81ffd6a6a73	95669663-6ac4-444c-85a9-995822caee6a	2	99.90	199.80	{}	\N	pending	2025-10-02 04:39:05.495089+00	2025-10-02 04:39:05.495089+00	550e8400-e29b-41d4-a716-446655440000	INR	\N
78190a2b-8c90-47f1-a49c-33a629b7d845	fadbbb77-02aa-4704-8734-c81ffd6a6a73	df4df09d-8acb-44e4-9451-badd5cc42f24	2	5.50	11.00	{}	\N	pending	2025-10-02 04:39:05.495089+00	2025-10-02 04:39:05.495089+00	550e8400-e29b-41d4-a716-446655440000	INR	\N
67054b4c-4377-4b54-92a9-6e9f18f4c036	fadbbb77-02aa-4704-8734-c81ffd6a6a73	7b24f3bd-b5f1-42e3-9b10-5b36d5dee5e9	2	3.30	6.60	{}	\N	pending	2025-10-02 04:39:05.495089+00	2025-10-02 04:39:05.495089+00	550e8400-e29b-41d4-a716-446655440000	INR	\N
835ef0f5-c8a7-4e7f-9c0a-26add519479b	fadbbb77-02aa-4704-8734-c81ffd6a6a73	29c8c338-d13a-4e06-8862-4936b042c2e1	2	33.30	66.60	{}	\N	pending	2025-10-02 04:39:05.495089+00	2025-10-02 04:39:05.495089+00	550e8400-e29b-41d4-a716-446655440000	INR	\N
4ced8ffd-50f9-4412-ace8-724f1e308e5c	fadbbb77-02aa-4704-8734-c81ffd6a6a73	18b89839-e698-4436-8b42-2757aecf57a7	2	22.20	44.40	{}	\N	pending	2025-10-02 04:39:05.495089+00	2025-10-02 04:39:05.495089+00	550e8400-e29b-41d4-a716-446655440000	INR	\N
c8444b78-b699-4ea4-ab8d-ca689e68a328	fadbbb77-02aa-4704-8734-c81ffd6a6a73	ce7d5fd1-c0d0-4f0b-a76c-b379cb2438ec	2	2.20	4.40	{}	\N	pending	2025-10-02 04:39:05.495089+00	2025-10-02 04:39:05.495089+00	550e8400-e29b-41d4-a716-446655440000	INR	\N
de69ddba-a28d-4fdd-a2aa-400d578c4b33	3c927c6f-4371-4bcd-805d-e9cd53fc2ddc	95669663-6ac4-444c-85a9-995822caee6a	1	99.90	99.90	{}	\N	pending	2025-10-02 04:57:29.610481+00	2025-10-02 04:57:29.610481+00	550e8400-e29b-41d4-a716-446655440000	INR	\N
96e4a895-9a4b-4063-88ef-b01096eb5df7	3c927c6f-4371-4bcd-805d-e9cd53fc2ddc	df4df09d-8acb-44e4-9451-badd5cc42f24	1	5.50	5.50	{}	\N	pending	2025-10-02 04:57:29.610481+00	2025-10-02 04:57:29.610481+00	550e8400-e29b-41d4-a716-446655440000	INR	\N
0f6b0ecc-24a0-4cf4-a7ee-254d2b83bcc5	3c927c6f-4371-4bcd-805d-e9cd53fc2ddc	7b24f3bd-b5f1-42e3-9b10-5b36d5dee5e9	1	3.30	3.30	{}	\N	pending	2025-10-02 04:57:29.610481+00	2025-10-02 04:57:29.610481+00	550e8400-e29b-41d4-a716-446655440000	INR	\N
6b0e0a9e-c004-472d-85a7-d7ea7de7577f	3c927c6f-4371-4bcd-805d-e9cd53fc2ddc	29c8c338-d13a-4e06-8862-4936b042c2e1	1	33.30	33.30	{}	\N	pending	2025-10-02 04:57:29.610481+00	2025-10-02 04:57:29.610481+00	550e8400-e29b-41d4-a716-446655440000	INR	\N
7a2fd5dc-31f5-4882-bf88-b5c784247faa	6aedbade-615d-4bcd-9986-d2e45d2ec36e	95669663-6ac4-444c-85a9-995822caee6a	2	99.90	199.80	{}	\N	pending	2025-10-02 04:28:13.280648+00	2025-10-02 04:28:13.280648+00	550e8400-e29b-41d4-a716-446655440000	INR	\N
\.


--
-- TOC entry 5548 (class 0 OID 33826)
-- Dependencies: 411
-- Data for Name: order_status_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_status_events (id, order_id, previous_status, new_status, changed_by, changed_at, updated_at, from_status, to_status, source, notes, created_by_user_id, tenant_id, created_at, changed_by_staff_id, changed_by_user, reason, meta) FROM stdin;
\.


--
-- TOC entry 5530 (class 0 OID 17659)
-- Dependencies: 389
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, tenant_id, customer_id, table_id, staff_id, order_number, order_type, status, subtotal, tax_amount, discount_amount, tip_amount, total_amount, payment_status, special_instructions, estimated_ready_time, ready_at, served_at, cancelled_at, cancellation_reason, created_at, updated_at, idempotency_key, mode, total_cents, session_id, total, order_code, currency, user_id, archived_at, customer_name, table_code, cart_id) FROM stdin;
fadbbb77-02aa-4704-8734-c81ffd6a6a73	550e8400-e29b-41d4-a716-446655440000	\N	\N	\N	ORD-20251002-fadbbb77	takeaway	pending	986.91	98.69	0.00	0.00	1085.60	pending	\N	\N	\N	\N	\N	\N	2025-10-02 04:39:05.495089+00	2025-10-02 04:39:05.944026+00	\N	takeaway	108560	da5f84cc-aba2-4179-8804-8091d2dc7ce5	1085.60	ORD-ea30d0b4	INR	2ecdf029-319c-4be7-8cc7-47c474345df5	\N	Replit Bulk Order	\N	\N
3c927c6f-4371-4bcd-805d-e9cd53fc2ddc	550e8400-e29b-41d4-a716-446655440000	\N	\N	\N	ORD-20251002-3c927c6f	takeaway	pending	129.09	12.91	0.00	0.00	142.00	pending	\N	\N	\N	\N	\N	\N	2025-10-02 04:57:29.610481+00	2025-10-02 04:57:30.085581+00	\N	takeaway	14200	14532f19-8420-41b2-b5d6-be4fe5a3608b	142.00	ORD-c4a9312d	INR	2ecdf029-319c-4be7-8cc7-47c474345df5	\N	Replit customer 1	\N	\N
6aedbade-615d-4bcd-9986-d2e45d2ec36e	550e8400-e29b-41d4-a716-446655440000	\N	\N	\N	ORD-20251002-6aedbade	takeaway	pending	181.64	18.16	0.00	0.00	199.80	pending	\N	\N	\N	\N	\N	\N	2025-10-02 04:28:13.280648+00	2025-10-02 04:28:13.784473+00	\N	takeaway	19980	3366b030-7aae-42cc-89ac-18d6df502c8b	199.80	ORD-adbecb39	INR	2ecdf029-319c-4be7-8cc7-47c474345df5	\N	Khaja Replit Order	\N	\N
\.


--
-- TOC entry 5555 (class 0 OID 37378)
-- Dependencies: 418
-- Data for Name: payment_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_events (id, provider, event_id, tenant_id, order_id, payload, received_at, processed_at, payment_intent_id, event_type, raw_payload, created_at, event_data) FROM stdin;
37bc0d06-ada3-4561-b590-3f21579e259c	stripe	\N	\N	\N	{"event": "payment_started"}	2025-08-27 12:52:59.685472+00	\N	5d538538-626b-4a67-b43d-fb6b53a64f49	payment_started	{}	2025-08-27 12:52:59.685472+00	{"event": "payment_started"}
1ddc7ac4-425b-4c35-a3c2-4dea29c36615	stripe	\N	\N	\N	{"details": "Test event", "event_type": "payment_started"}	2025-08-27 12:55:48.918923+00	\N	5d538538-626b-4a67-b43d-fb6b53a64f49	payment_started	{}	2025-08-27 12:55:48.918923+00	{"details": "Test event", "event_type": "payment_started"}
1eec4841-8059-488d-905b-42cff0825d9f	stripe	\N	\N	\N	{"details": "mock success", "event_type": "payment_succeeded"}	2025-08-27 12:57:23.425637+00	\N	5d538538-626b-4a67-b43d-fb6b53a64f49	payment_succeeded	{}	2025-08-27 12:57:23.425637+00	{"details": "mock success", "event_type": "payment_succeeded"}
e7430f68-f35b-4600-8078-c8fed68e7121	stripe	e7430f68-f35b-4600-8078-c8fed68e7121	550e8400-e29b-41d4-a716-446655440000	\N	{"source": "manual-test"}	2025-08-29 15:09:56.296737+00	\N	162a14bd-2265-4b34-8c1a-d9f2dea07d8d	payment_processing	{}	2025-08-29 15:09:56.115+00	{}
347df269-8720-4235-ab6c-7abd2d770026	stripe	\N	\N	\N	{"amount": 1999.00, "source": "manual-db-test"}	2025-08-29 15:20:00.797511+00	\N	a9bbd472-efaa-459a-952c-35b44775b3ae	payment_succeeded	{}	2025-08-29 15:20:00.797511+00	{}
22513c37-e233-46ef-90cc-b3c42ef44ab7	stripe	\N	550e8400-e29b-41d4-a716-446655440000	\N	{"amount": 1999.00, "source": "manual-db-test"}	2025-08-29 15:23:42.567552+00	\N	a9bbd472-efaa-459a-952c-35b44775b3ae	payment_succeeded	{}	2025-08-29 15:23:42.567552+00	{}
96a25632-eb03-4e10-91ad-7327300972f7	stripe	\N	550e8400-e29b-41d4-a716-446655440000	\N	{"amount": 1999.00, "source": "manual-test"}	2025-08-29 15:29:22.350685+00	\N	162a14bd-2265-4b34-8c1a-d9f2dea07d8d	payment_processing	{}	2025-08-29 15:29:22.350685+00	{}
\.


--
-- TOC entry 5554 (class 0 OID 37148)
-- Dependencies: 417
-- Data for Name: payment_intents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_intents (id, tenant_id, order_id, provider, provider_intent_id, amount, currency, status, client_secret_last4, metadata, created_by_user_id, created_at, updated_at, provider_id, cart_id) FROM stdin;
5d538538-626b-4a67-b43d-fb6b53a64f49	550e8400-e29b-41d4-a716-446655440000	\N	stripe	\N	1999.00	USD	succeeded	\N	{}	\N	2025-08-27 12:41:35.666248+00	2025-08-27 12:57:23.425637+00	b146b206-8e79-4c04-8612-b2ca5658e8f0	\N
6ac70b72-b662-4454-931b-e5692b3bf566	550e8400-e29b-41d4-a716-446655440000	\N	mock	\N	105.00	INR	requires_payment_method	\N	{}	\N	2025-09-20 02:33:45.222+00	2025-09-20 02:33:45.222+00	\N	707e2e37-05a1-41c3-88f4-4a4106278c2a
8c14dd88-4bc4-4f2c-8416-c2b228a67ef7	550e8400-e29b-41d4-a716-446655440000	\N	mock	\N	105.00	INR	requires_payment_method	\N	{}	\N	2025-09-20 02:36:23.557+00	2025-09-20 02:36:23.557+00	\N	707e2e37-05a1-41c3-88f4-4a4106278c2a
c18281a2-5958-4043-aceb-f10a3285add1	550e8400-e29b-41d4-a716-446655440000	\N	mock	\N	105.00	INR	requires_payment_method	\N	{}	\N	2025-09-20 03:12:42.233+00	2025-09-20 03:12:42.233+00	\N	707e2e37-05a1-41c3-88f4-4a4106278c2a
8807ace7-fe15-4495-b78e-57bf546352fc	550e8400-e29b-41d4-a716-446655440000	\N	mock	\N	105.00	INR	requires_payment_method	\N	{}	\N	2025-09-20 03:36:56.416+00	2025-09-20 03:36:56.416+00	\N	707e2e37-05a1-41c3-88f4-4a4106278c2a
3f3fdceb-e15c-45f1-8522-0c57941ed6a3	550e8400-e29b-41d4-a716-446655440000	\N	stripe	\N	1999.00	USD	requires_payment_method	\N	{}	\N	2025-08-29 15:14:31.543345+00	2025-09-20 06:40:13.684194+00	\N	\N
a9bbd472-efaa-459a-952c-35b44775b3ae	550e8400-e29b-41d4-a716-446655440000	\N	stripe	\N	1999.00	USD	requires_payment_method	\N	{}	\N	2025-08-29 15:14:58.619515+00	2025-09-20 06:40:13.684194+00	\N	\N
0f543664-07c2-43f0-8e86-2ca8717ce46b	550e8400-e29b-41d4-a716-446655440000	\N	stripe	\N	1999.00	USD	requires_payment_method	\N	{}	\N	2025-08-29 15:16:21.03216+00	2025-09-20 06:40:13.684194+00	\N	\N
162a14bd-2265-4b34-8c1a-d9f2dea07d8d	550e8400-e29b-41d4-a716-446655440000	\N	stripe	\N	1999.00	USD	processing	\N	{}	\N	2025-08-29 14:49:29.457621+00	2025-09-20 06:40:13.684194+00	\N	\N
34b19564-12cc-4735-8a2b-1bc280b2f705	550e8400-e29b-41d4-a716-446655440000	\N	mock	\N	105.00	INR	succeeded	\N	{}	\N	2025-09-20 03:39:21.492+00	2025-09-20 06:40:13.684194+00	\N	707e2e37-05a1-41c3-88f4-4a4106278c2a
\.


--
-- TOC entry 5553 (class 0 OID 34014)
-- Dependencies: 416
-- Data for Name: payment_providers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_providers (id, tenant_id, provider, api_key, secret_key, metadata, is_active, created_at, updated_at, display_name, publishable_key, secret_last4, is_live, is_enabled, is_default) FROM stdin;
b146b206-8e79-4c04-8612-b2ca5658e8f0	550e8400-e29b-41d4-a716-446655440000	stripe	sk_test_1234567890	sk_test_secret_1234567890	{}	t	2025-08-27 12:37:47.179413+00	2025-08-27 12:37:47.179413+00	Stripe Payments	pk_test_1234567890	7890	f	t	t
\.


--
-- TOC entry 5549 (class 0 OID 33845)
-- Dependencies: 412
-- Data for Name: payment_refunds; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_refunds (id, payment_id, refund_amount, refund_reason, refunded_by, refunded_at, status, tenant_id, order_id, amount, reason, processor_refund_id, method, requested_by_user_id, processed_at, approved_by, created_at, updated_at, created_by_staff_id, payment_intent_id) FROM stdin;
\.


--
-- TOC entry 5550 (class 0 OID 33866)
-- Dependencies: 413
-- Data for Name: payment_splits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_splits (id, payment_id, method, amount, metadata, order_id, tenant_id, payer_type, staff_user_id, note, payer_user, payer_staff_id, created_at) FROM stdin;
\.


--
-- TOC entry 5532 (class 0 OID 17722)
-- Dependencies: 391
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, tenant_id, order_id, amount, payment_method, payment_provider, provider_transaction_id, status, processed_at, metadata, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5552 (class 0 OID 33897)
-- Dependencies: 415
-- Data for Name: printer_configs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.printer_configs (id, tenant_id, printer_name, printer_ip, printer_port, is_enabled, created_at) FROM stdin;
\.


--
-- TOC entry 5556 (class 0 OID 37610)
-- Dependencies: 419
-- Data for Name: qr_scans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.qr_scans (id, tenant_id, table_id, scanned_by_user, session_id, device_info, created_at) FROM stdin;
\.


--
-- TOC entry 5551 (class 0 OID 33880)
-- Dependencies: 414
-- Data for Name: receipt_deliveries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.receipt_deliveries (id, order_id, delivery_method, delivery_address, sent_at, status) FROM stdin;
\.


--
-- TOC entry 5562 (class 0 OID 65126)
-- Dependencies: 429
-- Data for Name: reservations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservations (id, tenant_id, table_id, customer_name, guest_count, reservation_time, status, created_at, updated_at, starts_at, ends_at) FROM stdin;
\.


--
-- TOC entry 5580 (class 0 OID 117494)
-- Dependencies: 450
-- Data for Name: restaurant_tables_backup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.restaurant_tables_backup (id, tenant_id, table_number, capacity, location, status, qr_code, notes, created_at, updated_at, is_locked, is_occupied, zone_id) FROM stdin;
259979a9-709b-42af-bd57-4778bec72b9c	550e8400-e29b-41d4-a716-446655440000	T02	4	Main Floor	available	\N	\N	2025-08-21 02:15:33.620991+00	2025-08-21 02:15:33.620991+00	f	f	\N
0909e943-3161-48e6-8bb1-7ec9a720da5f	a7871f2c-5da9-4f27-8566-7bdbe0e34700	T01	4	Main Hall	available	QR_T01_ABC123	\N	2025-08-24 01:42:07.469133+00	2025-08-24 01:42:07.469133+00	f	f	\N
a409f671-4e0c-4dee-b12d-3d1fff426fb0	a7871f2c-5da9-4f27-8566-7bdbe0e34700	T02	2	Window View	available	QR_T02_DEF456	\N	2025-08-24 01:42:07.469133+00	2025-08-24 01:42:07.469133+00	f	f	\N
4f59465e-6d01-4b4e-9a61-f84e11ded916	a7871f2c-5da9-4f27-8566-7bdbe0e34700	T03	6	Private Room	available	QR_T03_GHI789	\N	2025-08-24 01:42:07.469133+00	2025-08-24 01:42:07.469133+00	f	f	\N
6bb41c70-39eb-4a62-b367-152995c1d1a7	a7871f2c-5da9-4f27-8566-7bdbe0e34700	T04	4	Patio	available	QR_T04_JKL012	\N	2025-08-24 01:42:07.469133+00	2025-08-24 01:42:07.469133+00	f	f	\N
03ba6554-0456-45e2-a606-55433c9c846b	a7871f2c-5da9-4f27-8566-7bdbe0e34700	T05	8	Main Hall	available	QR_T05_MNO345	\N	2025-08-24 01:42:07.469133+00	2025-08-24 01:42:07.469133+00	f	f	\N
81391429-3cda-443d-9d6a-c0c1973722fc	a7871f2c-5da9-4f27-8566-7bdbe0e34700	T06	4	Main Hall	available	QR_T06_PQR678	\N	2025-08-24 01:42:07.469133+00	2025-08-24 01:42:07.469133+00	f	f	\N
46a1f02c-dfb1-4a1f-b8c6-ab6fef299818	a7871f2c-5da9-4f27-8566-7bdbe0e34700	T07	2	Bar Area	available	QR_T07_STU901	\N	2025-08-24 01:42:07.469133+00	2025-08-24 01:42:07.469133+00	f	f	\N
d675749a-220f-44f3-99eb-e70f37079a40	a7871f2c-5da9-4f27-8566-7bdbe0e34700	T08	4	Garden View	available	QR_T08_VWX234	\N	2025-08-24 01:42:07.469133+00	2025-08-24 01:42:07.469133+00	f	f	\N
b62fa789-64a5-44d0-9260-5a6309b25468	a7871f2c-5da9-4f27-8566-7bdbe0e34700	T09	4	Garden View	available	QR_T09_YZA567	\N	2025-08-24 01:42:07.469133+00	2025-08-24 01:42:07.469133+00	f	f	\N
4e257e4d-a9ac-4128-893f-ef36165a8bbe	a7871f2c-5da9-4f27-8566-7bdbe0e34700	T10	6	Garden View	available	QR_T10_BCD890	\N	2025-08-24 01:42:07.469133+00	2025-08-24 01:42:07.469133+00	f	f	\N
11111111-1111-1111-1111-111111111111	94a488fe-466e-450f-9554-e9a87848129d	T01	2	\N	available	\N	\N	2025-09-07 11:55:47.739817+00	2025-09-07 11:55:47.739817+00	f	f	\N
22222222-2222-2222-2222-222222222222	46d63ce2-8d03-4ce0-80fb-3fd512fd4a32	T01	2	\N	available	\N	\N	2025-09-07 11:55:47.739817+00	2025-09-07 11:55:47.739817+00	f	f	\N
c4d6ef17-7c0d-4192-87f4-1e2e4265027a	550e8400-e29b-41d4-a716-446655440000	T01	2	Main Floor	available	abc123	\N	2025-08-21 02:15:33.620991+00	2025-09-08 03:21:59.09253+00	f	f	\N
\.


--
-- TOC entry 5542 (class 0 OID 27206)
-- Dependencies: 401
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff (id, tenant_id, user_id, role, created_at, name, status) FROM stdin;
f47b820c-6058-4543-b7ac-94402e5543ef	550e8400-e29b-41d4-a716-446655440000	aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa	admin	2025-08-25 11:50:31.977817+00	\N	available
739a23a4-89ac-47fc-affc-caa3241ffd0a	a7871f2c-5da9-4f27-8566-7bdbe0e34700	bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb	admin	2025-08-25 11:50:31.977817+00	\N	available
c8f76f76-c48a-4796-a337-130896b2ad82	550e8400-e29b-41d4-a716-446655440000	79bbda7d-ea19-4dfd-a479-b5fafe7460c6	admin	2025-08-26 03:25:08.098582+00	\N	available
9f973291-4b97-4b16-989d-39d77b41f4ba	550e8400-e29b-41d4-a716-446655440000	e1328e76-0967-4b16-a10d-a400e04905d1	admin	2025-08-31 13:26:47.529318+00	\N	available
1d0284ad-9c54-4b12-930d-4e23b4af72f2	550e8400-e29b-41d4-a716-446655440000	26163ea2-2882-4487-a9c1-2f83ec83d435	admin	2025-08-31 14:17:51.498591+00	\N	available
9792b073-e5b5-4e94-9a80-cd608784f266	550e8400-e29b-41d4-a716-446655440000	bda8c4d3-f38a-4bde-82ff-261503c8aeef	admin	2025-09-01 05:47:30.86848+00	\N	available
c12d0dac-94b9-40d9-8e63-311a9f304034	550e8400-e29b-41d4-a716-446655440000	8c9cd4ca-9eb5-4be9-89e3-53b7848a7b00	admin	2025-09-02 02:25:50.366633+00	\N	available
9a407258-4fb4-4ea4-9619-8e8d16cd92f2	550e8400-e29b-41d4-a716-446655440000	8781912b-358c-4967-bba9-76bc6942c050	waiter	2025-09-20 07:10:32.596629+00	\N	available
9caea109-e9b0-40f6-9602-4ac15c206210	550e8400-e29b-41d4-a716-446655440000	c735d661-24fb-4242-8f25-9ef81b0c9b6b	waiter	2025-09-20 07:10:32.596629+00	\N	available
2490a34c-1e5b-49dd-ac79-d41abbee5447	550e8400-e29b-41d4-a716-446655440000	1e0ef91f-4d27-48e5-b4cc-4561facc6860	counter	2025-09-20 07:10:32.596629+00	\N	available
d2efbc39-b4ae-414b-8a05-6e5520544bd1	550e8400-e29b-41d4-a716-446655440000	38a2cc2b-7f7a-44f4-8fc2-b1dffadb1ba4	kitchen	2025-09-20 07:10:32.596629+00	\N	available
\.


--
-- TOC entry 5534 (class 0 OID 17762)
-- Dependencies: 393
-- Data for Name: staff_schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff_schedules (id, tenant_id, staff_id, shift_date, start_time, end_time, break_duration, hourly_rate, notes, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5571 (class 0 OID 105862)
-- Dependencies: 440
-- Data for Name: subscription_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_events (id, tenant_id, event_type, details, created_at) FROM stdin;
50c6839f-c8b3-4710-a2c7-a075870ca4af	550e8400-e29b-41d4-a716-446655440000	trial_started	{"days": 7, "plan_id": "93c9aa0c-176a-4732-8601-b05df30f1c18"}	2025-09-22 04:36:49.257486+00
851d49bc-a96a-40a5-9d14-a8412c44fd0d	550e8400-e29b-41d4-a716-446655440000	manual_promo	{"plan": "elite", "years": 5}	2025-09-22 04:39:16.290634+00
\.


--
-- TOC entry 5569 (class 0 OID 105732)
-- Dependencies: 438
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_plans (id, code, name, description, price_monthly, price_yearly, features, is_active, created_at) FROM stdin;
93c9aa0c-176a-4732-8601-b05df30f1c18	basic	Basic	Core POS + Live orders. Good for small counters.	0.00	0.00	{"limits": {"staff": 3, "locations": 1, "active_orders": 30}, "features": {"kds": false, "branding": false, "analytics": false, "live_orders": true, "order_management": true, "priority_support": false}}	t	2025-09-22 03:42:00.889086+00
ba72a561-93b6-4090-8fe6-b061f699dd4e	pro	Pro	Everything in Basic + KDS, analytics, and more capacity.	29.00	290.00	{"limits": {"staff": 15, "locations": 3, "active_orders": 200}, "features": {"kds": true, "branding": true, "analytics": true, "live_orders": true, "order_management": true, "priority_support": false}}	t	2025-09-22 03:42:00.889086+00
612f5c06-e233-4950-8d1e-b152592c8252	elite	Elite	Full suite: high capacity, priority support, multi-location.	79.00	790.00	{"limits": {"staff": 100, "locations": 10, "active_orders": 2000}, "features": {"kds": true, "branding": true, "analytics": true, "live_orders": true, "order_management": true, "priority_support": true}}	t	2025-09-22 03:42:00.889086+00
\.


--
-- TOC entry 5541 (class 0 OID 22961)
-- Dependencies: 400
-- Data for Name: table_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.table_sessions (id, tenant_id, table_id, pin_hash, status, created_at, locked_at, expires_at, created_by, cart_version, ended_at) FROM stdin;
\.


--
-- TOC entry 5544 (class 0 OID 27239)
-- Dependencies: 403
-- Data for Name: tables; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tables (id, tenant_id, code, label, seats, status, is_locked, is_occupied, computed_status, zone, created_at, updated_at, table_number) FROM stdin;
cca2b9ce-dedd-4fd4-a7bd-8a1472144fe6	550e8400-e29b-41d4-a716-446655440000	T04	T04	4	held	f	f	\N	\N	2025-10-01 12:09:39.988436+00	2025-10-01 15:31:53.506319+00	\N
136e6369-a3c9-405d-8942-ca9303396381	550e8400-e29b-41d4-a716-446655440000	T05	T05	4	available	f	f	\N	\N	2025-10-01 12:46:03.893069+00	2025-10-01 15:31:53.506319+00	\N
fc660fbd-a283-45ee-9620-883576a2c6a7	550e8400-e29b-41d4-a716-446655440000	T06	T06	4	cleaning	f	f	\N	\N	2025-10-01 12:46:03.893069+00	2025-10-01 15:31:53.506319+00	\N
62e7edf6-85aa-4c4f-9d84-bb19152ab2b3	550e8400-e29b-41d4-a716-446655440000	T07	T07	4	available	f	f	\N	\N	2025-10-01 12:46:03.893069+00	2025-10-01 15:31:53.506319+00	\N
d42ad75e-0c85-47cb-b32d-91040fe2c947	550e8400-e29b-41d4-a716-446655440000	T08	T08	4	available	f	f	\N	\N	2025-10-01 13:03:09.716024+00	2025-10-01 15:31:53.506319+00	\N
8da52ad7-6104-4a93-bf8b-667017d04eda	550e8400-e29b-41d4-a716-446655440000	T09	T09	4	available	f	f	\N	\N	2025-10-01 13:18:34.085681+00	2025-10-01 15:31:53.506319+00	\N
a1bf391a-a533-43a9-a067-a8973391deb9	550e8400-e29b-41d4-a716-446655440000	T10	T10	4	available	f	f	\N	\N	2025-10-01 13:31:36.239157+00	2025-10-01 15:31:53.506319+00	\N
\.


--
-- TOC entry 5570 (class 0 OID 105826)
-- Dependencies: 439
-- Data for Name: tenant_entitlements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenant_entitlements (id, tenant_id, feature_key, feature_value, created_at, plan_code, limits, updated_at) FROM stdin;
\.


--
-- TOC entry 5567 (class 0 OID 85662)
-- Dependencies: 434
-- Data for Name: tenant_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenant_settings (tenant_id, currency, tax_mode, total_rate, components, updated_at) FROM stdin;
550e8400-e29b-41d4-a716-446655440000	INR	single	0	[]	2025-09-15 12:38:22.929292+00
550e8400-e29b-41d4-a716-446655440001	INR	single	0	[]	2025-09-15 12:38:22.929292+00
a7871f2c-5da9-4f27-8566-7bdbe0e34700	INR	single	0	[]	2025-09-15 12:38:22.929292+00
94a488fe-466e-450f-9554-e9a87848129d	INR	single	0	[]	2025-09-15 12:38:22.929292+00
46d63ce2-8d03-4ce0-80fb-3fd512fd4a32	INR	single	0	[]	2025-09-15 12:38:22.929292+00
\.


--
-- TOC entry 5568 (class 0 OID 105644)
-- Dependencies: 437
-- Data for Name: tenant_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenant_subscriptions (id, tenant_id, plan_id, status, trial_start_at, trial_end_at, current_period_start, current_period_end, cancel_at_period_end, canceled_at, provider, external_subscription_id, external_customer_id, latest_invoice_id, meta, created_at, updated_at, cancel_at) FROM stdin;
6812eec5-d273-4f9c-b36b-dbf9181afd24	550e8400-e29b-41d4-a716-446655440000	612f5c06-e233-4950-8d1e-b152592c8252	active	\N	\N	2025-09-23 08:01:58.497926+00	2026-09-23 08:01:58.497926+00	f	\N	\N	\N	\N	\N	{}	2025-09-22 04:36:49.257486+00	2025-09-23 08:01:58.497926+00	\N
\.


--
-- TOC entry 5566 (class 0 OID 82659)
-- Dependencies: 433
-- Data for Name: tenant_tax_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenant_tax_config (tenant_id, mode, total_rate, components, updated_at, currency, inclusion) FROM stdin;
550e8400-e29b-41d4-a716-446655440000	components	0.100	[{"name": "CGST", "rate": 0.05}, {"name": "SGST", "rate": 0.05}]	2025-09-28 04:38:25.652016+00	INR	exclusive
\.


--
-- TOC entry 5525 (class 0 OID 17537)
-- Dependencies: 384
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenants (id, name, slug, description, logo_url, website, phone, email, address, settings, subscription_plan, subscription_status, trial_ends_at, created_at, updated_at, code, plan_type) FROM stdin;
550e8400-e29b-41d4-a716-446655440001	Pizza Palace	pizza-palace	Authentic Italian Pizza	\N	\N	+1-555-0124	info@pizzapalace.com	\N	{}	basic	active	\N	2025-08-21 02:15:33.620991+00	2025-08-25 11:24:12.366808+00	PIZZ	basic
a7871f2c-5da9-4f27-8566-7bdbe0e34700	Bella Vista Restaurant	bella-vista	Fine dining restaurant	\N	\N	+1-555-123-4567	info@bellavista.com	\N	{}	basic	active	\N	2025-08-24 01:42:07.469133+00	2025-08-25 11:24:12.366808+00	BELL	basic
94a488fe-466e-450f-9554-e9a87848129d	Test Restaurant 164256	test-restaurant-164256	\N	\N	\N	\N	\N	\N	{}	basic	active	\N	2025-09-02 16:42:57.922078+00	2025-09-02 16:42:57.922078+00	6W7W	basic
46d63ce2-8d03-4ce0-80fb-3fd512fd4a32	Test Restaurant 164409	test-restaurant-164409	\N	\N	\N	\N	\N	\N	{}	basic	active	\N	2025-09-02 16:44:09.889924+00	2025-09-02 16:44:09.889924+00	GLQA	basic
550e8400-e29b-41d4-a716-446655440000	Demo Restaurant	demo-restaurant	A sample restaurant for testing	\N	\N	+1-555-0123	shaik173khaja@gmail.com	\N	{}	basic	active	\N	2025-08-21 02:15:33.620991+00	2025-09-22 11:24:15.635577+00	DEMO	basic
\.


--
-- TOC entry 5563 (class 0 OID 67236)
-- Dependencies: 430
-- Data for Name: tm_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tm_settings (tenant_id, hold_minutes, cleaning_minutes, allow_transfers, allow_merge_split, require_manager_override, updated_at, data, created_at) FROM stdin;
550e8400-e29b-41d4-a716-446655440000	15	10	t	t	f	2025-10-01 13:31:14.827628+00	{"hold_minutes": 15, "allow_transfers": true, "cleaning_minutes": 5, "allow_merge_split": true, "require_manager_override": false}	2025-09-09 09:31:27.507985+00
\.


--
-- TOC entry 5526 (class 0 OID 17552)
-- Dependencies: 385
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, tenant_id, email, password_hash, first_name, last_name, phone, avatar_url, role, permissions, is_active, last_login_at, email_verified_at, created_at, updated_at) FROM stdin;
550e8400-e29b-41d4-a716-446655440010	550e8400-e29b-41d4-a716-446655440000	admin@demo-restaurant.com	\N	Admin	User	\N	\N	tenant_admin	[]	t	\N	\N	2025-08-21 02:15:33.620991+00	2025-08-21 02:15:33.620991+00
550e8400-e29b-41d4-a716-446655440011	550e8400-e29b-41d4-a716-446655440000	manager@demo-restaurant.com	\N	Manager	User	\N	\N	manager	[]	t	\N	\N	2025-08-21 02:15:33.620991+00	2025-08-21 02:15:33.620991+00
550e8400-e29b-41d4-a716-446655440012	550e8400-e29b-41d4-a716-446655440000	staff@demo-restaurant.com	\N	Staff	User	\N	\N	staff	[]	t	\N	\N	2025-08-21 02:15:33.620991+00	2025-08-21 02:15:33.620991+00
52b199c1-2f03-45d7-b38a-d050fba49226	a7871f2c-5da9-4f27-8566-7bdbe0e34700	admin@restaurant.com	\N	Admin	User	\N	\N	tenant_admin	[]	t	\N	\N	2025-08-24 01:42:07.469133+00	2025-08-24 01:42:07.469133+00
62baf243-e542-4d63-abf2-205662f3ee13	a7871f2c-5da9-4f27-8566-7bdbe0e34700	manager@restaurant.com	\N	Manager	User	\N	\N	manager	[]	t	\N	\N	2025-08-24 01:42:07.469133+00	2025-08-24 01:42:07.469133+00
c79938c9-9020-449f-863f-11405e8e85c3	a7871f2c-5da9-4f27-8566-7bdbe0e34700	chef@restaurant.com	\N	Chef	User	\N	\N	staff	[]	t	\N	\N	2025-08-24 01:42:07.469133+00	2025-08-24 01:42:07.469133+00
\.


--
-- TOC entry 5582 (class 0 OID 118432)
-- Dependencies: 452
-- Data for Name: zones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.zones (id, tenant_id, name, color, ord, created_at, updated_at) FROM stdin;
816218e0-ab61-4acd-8ee5-2bcecac422e9	550e8400-e29b-41d4-a716-446655440000	Zone Faikha	#8B5CF6	0	2025-10-01 13:04:47.518571+00	2025-10-01 13:04:47.518571+00
777783a8-b61e-4ca6-883c-c6e20e44112f	550e8400-e29b-41d4-a716-446655440000	Zone SKFA	#8B5CF6	0	2025-10-01 12:45:32.42337+00	2025-10-01 12:45:32.42337+00
7da07ad3-7be3-427a-bf56-5b60a73e4cc3	550e8400-e29b-41d4-a716-446655440000	Zone Arham	#F59E0B	1	2025-10-01 13:31:16.275767+00	2025-10-01 13:31:16.275767+00
\.


--
-- TOC entry 5574 (class 0 OID 111031)
-- Dependencies: 444
-- Data for Name: messages_2025_09_28; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_09_28 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 5575 (class 0 OID 111104)
-- Dependencies: 445
-- Data for Name: messages_2025_09_29; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_09_29 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 5576 (class 0 OID 112219)
-- Dependencies: 446
-- Data for Name: messages_2025_09_30; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_09_30 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 5577 (class 0 OID 113555)
-- Dependencies: 447
-- Data for Name: messages_2025_10_01; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_10_01 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 5578 (class 0 OID 114670)
-- Dependencies: 448
-- Data for Name: messages_2025_10_02; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_10_02 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 5579 (class 0 OID 115785)
-- Dependencies: 449
-- Data for Name: messages_2025_10_03; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_10_03 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 5581 (class 0 OID 117882)
-- Dependencies: 451
-- Data for Name: messages_2025_10_04; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_10_04 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 5583 (class 0 OID 120077)
-- Dependencies: 453
-- Data for Name: messages_2025_10_05; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_10_05 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 5521 (class 0 OID 17087)
-- Dependencies: 376
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-08-20 12:35:55
20211116045059	2025-08-20 12:35:58
20211116050929	2025-08-20 12:36:00
20211116051442	2025-08-20 12:36:01
20211116212300	2025-08-20 12:36:04
20211116213355	2025-08-20 12:36:05
20211116213934	2025-08-20 12:36:07
20211116214523	2025-08-20 12:36:10
20211122062447	2025-08-20 12:36:11
20211124070109	2025-08-20 12:36:13
20211202204204	2025-08-20 12:36:15
20211202204605	2025-08-20 12:36:16
20211210212804	2025-08-20 12:36:22
20211228014915	2025-08-20 12:36:24
20220107221237	2025-08-20 12:36:26
20220228202821	2025-08-20 12:36:27
20220312004840	2025-08-20 12:36:29
20220603231003	2025-08-20 12:36:32
20220603232444	2025-08-20 12:36:33
20220615214548	2025-08-20 12:36:36
20220712093339	2025-08-20 12:36:37
20220908172859	2025-08-20 12:36:39
20220916233421	2025-08-20 12:36:41
20230119133233	2025-08-20 12:36:42
20230128025114	2025-08-20 12:36:45
20230128025212	2025-08-20 12:36:47
20230227211149	2025-08-20 12:36:48
20230228184745	2025-08-20 12:36:50
20230308225145	2025-08-20 12:36:52
20230328144023	2025-08-20 12:36:54
20231018144023	2025-08-20 12:36:56
20231204144023	2025-08-20 12:36:58
20231204144024	2025-08-20 12:37:00
20231204144025	2025-08-20 12:37:02
20240108234812	2025-08-20 12:37:04
20240109165339	2025-08-20 12:37:05
20240227174441	2025-08-20 12:37:08
20240311171622	2025-08-20 12:37:11
20240321100241	2025-08-20 12:37:15
20240401105812	2025-08-20 12:37:20
20240418121054	2025-08-20 12:37:22
20240523004032	2025-08-20 12:37:28
20240618124746	2025-08-20 12:37:30
20240801235015	2025-08-20 12:37:32
20240805133720	2025-08-20 12:37:33
20240827160934	2025-08-20 12:37:35
20240919163303	2025-08-20 12:37:38
20240919163305	2025-08-20 12:37:39
20241019105805	2025-08-20 12:37:41
20241030150047	2025-08-20 12:37:48
20241108114728	2025-08-20 12:37:50
20241121104152	2025-08-20 12:37:52
20241130184212	2025-08-20 12:37:54
20241220035512	2025-08-20 12:37:56
20241220123912	2025-08-20 12:37:57
20241224161212	2025-08-20 12:37:59
20250107150512	2025-08-20 12:38:01
20250110162412	2025-08-20 12:38:03
20250123174212	2025-08-20 12:38:04
20250128220012	2025-08-20 12:38:06
20250506224012	2025-08-20 12:38:07
20250523164012	2025-08-20 12:38:09
20250714121412	2025-08-20 12:38:11
20250905041441	2025-09-23 22:03:31
\.


--
-- TOC entry 5523 (class 0 OID 17109)
-- Dependencies: 379
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
\.


--
-- TOC entry 5505 (class 0 OID 16546)
-- Dependencies: 358
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
\.


--
-- TOC entry 5539 (class 0 OID 19036)
-- Dependencies: 398
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_analytics (id, type, format, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5507 (class 0 OID 16588)
-- Dependencies: 360
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-08-20 12:35:50.585837
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-08-20 12:35:50.662284
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2025-08-20 12:35:50.675623
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-08-20 12:35:50.771975
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-08-20 12:35:51.119459
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-08-20 12:35:51.128458
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2025-08-20 12:35:51.135398
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-08-20 12:35:51.142223
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-08-20 12:35:51.147356
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2025-08-20 12:35:51.154648
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2025-08-20 12:35:51.165534
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-08-20 12:35:51.17302
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-08-20 12:35:51.226293
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-08-20 12:35:51.238049
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-08-20 12:35:51.250085
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-08-20 12:35:51.346623
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-08-20 12:35:51.351914
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-08-20 12:35:51.356855
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-08-20 12:35:51.375913
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-08-20 12:35:51.389513
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-08-20 12:35:51.396137
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-08-20 12:35:51.406884
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-08-20 12:35:51.444084
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-08-20 12:35:51.471723
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-08-20 12:35:51.47939
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-08-20 12:35:51.485298
26	objects-prefixes	ef3f7871121cdc47a65308e6702519e853422ae2	2025-08-21 10:10:15.72189
27	search-v2	33b8f2a7ae53105f028e13e9fcda9dc4f356b4a2	2025-08-21 10:10:15.798844
28	object-bucket-name-sorting	ba85ec41b62c6a30a3f136788227ee47f311c436	2025-08-21 10:10:15.810025
29	create-prefixes	a7b1a22c0dc3ab630e3055bfec7ce7d2045c5b7b	2025-08-21 10:10:15.818934
30	update-object-levels	6c6f6cc9430d570f26284a24cf7b210599032db7	2025-08-21 10:10:15.823913
31	objects-level-index	33f1fef7ec7fea08bb892222f4f0f5d79bab5eb8	2025-08-21 10:10:15.828911
32	backward-compatible-index-on-objects	2d51eeb437a96868b36fcdfb1ddefdf13bef1647	2025-08-21 10:10:15.834839
33	backward-compatible-index-on-prefixes	fe473390e1b8c407434c0e470655945b110507bf	2025-08-21 10:10:15.839759
34	optimize-search-function-v1	82b0e469a00e8ebce495e29bfa70a0797f7ebd2c	2025-08-21 10:10:15.841346
35	add-insert-trigger-prefixes	63bb9fd05deb3dc5e9fa66c83e82b152f0caf589	2025-08-21 10:10:15.848758
36	optimise-existing-functions	81cf92eb0c36612865a18016a38496c530443899	2025-08-21 10:10:15.853499
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2025-08-21 10:10:15.865435
38	iceberg-catalog-flag-on-buckets	19a8bd89d5dfa69af7f222a46c726b7c41e462c5	2025-08-21 10:10:15.871745
39	add-search-v2-sort-support	39cf7d1e6bf515f4b02e41237aba845a7b492853	2025-10-02 05:41:50.732087
40	fix-prefix-race-conditions-optimized	fd02297e1c67df25a9fc110bf8c8a9af7fb06d1f	2025-10-02 05:41:50.78373
41	add-object-level-update-trigger	44c22478bf01744b2129efc480cd2edc9a7d60e9	2025-10-02 05:41:50.81564
42	rollback-prefix-triggers	f2ab4f526ab7f979541082992593938c05ee4b47	2025-10-02 05:41:50.81999
43	fix-object-level	ab837ad8f1c7d00cc0b7310e989a23388ff29fc6	2025-10-02 05:41:50.83132
\.


--
-- TOC entry 5506 (class 0 OID 16561)
-- Dependencies: 359
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata, level) FROM stdin;
\.


--
-- TOC entry 5538 (class 0 OID 18991)
-- Dependencies: 397
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.prefixes (bucket_id, name, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5519 (class 0 OID 17035)
-- Dependencies: 374
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- TOC entry 5520 (class 0 OID 17049)
-- Dependencies: 375
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- TOC entry 5524 (class 0 OID 17272)
-- Dependencies: 383
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: supabase_migrations; Owner: postgres
--

COPY supabase_migrations.schema_migrations (version, statements, name) FROM stdin;
20250821021152	{"\\\\n\\\\n-- Enable required extensions\\\\nCREATE EXTENSION IF NOT EXISTS \\"uuid-ossp\\"","\\\\nCREATE EXTENSION IF NOT EXISTS \\"pgcrypto\\"","\\\\n\\\\n-- Create custom types\\\\nCREATE TYPE user_role AS ENUM ('super_admin', 'tenant_admin', 'manager', 'staff', 'customer')","\\\\nCREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled')","\\\\nCREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded')","\\\\nCREATE TYPE table_status AS ENUM ('available', 'occupied', 'reserved', 'maintenance')","\\\\nCREATE TYPE notification_type AS ENUM ('order', 'payment', 'system', 'promotion')","\\\\n\\\\n-- Tenants table (main isolation boundary)\\\\nCREATE TABLE tenants (\\\\n  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\\\\n  name TEXT NOT NULL,\\\\n  slug TEXT UNIQUE NOT NULL,\\\\n  description TEXT,\\\\n  logo_url TEXT,\\\\n  website TEXT,\\\\n  phone TEXT,\\\\n  email TEXT,\\\\n  address JSONB,\\\\n  settings JSONB DEFAULT '{}',\\\\n  subscription_plan TEXT DEFAULT 'basic',\\\\n  subscription_status TEXT DEFAULT 'active',\\\\n  trial_ends_at TIMESTAMPTZ,\\\\n  created_at TIMESTAMPTZ DEFAULT NOW(),\\\\n  updated_at TIMESTAMPTZ DEFAULT NOW()\\\\n)","\\\\n\\\\n-- Users table with multi-tenant support\\\\nCREATE TABLE users (\\\\n  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\\\\n  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,\\\\n  email TEXT NOT NULL,\\\\n  password_hash TEXT,\\\\n  first_name TEXT NOT NULL,\\\\n  last_name TEXT NOT NULL,\\\\n  phone TEXT,\\\\n  avatar_url TEXT,\\\\n  role user_role DEFAULT 'staff',\\\\n  permissions JSONB DEFAULT '[]',\\\\n  is_active BOOLEAN DEFAULT true,\\\\n  last_login_at TIMESTAMPTZ,\\\\n  email_verified_at TIMESTAMPTZ,\\\\n  created_at TIMESTAMPTZ DEFAULT NOW(),\\\\n  updated_at TIMESTAMPTZ DEFAULT NOW(),\\\\n  UNIQUE(tenant_id, email)\\\\n)","\\\\n\\\\n-- Categories for menu organization\\\\nCREATE TABLE categories (\\\\n  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\\\\n  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,\\\\n  name TEXT NOT NULL,\\\\n  description TEXT,\\\\n  image_url TEXT,\\\\n  sort_order INTEGER DEFAULT 0,\\\\n  is_active BOOLEAN DEFAULT true,\\\\n  created_at TIMESTAMPTZ DEFAULT NOW(),\\\\n  updated_at TIMESTAMPTZ DEFAULT NOW()\\\\n)","\\\\n\\\\n-- Menu items with rich metadata\\\\nCREATE TABLE menu_items (\\\\n  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\\\\n  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,\\\\n  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,\\\\n  name TEXT NOT NULL,\\\\n  description TEXT,\\\\n  price DECIMAL(10,2) NOT NULL,\\\\n  cost DECIMAL(10,2),\\\\n  image_url TEXT,\\\\n  images JSONB DEFAULT '[]',\\\\n  ingredients JSONB DEFAULT '[]',\\\\n  allergens JSONB DEFAULT '[]',\\\\n  nutritional_info JSONB DEFAULT '{}',\\\\n  dietary_info JSONB DEFAULT '{}', -- vegetarian, vegan, gluten-free, etc.\\\\n  preparation_time INTEGER, -- in minutes\\\\n  calories INTEGER,\\\\n  is_available BOOLEAN DEFAULT true,\\\\n  is_featured BOOLEAN DEFAULT false,\\\\n  sort_order INTEGER DEFAULT 0,\\\\n  variants JSONB DEFAULT '[]', -- size, spice level, etc.\\\\n  created_at TIMESTAMPTZ DEFAULT NOW(),\\\\n  updated_at TIMESTAMPTZ DEFAULT NOW()\\\\n)","\\\\n\\\\n-- Restaurant tables management\\\\nCREATE TABLE restaurant_tables (\\\\n  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\\\\n  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,\\\\n  table_number TEXT NOT NULL,\\\\n  capacity INTEGER NOT NULL,\\\\n  location TEXT, -- section, floor, etc.\\\\n  status table_status DEFAULT 'available',\\\\n  qr_code TEXT,\\\\n  notes TEXT,\\\\n  created_at TIMESTAMPTZ DEFAULT NOW(),\\\\n  updated_at TIMESTAMPTZ DEFAULT NOW(),\\\\n  UNIQUE(tenant_id, table_number)\\\\n)","\\\\n\\\\n-- Customer management\\\\nCREATE TABLE customers (\\\\n  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\\\\n  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,\\\\n  email TEXT,\\\\n  phone TEXT,\\\\n  first_name TEXT,\\\\n  last_name TEXT,\\\\n  date_of_birth DATE,\\\\n  preferences JSONB DEFAULT '{}',\\\\n  loyalty_points INTEGER DEFAULT 0,\\\\n  total_spent DECIMAL(10,2) DEFAULT 0,\\\\n  visit_count INTEGER DEFAULT 0,\\\\n  last_visit_at TIMESTAMPTZ,\\\\n  created_at TIMESTAMPTZ DEFAULT NOW(),\\\\n  updated_at TIMESTAMPTZ DEFAULT NOW(),\\\\n  UNIQUE(tenant_id, email),\\\\n  UNIQUE(tenant_id, phone)\\\\n)","\\\\n\\\\n-- Orders with comprehensive tracking\\\\nCREATE TABLE orders (\\\\n  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\\\\n  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,\\\\n  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,\\\\n  table_id UUID REFERENCES restaurant_tables(id) ON DELETE SET NULL,\\\\n  staff_id UUID REFERENCES users(id) ON DELETE SET NULL,\\\\n  order_number TEXT NOT NULL,\\\\n  order_type TEXT DEFAULT 'dine_in', -- dine_in, takeaway, delivery\\\\n  status order_status DEFAULT 'pending',\\\\n  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,\\\\n  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,\\\\n  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,\\\\n  tip_amount DECIMAL(10,2) NOT NULL DEFAULT 0,\\\\n  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,\\\\n  payment_status payment_status DEFAULT 'pending',\\\\n  special_instructions TEXT,\\\\n  estimated_ready_time TIMESTAMPTZ,\\\\n  ready_at TIMESTAMPTZ,\\\\n  served_at TIMESTAMPTZ,\\\\n  cancelled_at TIMESTAMPTZ,\\\\n  cancellation_reason TEXT,\\\\n  created_at TIMESTAMPTZ DEFAULT NOW(),\\\\n  updated_at TIMESTAMPTZ DEFAULT NOW(),\\\\n  UNIQUE(tenant_id, order_number)\\\\n)","\\\\n\\\\n-- Order items with customizations\\\\nCREATE TABLE order_items (\\\\n  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\\\\n  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,\\\\n  menu_item_id UUID REFERENCES menu_items(id) ON DELETE RESTRICT,\\\\n  quantity INTEGER NOT NULL DEFAULT 1,\\\\n  unit_price DECIMAL(10,2) NOT NULL,\\\\n  total_price DECIMAL(10,2) NOT NULL,\\\\n  customizations JSONB DEFAULT '{}',\\\\n  special_instructions TEXT,\\\\n  status TEXT DEFAULT 'pending', -- pending, preparing, ready, served\\\\n  created_at TIMESTAMPTZ DEFAULT NOW(),\\\\n  updated_at TIMESTAMPTZ DEFAULT NOW()\\\\n)","\\\\n\\\\n-- Payment tracking\\\\nCREATE TABLE payments (\\\\n  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\\\\n  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,\\\\n  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,\\\\n  amount DECIMAL(10,2) NOT NULL,\\\\n  payment_method TEXT NOT NULL, -- cash, card, digital_wallet\\\\n  payment_provider TEXT, -- stripe, square, etc.\\\\n  provider_transaction_id TEXT,\\\\n  status payment_status DEFAULT 'pending',\\\\n  processed_at TIMESTAMPTZ,\\\\n  metadata JSONB DEFAULT '{}',\\\\n  created_at TIMESTAMPTZ DEFAULT NOW(),\\\\n  updated_at TIMESTAMPTZ DEFAULT NOW()\\\\n)","\\\\n\\\\n-- Inventory management\\\\nCREATE TABLE inventory_items (\\\\n  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\\\\n  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,\\\\n  name TEXT NOT NULL,\\\\n  description TEXT,\\\\n  unit TEXT NOT NULL, -- kg, lbs, pieces, etc.\\\\n  current_stock DECIMAL(10,3) NOT NULL DEFAULT 0,\\\\n  minimum_stock DECIMAL(10,3) NOT NULL DEFAULT 0,\\\\n  maximum_stock DECIMAL(10,3),\\\\n  cost_per_unit DECIMAL(10,2),\\\\n  supplier_info JSONB DEFAULT '{}',\\\\n  last_restocked_at TIMESTAMPTZ,\\\\n  created_at TIMESTAMPTZ DEFAULT NOW(),\\\\n  updated_at TIMESTAMPTZ DEFAULT NOW()\\\\n)","\\\\n\\\\n-- Staff schedules\\\\nCREATE TABLE staff_schedules (\\\\n  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\\\\n  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,\\\\n  staff_id UUID REFERENCES users(id) ON DELETE CASCADE,\\\\n  shift_date DATE NOT NULL,\\\\n  start_time TIME NOT NULL,\\\\n  end_time TIME NOT NULL,\\\\n  break_duration INTEGER DEFAULT 0, -- in minutes\\\\n  hourly_rate DECIMAL(8,2),\\\\n  notes TEXT,\\\\n  created_at TIMESTAMPTZ DEFAULT NOW(),\\\\n  updated_at TIMESTAMPTZ DEFAULT NOW()\\\\n)","\\\\n\\\\n-- Real-time notifications\\\\nCREATE TABLE notifications (\\\\n  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\\\\n  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,\\\\n  user_id UUID REFERENCES users(id) ON DELETE CASCADE,\\\\n  type notification_type NOT NULL,\\\\n  title TEXT NOT NULL,\\\\n  message TEXT NOT NULL,\\\\n  data JSONB DEFAULT '{}',\\\\n  is_read BOOLEAN DEFAULT false,\\\\n  expires_at TIMESTAMPTZ,\\\\n  created_at TIMESTAMPTZ DEFAULT NOW()\\\\n)","\\\\n\\\\n-- Audit logs for compliance\\\\nCREATE TABLE audit_logs (\\\\n  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\\\\n  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,\\\\n  user_id UUID REFERENCES users(id) ON DELETE SET NULL,\\\\n  action TEXT NOT NULL,\\\\n  resource_type TEXT NOT NULL,\\\\n  resource_id UUID,\\\\n  old_values JSONB,\\\\n  new_values JSONB,\\\\n  ip_address INET,\\\\n  user_agent TEXT,\\\\n  created_at TIMESTAMPTZ DEFAULT NOW()\\\\n)","\\\\n\\\\n-- Analytics and reporting tables\\\\nCREATE TABLE daily_sales_summary (\\\\n  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\\\\n  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,\\\\n  date DATE NOT NULL,\\\\n  total_orders INTEGER DEFAULT 0,\\\\n  total_revenue DECIMAL(10,2) DEFAULT 0,\\\\n  total_customers INTEGER DEFAULT 0,\\\\n  average_order_value DECIMAL(10,2) DEFAULT 0,\\\\n  top_selling_items JSONB DEFAULT '[]',\\\\n  created_at TIMESTAMPTZ DEFAULT NOW(),\\\\n  UNIQUE(tenant_id, date)\\\\n)","\\\\n\\\\n-- Create indexes for performance\\\\nCREATE INDEX idx_users_tenant_id ON users(tenant_id)","\\\\nCREATE INDEX idx_users_email ON users(email)","\\\\nCREATE INDEX idx_menu_items_tenant_id ON menu_items(tenant_id)","\\\\nCREATE INDEX idx_menu_items_category_id ON menu_items(category_id)","\\\\nCREATE INDEX idx_orders_tenant_id ON orders(tenant_id)","\\\\nCREATE INDEX idx_orders_status ON orders(status)","\\\\nCREATE INDEX idx_orders_created_at ON orders(created_at)","\\\\nCREATE INDEX idx_order_items_order_id ON order_items(order_id)","\\\\nCREATE INDEX idx_notifications_user_id ON notifications(user_id)","\\\\nCREATE INDEX idx_notifications_is_read ON notifications(is_read)","\\\\nCREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id)","\\\\nCREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at)","\\\\n\\\\n-- Enable Row Level Security\\\\nALTER TABLE tenants ENABLE ROW LEVEL SECURITY","\\\\nALTER TABLE users ENABLE ROW LEVEL SECURITY","\\\\nALTER TABLE categories ENABLE ROW LEVEL SECURITY","\\\\nALTER TABLE menu_items ENABLE ROW LEVEL SECURITY","\\\\nALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY","\\\\nALTER TABLE customers ENABLE ROW LEVEL SECURITY","\\\\nALTER TABLE orders ENABLE ROW LEVEL SECURITY","\\\\nALTER TABLE order_items ENABLE ROW LEVEL SECURITY","\\\\nALTER TABLE payments ENABLE ROW LEVEL SECURITY","\\\\nALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY","\\\\nALTER TABLE staff_schedules ENABLE ROW LEVEL SECURITY","\\\\nALTER TABLE notifications ENABLE ROW LEVEL SECURITY","\\\\nALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY","\\\\nALTER TABLE daily_sales_summary ENABLE ROW LEVEL SECURITY","\\\\n\\\\n-- RLS Policies for multi-tenant isolation\\\\nCREATE POLICY \\"Users can access their tenant data\\" ON tenants\\\\n  FOR ALL USING (id = (SELECT tenant_id FROM users WHERE id = auth.uid()))","\\\\n\\\\nCREATE POLICY \\"Users can access their tenant users\\" ON users\\\\n  FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()))","\\\\n\\\\nCREATE POLICY \\"Users can access their tenant categories\\" ON categories\\\\n  FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()))","\\\\n\\\\nCREATE POLICY \\"Users can access their tenant menu items\\" ON menu_items\\\\n  FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()))","\\\\n\\\\nCREATE POLICY \\"Users can access their tenant tables\\" ON restaurant_tables\\\\n  FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()))","\\\\n\\\\nCREATE POLICY \\"Users can access their tenant customers\\" ON customers\\\\n  FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()))","\\\\n\\\\nCREATE POLICY \\"Users can access their tenant orders\\" ON orders\\\\n  FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()))","\\\\n\\\\nCREATE POLICY \\"Users can access order items through orders\\" ON order_items\\\\n  FOR ALL USING (order_id IN (\\\\n    SELECT id FROM orders WHERE tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())\\\\n  ))","\\\\n\\\\nCREATE POLICY \\"Users can access their tenant payments\\" ON payments\\\\n  FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()))","\\\\n\\\\nCREATE POLICY \\"Users can access their tenant inventory\\" ON inventory_items\\\\n  FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()))","\\\\n\\\\nCREATE POLICY \\"Users can access their tenant schedules\\" ON staff_schedules\\\\n  FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()))","\\\\n\\\\nCREATE POLICY \\"Users can access their notifications\\" ON notifications\\\\n  FOR ALL USING (user_id = auth.uid())","\\\\n\\\\nCREATE POLICY \\"Users can access their tenant audit logs\\" ON audit_logs\\\\n  FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()))","\\\\n\\\\nCREATE POLICY \\"Users can access their tenant analytics\\" ON daily_sales_summary\\\\n  FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()))","\\\\n\\\\n-- Functions for business logic\\\\nCREATE OR REPLACE FUNCTION update_updated_at_column()\\\\nRETURNS TRIGGER AS $$\\\\nBEGIN\\\\n  NEW.updated_at = NOW()","\\\\n  RETURN NEW","\\\\nEND","\\\\n$$ language 'plpgsql'","\\\\n\\\\n-- Add updated_at triggers\\\\nCREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","\\\\nCREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","\\\\nCREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","\\\\nCREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","\\\\nCREATE TRIGGER update_restaurant_tables_updated_at BEFORE UPDATE ON restaurant_tables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","\\\\nCREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","\\\\nCREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","\\\\nCREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","\\\\nCREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","\\\\nCREATE TRIGGER update_staff_schedules_updated_at BEFORE UPDATE ON staff_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","\\\\n\\\\n-- Function to generate order numbers\\\\nCREATE OR REPLACE FUNCTION generate_order_number(tenant_uuid UUID)\\\\nRETURNS TEXT AS $$\\\\nDECLARE\\\\n  order_count INTEGER","\\\\n  order_number TEXT","\\\\nBEGIN\\\\n  SELECT COUNT(*) + 1 INTO order_count\\\\n  FROM orders\\\\n  WHERE tenant_id = tenant_uuid\\\\n  AND DATE(created_at) = CURRENT_DATE","\\\\n  \\\\n  order_number := 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(order_count::TEXT, 4, '0')","\\\\n  \\\\n  RETURN order_number","\\\\nEND","\\\\n$$ LANGUAGE plpgsql","\\\\n\\\\n-- Function to calculate order totals\\\\nCREATE OR REPLACE FUNCTION calculate_order_total(order_uuid UUID)\\\\nRETURNS DECIMAL AS $$\\\\nDECLARE\\\\n  total DECIMAL(10,2)","\\\\nBEGIN\\\\n  SELECT COALESCE(SUM(total_price), 0) INTO total\\\\n  FROM order_items\\\\n  WHERE order_id = order_uuid","\\\\n  \\\\n  RETURN total","\\\\nEND","\\\\n$$ LANGUAGE plpgsql","\\\\n\\\\n-- Insert sample data for development\\\\nINSERT INTO tenants (id, name, slug, description, email, phone) VALUES\\\\n  ('550e8400-e29b-41d4-a716-446655440000', 'Demo Restaurant', 'demo-restaurant', 'A sample restaurant for testing', 'demo@restaurant.com', '+1-555-0123'),\\\\n  ('550e8400-e29b-41d4-a716-446655440001', 'Pizza Palace', 'pizza-palace', 'Authentic Italian Pizza', 'info@pizzapalace.com', '+1-555-0124')","\\\\n\\\\nINSERT INTO users (id, tenant_id, email, first_name, last_name, role) VALUES\\\\n  ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'admin@demo-restaurant.com', 'Admin', 'User', 'tenant_admin'),\\\\n  ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'manager@demo-restaurant.com', 'Manager', 'User', 'manager'),\\\\n  ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'staff@demo-restaurant.com', 'Staff', 'User', 'staff')","\\\\n\\\\nINSERT INTO categories (id, tenant_id, name, description, sort_order) VALUES\\\\n  ('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440000', 'Appetizers', 'Start your meal right', 1),\\\\n  ('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440000', 'Main Courses', 'Hearty main dishes', 2),\\\\n  ('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440000', 'Desserts', 'Sweet endings', 3),\\\\n  ('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440000', 'Beverages', 'Refreshing drinks', 4)","\\\\n\\\\nINSERT INTO menu_items (tenant_id, category_id, name, description, price, image_url, preparation_time, calories, dietary_info) VALUES\\\\n  ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440020', 'Caesar Salad', 'Fresh romaine lettuce with parmesan and croutons', 12.99, 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=400', 10, 280, '{\\"vegetarian\\": true}'),\\\\n  ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440021', 'Grilled Salmon', 'Fresh Atlantic salmon with seasonal vegetables', 24.99, 'https://images.pexels.com/photos/1516415/pexels-photo-1516415.jpeg?auto=compress&cs=tinysrgb&w=400', 20, 450, '{\\"gluten_free\\": true}'),\\\\n  ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440022', 'Chocolate Cake', 'Rich chocolate cake with vanilla ice cream', 8.99, 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=400', 5, 520, '{\\"vegetarian\\": true}')","\\\\n\\\\nINSERT INTO restaurant_tables (tenant_id, table_number, capacity, location) VALUES\\\\n  ('550e8400-e29b-41d4-a716-446655440000', 'T01', 2, 'Main Floor'),\\\\n  ('550e8400-e29b-41d4-a716-446655440000', 'T02', 4, 'Main Floor'),\\\\n  ('550e8400-e29b-41d4-a716-446655440000', 'T03', 6, 'Main Floor'),\\\\n  ('550e8400-e29b-41d4-a716-446655440000', 'T04', 8, 'Private Room')",""}	sunny_dawn
20250822035330	{"/*\n  # Complete Restaurant Management Schema\n\n  1. New Tables\n    - `tenants` - Restaurant tenants/locations\n    - `users` - Staff and admin users\n    - `categories` - Menu categories\n    - `menu_items` - Menu items with full details\n    - `restaurant_tables` - Physical tables\n    - `customers` - Customer information\n    - `orders` - Customer orders\n    - `order_items` - Individual order items\n    - `payments` - Payment records\n    - `inventory_items` - Inventory management\n    - `staff_schedules` - Staff scheduling\n    - `notifications` - System notifications\n    - `audit_logs` - Audit trail\n    - `daily_sales_summary` - Analytics data\n\n  2. Security\n    - Enable RLS on all tables\n    - Add policies for tenant isolation\n    - Add proper indexes for performance\n\n  3. Functions\n    - Update timestamp triggers\n    - Order number generation\n*/\n\n-- Enable UUID extension\nCREATE EXTENSION IF NOT EXISTS \\"uuid-ossp\\"","-- Guard-create enums if not present, then ensure labels exist (idempotent)\nDO $$\nBEGIN\n  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN\n    CREATE TYPE user_role AS ENUM ('super_admin', 'tenant_admin', 'manager', 'staff', 'customer');\n  END IF;\nEND\n$$","ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin'","ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'tenant_admin'","ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'manager'","ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'staff'","ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'customer'","DO $$\nBEGIN\n  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN\n    CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled');\n  END IF;\nEND\n$$","ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'pending'","ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'confirmed'","ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'preparing'","ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'ready'","ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'served'","ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'cancelled'","DO $$\nBEGIN\n  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN\n    CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');\n  END IF;\nEND\n$$","ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'pending'","ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'processing'","ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'completed'","ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'failed'","ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'refunded'","DO $$\nBEGIN\n  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'table_status') THEN\n    CREATE TYPE table_status AS ENUM ('available', 'occupied', 'reserved', 'maintenance');\n  END IF;\nEND\n$$","ALTER TYPE table_status ADD VALUE IF NOT EXISTS 'available'","ALTER TYPE table_status ADD VALUE IF NOT EXISTS 'occupied'","ALTER TYPE table_status ADD VALUE IF NOT EXISTS 'reserved'","ALTER TYPE table_status ADD VALUE IF NOT EXISTS 'maintenance'","DO $$\nBEGIN\n  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN\n    CREATE TYPE notification_type AS ENUM ('order', 'payment', 'system', 'promotion');\n  END IF;\nEND\n$$","ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'order'","ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'payment'","ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'system'","ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'promotion'","-- Create update timestamp function\nCREATE OR REPLACE FUNCTION update_updated_at_column()\nRETURNS TRIGGER AS $$\nBEGIN\n    NEW.updated_at = CURRENT_TIMESTAMP;\n    RETURN NEW;\nEND;\n$$ language 'plpgsql'","-- Tenants table\nCREATE TABLE IF NOT EXISTS tenants (\n    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n    name TEXT NOT NULL,\n    slug TEXT UNIQUE NOT NULL,\n    description TEXT,\n    logo_url TEXT,\n    website TEXT,\n    phone TEXT,\n    email TEXT,\n    address JSONB,\n    settings JSONB DEFAULT '{}',\n    subscription_plan TEXT DEFAULT 'basic',\n    subscription_status TEXT DEFAULT 'active',\n    trial_ends_at TIMESTAMPTZ,\n    created_at TIMESTAMPTZ DEFAULT NOW(),\n    updated_at TIMESTAMPTZ DEFAULT NOW()\n)","ALTER TABLE tenants ENABLE ROW LEVEL SECURITY","DO $$\nBEGIN\n  DROP POLICY IF EXISTS \\"Users can access their tenant data\\" ON tenants;\n  CREATE POLICY \\"Users can access their tenant data\\"\n    ON tenants FOR ALL\n    TO public\n    USING (id = (SELECT tenant_id FROM users WHERE id = auth.uid()));\nEXCEPTION WHEN duplicate_object THEN NULL;\nEND $$","DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants","CREATE TRIGGER update_tenants_updated_at\n    BEFORE UPDATE ON tenants\n    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","-- Users table\nCREATE TABLE IF NOT EXISTS users (\n    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,\n    email TEXT NOT NULL,\n    password_hash TEXT,\n    first_name TEXT NOT NULL,\n    last_name TEXT NOT NULL,\n    phone TEXT,\n    avatar_url TEXT,\n    role user_role DEFAULT 'staff',\n    permissions JSONB DEFAULT '[]',\n    is_active BOOLEAN DEFAULT true,\n    last_login_at TIMESTAMPTZ,\n    email_verified_at TIMESTAMPTZ,\n    created_at TIMESTAMPTZ DEFAULT NOW(),\n    updated_at TIMESTAMPTZ DEFAULT NOW(),\n    UNIQUE(tenant_id, email)\n)","ALTER TABLE users ENABLE ROW LEVEL SECURITY","DO $$\nBEGIN\n  DROP POLICY IF EXISTS \\"Users can access their tenant users\\" ON users;\n  CREATE POLICY \\"Users can access their tenant users\\"\n    ON users FOR ALL\n    TO public\n    USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));\nEXCEPTION WHEN duplicate_object THEN NULL;\nEND $$","CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id)","CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)","DROP TRIGGER IF EXISTS update_users_updated_at ON users","CREATE TRIGGER update_users_updated_at\n    BEFORE UPDATE ON users\n    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","-- Categories table\nCREATE TABLE IF NOT EXISTS categories (\n    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,\n    name TEXT NOT NULL,\n    description TEXT,\n    image_url TEXT,\n    sort_order INTEGER DEFAULT 0,\n    is_active BOOLEAN DEFAULT true,\n    created_at TIMESTAMPTZ DEFAULT NOW(),\n    updated_at TIMESTAMPTZ DEFAULT NOW()\n)","ALTER TABLE categories ENABLE ROW LEVEL SECURITY","DO $$\nBEGIN\n  DROP POLICY IF EXISTS \\"Users can access their tenant categories\\" ON categories;\n  CREATE POLICY \\"Users can access their tenant categories\\"\n    ON categories FOR ALL\n    TO public\n    USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));\nEXCEPTION WHEN duplicate_object THEN NULL;\nEND $$","DROP TRIGGER IF EXISTS update_categories_updated_at ON categories","CREATE TRIGGER update_categories_updated_at\n    BEFORE UPDATE ON categories\n    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","-- Menu items table\nCREATE TABLE IF NOT EXISTS menu_items (\n    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,\n    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,\n    name TEXT NOT NULL,\n    description TEXT,\n    price DECIMAL(10,2) NOT NULL,\n    cost DECIMAL(10,2),\n    image_url TEXT,\n    images JSONB DEFAULT '[]',\n    ingredients JSONB DEFAULT '[]',\n    allergens JSONB DEFAULT '[]',\n    nutritional_info JSONB DEFAULT '{}',\n    dietary_info JSONB DEFAULT '{}',\n    preparation_time INTEGER,\n    calories INTEGER,\n    is_available BOOLEAN DEFAULT true,\n    is_featured BOOLEAN DEFAULT false,\n    sort_order INTEGER DEFAULT 0,\n    variants JSONB DEFAULT '[]',\n    created_at TIMESTAMPTZ DEFAULT NOW(),\n    updated_at TIMESTAMPTZ DEFAULT NOW()\n)","ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY","DO $$\nBEGIN\n  DROP POLICY IF EXISTS \\"Users can access their tenant menu items\\" ON menu_items;\n  CREATE POLICY \\"Users can access their tenant menu items\\"\n    ON menu_items FOR ALL\n    TO public\n    USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));\nEXCEPTION WHEN duplicate_object THEN NULL;\nEND $$","CREATE INDEX IF NOT EXISTS idx_menu_items_tenant_id ON menu_items(tenant_id)","CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id)","DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items","CREATE TRIGGER update_menu_items_updated_at\n    BEFORE UPDATE ON menu_items\n    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","-- Restaurant tables\nCREATE TABLE IF NOT EXISTS restaurant_tables (\n    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,\n    table_number TEXT NOT NULL,\n    capacity INTEGER NOT NULL,\n    location TEXT,\n    status table_status DEFAULT 'available',\n    qr_code TEXT,\n    notes TEXT,\n    created_at TIMESTAMPTZ DEFAULT NOW(),\n    updated_at TIMESTAMPTZ DEFAULT NOW(),\n    UNIQUE(tenant_id, table_number)\n)","ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY","DO $$\nBEGIN\n  DROP POLICY IF EXISTS \\"Users can access their tenant tables\\" ON restaurant_tables;\n  CREATE POLICY \\"Users can access their tenant tables\\"\n    ON restaurant_tables FOR ALL\n    TO public\n    USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));\nEXCEPTION WHEN duplicate_object THEN NULL;\nEND $$","DROP TRIGGER IF EXISTS update_restaurant_tables_updated_at ON restaurant_tables","CREATE TRIGGER update_restaurant_tables_updated_at\n    BEFORE UPDATE ON restaurant_tables\n    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","-- Customers table\nCREATE TABLE IF NOT EXISTS customers (\n    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,\n    email TEXT,\n    phone TEXT,\n    first_name TEXT,\n    last_name TEXT,\n    date_of_birth DATE,\n    preferences JSONB DEFAULT '{}',\n    loyalty_points INTEGER DEFAULT 0,\n    total_spent DECIMAL(10,2) DEFAULT 0,\n    visit_count INTEGER DEFAULT 0,\n    last_visit_at TIMESTAMPTZ,\n    created_at TIMESTAMPTZ DEFAULT NOW(),\n    updated_at TIMESTAMPTZ DEFAULT NOW(),\n    UNIQUE(tenant_id, email),\n    UNIQUE(tenant_id, phone)\n)","ALTER TABLE customers ENABLE ROW LEVEL SECURITY","DO $$\nBEGIN\n  DROP POLICY IF EXISTS \\"Users can access their tenant customers\\" ON customers;\n  CREATE POLICY \\"Users can access their tenant customers\\"\n    ON customers FOR ALL\n    TO public\n    USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));\nEXCEPTION WHEN duplicate_object THEN NULL;\nEND $$","DROP TRIGGER IF EXISTS update_customers_updated_at ON customers","CREATE TRIGGER update_customers_updated_at\n    BEFORE UPDATE ON customers\n    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","-- Orders table\nCREATE TABLE IF NOT EXISTS orders (\n    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,\n    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,\n    table_id UUID REFERENCES restaurant_tables(id) ON DELETE SET NULL,\n    staff_id UUID REFERENCES users(id) ON DELETE SET NULL,\n    order_number TEXT NOT NULL,\n    order_type TEXT DEFAULT 'dine_in',\n    status order_status DEFAULT 'pending',\n    subtotal DECIMAL(10,2) DEFAULT 0 NOT NULL,\n    tax_amount DECIMAL(10,2) DEFAULT 0 NOT NULL,\n    discount_amount DECIMAL(10,2) DEFAULT 0 NOT NULL,\n    tip_amount DECIMAL(10,2) DEFAULT 0 NOT NULL,\n    total_amount DECIMAL(10,2) DEFAULT 0 NOT NULL,\n    payment_status payment_status DEFAULT 'pending',\n    special_instructions TEXT,\n    estimated_ready_time TIMESTAMPTZ,\n    ready_at TIMESTAMPTZ,\n    served_at TIMESTAMPTZ,\n    cancelled_at TIMESTAMPTZ,\n    cancellation_reason TEXT,\n    created_at TIMESTAMPTZ DEFAULT NOW(),\n    updated_at TIMESTAMPTZ DEFAULT NOW(),\n    UNIQUE(tenant_id, order_number)\n)","ALTER TABLE orders ENABLE ROW LEVEL SECURITY","DO $$\nBEGIN\n  DROP POLICY IF EXISTS \\"Users can access their tenant orders\\" ON orders;\n  CREATE POLICY \\"Users can access their tenant orders\\"\n    ON orders FOR ALL\n    TO public\n    USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));\nEXCEPTION WHEN duplicate_object THEN NULL;\nEND $$","CREATE INDEX IF NOT EXISTS idx_orders_tenant_id ON orders(tenant_id)","CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)","CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)","DROP TRIGGER IF EXISTS update_orders_updated_at ON orders","CREATE TRIGGER update_orders_updated_at\n    BEFORE UPDATE ON orders\n    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","-- Order items table\nCREATE TABLE IF NOT EXISTS order_items (\n    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,\n    menu_item_id UUID REFERENCES menu_items(id) ON DELETE RESTRICT,\n    quantity INTEGER NOT NULL DEFAULT 1,\n    unit_price DECIMAL(10,2) NOT NULL,\n    total_price DECIMAL(10,2) NOT NULL,\n    customizations JSONB DEFAULT '{}',\n    special_instructions TEXT,\n    status TEXT DEFAULT 'pending',\n    created_at TIMESTAMPTZ DEFAULT NOW(),\n    updated_at TIMESTAMPTZ DEFAULT NOW()\n)","ALTER TABLE order_items ENABLE ROW LEVEL SECURITY","DO $$\nBEGIN\n  DROP POLICY IF EXISTS \\"Users can access order items through orders\\" ON order_items;\n  CREATE POLICY \\"Users can access order items through orders\\"\n    ON order_items FOR ALL\n    TO public\n    USING (order_id IN (\n        SELECT id FROM orders \n        WHERE tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())\n    ));\nEXCEPTION WHEN duplicate_object THEN NULL;\nEND $$","CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)","DROP TRIGGER IF EXISTS update_order_items_updated_at ON order_items","CREATE TRIGGER update_order_items_updated_at\n    BEFORE UPDATE ON order_items\n    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","-- Payments table\nCREATE TABLE IF NOT EXISTS payments (\n    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,\n    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,\n    amount DECIMAL(10,2) NOT NULL,\n    payment_method TEXT NOT NULL,\n    payment_provider TEXT,\n    provider_transaction_id TEXT,\n    status payment_status DEFAULT 'pending',\n    processed_at TIMESTAMPTZ,\n    metadata JSONB DEFAULT '{}',\n    created_at TIMESTAMPTZ DEFAULT NOW(),\n    updated_at TIMESTAMPTZ DEFAULT NOW()\n)","ALTER TABLE payments ENABLE ROW LEVEL SECURITY","DO $$\nBEGIN\n  DROP POLICY IF EXISTS \\"Users can access their tenant payments\\" ON payments;\n  CREATE POLICY \\"Users can access their tenant payments\\"\n    ON payments FOR ALL\n    TO public\n    USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));\nEXCEPTION WHEN duplicate_object THEN NULL;\nEND $$","-- Inventory items table\nCREATE TABLE IF NOT EXISTS inventory_items (\n    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,\n    name TEXT NOT NULL,\n    description TEXT,\n    unit TEXT NOT NULL,\n    current_stock DECIMAL(10,3) DEFAULT 0 NOT NULL,\n    minimum_stock DECIMAL(10,3) DEFAULT 0 NOT NULL,\n    maximum_stock DECIMAL(10,3),\n    cost_per_unit DECIMAL(10,2),\n    supplier_info JSONB DEFAULT '{}',\n    last_restocked_at TIMESTAMPTZ,\n    created_at TIMESTAMPTZ DEFAULT NOW(),\n    updated_at TIMESTAMPTZ DEFAULT NOW()\n)","ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY","DO $$\nBEGIN\n  DROP POLICY IF EXISTS \\"Users can access their tenant inventory\\" ON inventory_items;\n  CREATE POLICY \\"Users can access their tenant inventory\\"\n    ON inventory_items FOR ALL\n    TO public\n    USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));\nEXCEPTION WHEN duplicate_object THEN NULL;\nEND $$","DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items","CREATE TRIGGER update_inventory_items_updated_at\n    BEFORE UPDATE ON inventory_items\n    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","-- Staff schedules table\nCREATE TABLE IF NOT EXISTS staff_schedules (\n    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,\n    staff_id UUID REFERENCES users(id) ON DELETE CASCADE,\n    shift_date DATE NOT NULL,\n    start_time TIME NOT NULL,\n    end_time TIME NOT NULL,\n    break_duration INTEGER DEFAULT 0,\n    hourly_rate DECIMAL(8,2),\n    notes TEXT,\n    created_at TIMESTAMPTZ DEFAULT NOW(),\n    updated_at TIMESTAMPTZ DEFAULT NOW()\n)","ALTER TABLE staff_schedules ENABLE ROW LEVEL SECURITY","DO $$\nBEGIN\n  DROP POLICY IF EXISTS \\"Users can access their tenant schedules\\" ON staff_schedules;\n  CREATE POLICY \\"Users can access their tenant schedules\\"\n    ON staff_schedules FOR ALL\n    TO public\n    USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));\nEXCEPTION WHEN duplicate_object THEN NULL;\nEND $$","DROP TRIGGER IF EXISTS update_staff_schedules_updated_at ON staff_schedules","CREATE TRIGGER update_staff_schedules_updated_at\n    BEFORE UPDATE ON staff_schedules\n    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","-- Notifications table\nCREATE TABLE IF NOT EXISTS notifications (\n    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,\n    user_id UUID REFERENCES users(id) ON DELETE CASCADE,\n    type notification_type NOT NULL,\n    title TEXT NOT NULL,\n    message TEXT NOT NULL,\n    data JSONB DEFAULT '{}',\n    is_read BOOLEAN DEFAULT false,\n    expires_at TIMESTAMPTZ,\n    created_at TIMESTAMPTZ DEFAULT NOW()\n)","ALTER TABLE notifications ENABLE ROW LEVEL SECURITY","DO $$\nBEGIN\n  DROP POLICY IF EXISTS \\"Users can access their notifications\\" ON notifications;\n  CREATE POLICY \\"Users can access their notifications\\"\n    ON notifications FOR ALL\n    TO public\n    USING (user_id = auth.uid());\nEXCEPTION WHEN duplicate_object THEN NULL;\nEND $$","CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)","CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read)","-- Audit logs table\nCREATE TABLE IF NOT EXISTS audit_logs (\n    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,\n    user_id UUID REFERENCES users(id) ON DELETE SET NULL,\n    action TEXT NOT NULL,\n    resource_type TEXT NOT NULL,\n    resource_id UUID,\n    old_values JSONB,\n    new_values JSONB,\n    ip_address INET,\n    user_agent TEXT,\n    created_at TIMESTAMPTZ DEFAULT NOW()\n)","ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY","DO $$\nBEGIN\n  DROP POLICY IF EXISTS \\"Users can access their tenant audit logs\\" ON audit_logs;\n  CREATE POLICY \\"Users can access their tenant audit logs\\"\n    ON audit_logs FOR ALL\n    TO public\n    USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));\nEXCEPTION WHEN duplicate_object THEN NULL;\nEND $$","CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id)","CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at)","-- Daily sales summary table\nCREATE TABLE IF NOT EXISTS daily_sales_summary (\n    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,\n    date DATE NOT NULL,\n    total_orders INTEGER DEFAULT 0,\n    total_revenue DECIMAL(10,2) DEFAULT 0,\n    total_customers INTEGER DEFAULT 0,\n    average_order_value DECIMAL(10,2) DEFAULT 0,\n    top_selling_items JSONB DEFAULT '[]',\n    created_at TIMESTAMPTZ DEFAULT NOW(),\n    UNIQUE(tenant_id, date)\n)","ALTER TABLE daily_sales_summary ENABLE ROW LEVEL SECURITY","DO $$\nBEGIN\n  DROP POLICY IF EXISTS \\"Users can access their tenant analytics\\" ON daily_sales_summary;\n  CREATE POLICY \\"Users can access their tenant analytics\\"\n    ON daily_sales_summary FOR ALL\n    TO public\n    USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));\nEXCEPTION WHEN duplicate_object THEN NULL;\nEND $$","-- Insert sample data (idempotent, UUID-safe)\nDO $$\nDECLARE\n  v_tenant_id uuid;\n  v_cat_app uuid;\n  v_cat_main uuid;\n  v_cat_des uuid;\n  v_cat_bev uuid;\nBEGIN\n  -- Upsert tenant and get id\n  INSERT INTO tenants (name, slug, description, phone, email)\n  VALUES ('Bella Vista Restaurant', 'bella-vista', 'Fine dining restaurant', '+1-555-123-4567', 'info@bellavista.com')\n  ON CONFLICT (slug) DO UPDATE SET slug = EXCLUDED.slug\n  RETURNING id INTO v_tenant_id;\n\n  IF v_tenant_id IS NULL THEN\n    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'bella-vista';\n  END IF;\n\n  -- Users (unique on (tenant_id, email))\n  INSERT INTO users (tenant_id, email, first_name, last_name, role)\n  VALUES (v_tenant_id, 'admin@restaurant.com', 'Admin', 'User', 'tenant_admin')\n  ON CONFLICT (tenant_id, email) DO NOTHING;\n\n  INSERT INTO users (tenant_id, email, first_name, last_name, role)\n  VALUES (v_tenant_id, 'manager@restaurant.com', 'Manager', 'User', 'manager')\n  ON CONFLICT (tenant_id, email) DO NOTHING;\n\n  INSERT INTO users (tenant_id, email, first_name, last_name, role)\n  VALUES (v_tenant_id, 'chef@restaurant.com', 'Chef', 'User', 'staff')\n  ON CONFLICT (tenant_id, email) DO NOTHING;\n\n  -- Categories (avoid duplicates by (tenant_id, name))\n  INSERT INTO categories (tenant_id, name, description, sort_order)\n  SELECT v_tenant_id, 'Appetizers', 'Start your meal with our delicious appetizers', 1\n  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE tenant_id = v_tenant_id AND name = 'Appetizers');\n\n  INSERT INTO categories (tenant_id, name, description, sort_order)\n  SELECT v_tenant_id, 'Main Courses', 'Our signature main dishes', 2\n  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE tenant_id = v_tenant_id AND name = 'Main Courses');\n\n  INSERT INTO categories (tenant_id, name, description, sort_order)\n  SELECT v_tenant_id, 'Desserts', 'Sweet endings to your meal', 3\n  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE tenant_id = v_tenant_id AND name = 'Desserts');\n\n  INSERT INTO categories (tenant_id, name, description, sort_order)\n  SELECT v_tenant_id, 'Beverages', 'Drinks and cocktails', 4\n  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE tenant_id = v_tenant_id AND name = 'Beverages');\n\n  -- Resolve category ids\n  SELECT id INTO v_cat_app FROM categories WHERE tenant_id = v_tenant_id AND name = 'Appetizers';\n  SELECT id INTO v_cat_main FROM categories WHERE tenant_id = v_tenant_id AND name = 'Main Courses';\n  SELECT id INTO v_cat_des  FROM categories WHERE tenant_id = v_tenant_id AND name = 'Desserts';\n  SELECT id INTO v_cat_bev  FROM categories WHERE tenant_id = v_tenant_id AND name = 'Beverages';\n\n  -- Menu items (avoid duplicates by (tenant_id, name))\n  INSERT INTO menu_items (tenant_id, category_id, name, description, price, cost, image_url, preparation_time, calories, is_available)\n  SELECT v_tenant_id, v_cat_app, 'Truffle Arancini', 'Crispy risotto balls with black truffle and parmesan', 16.00, 6.50,\n         'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400', 15, 280, TRUE\n  WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE tenant_id = v_tenant_id AND name = 'Truffle Arancini');\n\n  INSERT INTO menu_items (tenant_id, category_id, name, description, price, cost, image_url, preparation_time, calories, is_available)\n  SELECT v_tenant_id, v_cat_app, 'Pan-Seared Scallops', 'Fresh diver scallops with cauliflower purée', 24.00, 12.00,\n         'https://images.pexels.com/photos/842571/pexels-photo-842571.jpeg?auto=compress&cs=tinysrgb&w=400', 12, 180, TRUE\n  WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE tenant_id = v_tenant_id AND name = 'Pan-Seared Scallops');\n\n  INSERT INTO menu_items (tenant_id, category_id, name, description, price, cost, image_url, preparation_time, calories, is_available)\n  SELECT v_tenant_id, v_cat_main, 'Wagyu Beef Tenderloin', 'Premium wagyu beef with seasonal vegetables', 65.00, 28.00,\n         'https://images.pexels.com/photos/361184/asparagus-steak-veal-steak-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=400', 25, 420, TRUE\n  WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE tenant_id = v_tenant_id AND name = 'Wagyu Beef Tenderloin');\n\n  INSERT INTO menu_items (tenant_id, category_id, name, description, price, cost, image_url, preparation_time, calories, is_available)\n  SELECT v_tenant_id, v_cat_main, 'Grilled Atlantic Salmon', 'Fresh salmon with herb crust and quinoa pilaf', 32.00, 14.00,\n         'https://images.pexels.com/photos/842571/pexels-photo-842571.jpeg?auto=compress&cs=tinysrgb&w=400', 20, 350, TRUE\n  WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE tenant_id = v_tenant_id AND name = 'Grilled Atlantic Salmon');\n\n  -- Restaurant tables (unique on (tenant_id, table_number))\n  INSERT INTO restaurant_tables (tenant_id, table_number, capacity, location, qr_code)\n  VALUES\n    (v_tenant_id, 'T01', 4, 'Main Hall',  'QR_T01_ABC123'),\n    (v_tenant_id, 'T02', 2, 'Window View','QR_T02_DEF456'),\n    (v_tenant_id, 'T03', 6, 'Private Room','QR_T03_GHI789'),\n    (v_tenant_id, 'T04', 4, 'Patio',      'QR_T04_JKL012'),\n    (v_tenant_id, 'T05', 8, 'Main Hall',  'QR_T05_MNO345'),\n    (v_tenant_id, 'T06', 4, 'Main Hall',  'QR_T06_PQR678'),\n    (v_tenant_id, 'T07', 2, 'Bar Area',   'QR_T07_STU901'),\n    (v_tenant_id, 'T08', 4, 'Garden View','QR_T08_VWX234'),\n    (v_tenant_id, 'T09', 4, 'Garden View','QR_T09_YZA567'),\n    (v_tenant_id, 'T10', 6, 'Garden View','QR_T10_BCD890')\n  ON CONFLICT (tenant_id, table_number) DO NOTHING;\nEND $$"}	wooden_sound
20250822040000	{"-- 1) Make QR codes unique (but allow multiple NULLs)\ncreate unique index if not exists ux_restaurant_tables_qr_code\n  on public.restaurant_tables(qr_code) where qr_code is not null","-- 2) AUTH READ: categories (active, tenant-scoped)\nDO $$ BEGIN\n  DROP POLICY IF EXISTS \\"public_read_categories_active\\" ON public.categories;\n  DROP POLICY IF EXISTS \\"auth_read_categories_active_tenant\\" ON public.categories;\n  CREATE POLICY \\"auth_read_categories_active_tenant\\"\n  ON public.categories\n  FOR SELECT\n  TO authenticated\n  USING (\n    is_active = true\n    AND tenant_id = (current_setting('request.jwt.claims.tenant_id', true))::uuid\n  );\nEXCEPTION WHEN duplicate_object THEN NULL; END $$","-- 3) AUTH READ: menu_items (active; category active; tenant-scoped)\ndo $$ begin\n  drop policy if exists \\"public_read_menu_items_active\\" on public.menu_items;\n  create policy \\"auth_read_menu_items_active_tenant\\"\n  on public.menu_items\n  for select\n  to authenticated\n  using (\n    is_available = true\n    and tenant_id = (current_setting('request.jwt.claims.tenant_id', true))::uuid\n    and (\n      category_id is null OR exists (\n        select 1\n        from public.categories c\n        where c.id = menu_items.category_id\n          and c.is_active = true\n          and c.tenant_id = menu_items.tenant_id\n      )\n    )\n  );\nexception when duplicate_object then null; end $$","-- 4) AUTH READ: restaurant_tables (tenant-scoped; qr_code required for public app routing)\ndo $$ begin\n  drop policy if exists \\"public_read_restaurant_tables_for_qr\\" on public.restaurant_tables;\n  create policy \\"auth_read_restaurant_tables_for_qr_tenant\\"\n  on public.restaurant_tables\n  for select\n  to authenticated\n  using (\n    qr_code is not null\n    and tenant_id = (current_setting('request.jwt.claims.tenant_id', true))::uuid\n  );\nexception when duplicate_object then null; end $$","-- 5) AUTH INSERT: orders (tenant-scoped)\ndo $$ begin\n  drop policy if exists \\"public_insert_orders\\" on public.orders;\n  create policy \\"auth_insert_orders_tenant\\"\n  on public.orders\n  for insert\n  to authenticated\n  with check (\n    tenant_id = (current_setting('request.jwt.claims.tenant_id', true))::uuid\n  );\nexception when duplicate_object then null; end $$","-- 6) AUTH READ: orders (tenant-scoped)\ndo $$ begin\n  drop policy if exists \\"public_read_orders\\" on public.orders;\n  create policy \\"auth_read_orders_tenant\\"\n  on public.orders\n  for select\n  to authenticated\n  using (\n    tenant_id = (current_setting('request.jwt.claims.tenant_id', true))::uuid\n  );\nexception when duplicate_object then null; end $$","-- 7) AUTH INSERT & READ: order_items (tenant-scoped)\ndo $$ begin\n  drop policy if exists \\"public_insert_order_items\\" on public.order_items;\n  drop policy if exists \\"auth_insert_order_items_tenant\\" on public.order_items;\n  create policy \\"auth_insert_order_items_tenant\\"\n  on public.order_items\n  for insert\n  to authenticated\n  with check (\n    exists (\n      select 1 from public.orders o\n      where o.id = order_items.order_id\n        and o.tenant_id = (current_setting('request.jwt.claims.tenant_id', true))::uuid\n    )\n  );\nexception when duplicate_object then null; end $$","do $$ begin\n  drop policy if exists \\"public_read_order_items\\" on public.order_items;\n  drop policy if exists \\"auth_read_order_items_tenant\\" on public.order_items;\n  create policy \\"auth_read_order_items_tenant\\"\n  on public.order_items\n  for select\n  to authenticated\n  using (\n    exists (\n      select 1 from public.orders o\n      where o.id = order_items.order_id\n        and o.tenant_id = (current_setting('request.jwt.claims.tenant_id', true))::uuid\n    )\n  );\nexception when duplicate_object then null; end $$"}	add_public_policies_and_qr_index
20250824040000	{"DO $$\nBEGIN\n  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN\n    CREATE TYPE user_role AS ENUM ('super_admin', 'tenant_admin', 'manager', 'staff', 'customer');\n  END IF;\nEND\n$$","ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin'","ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'tenant_admin'","ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'manager'","ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'staff'","ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'customer'"}	fix_user_role_enum
20250824043902	{"-- RLS Hardening — applies consistent per-tenant policies across all tables that have a tenant_id column.\\\\n-- Assumptions:\\\\n--  - JWT contains claim tenant_id (string UUID) for non-service requests.\\\\n--  - Service role (bypassrls) continues to bypass RLS (admin/cron).\\\\n--  - Tables without tenant_id are either global metadata or auth.* and are left untouched.\\\\n\\\\n-- 1) Helper: robust extractor for tenant_id from JWT\\\\ncreate schema if not exists app","\\\\n\\\\ncreate or replace function app.current_tenant_id()\\\\nreturns uuid\\\\nlanguage plpgsql\\\\nstable\\\\nas $$\\\\ndeclare\\\\n  _tid text","\\\\nbegin\\\\n  -- auth.jwt() is a Supabase helper that returns JWT claims as jsonb (or null)\\\\n  begin\\\\n    _tid := coalesce( (auth.jwt() ->> 'tenant_id'), null )","\\\\n  exception when others then\\\\n    _tid := null","\\\\n  end","\\\\n  if _tid is null or _tid = '' then\\\\n    return null","\\\\n  end if","\\\\n  return _tid::uuid","\\\\nexception when others then\\\\n  return null","\\\\nend","\\\\n$$","\\\\n\\\\ncomment on function app.current_tenant_id is\\\\n  'Returns tenant_id::uuid from JWT claims"," NULL if absent or invalid.'","\\\\n\\\\n-- 2) Enable RLS + create per-tenant policies for every public.* table that has a tenant_id column\\\\ndo $$\\\\ndeclare\\\\n  r record","\\\\n  _tbl regclass","\\\\n  _sch text","\\\\n  _rel text","\\\\n  _sel_pol text","\\\\n  _ins_pol text","\\\\n  _upd_pol text","\\\\n  _del_pol text","\\\\nbegin\\\\n  for r in\\\\n    select c.table_schema, c.table_name\\\\n    from information_schema.columns c\\\\n    join pg_class pc on pc.relname = c.table_name\\\\n    join pg_namespace pn on pn.nspname = c.table_schema and pn.oid = pc.relnamespace\\\\n    where c.column_name = 'tenant_id'\\\\n      and c.table_schema not in ('pg_catalog','information_schema','auth','pgbouncer')\\\\n      and c.table_schema = 'public'\\\\n    order by c.table_schema, c.table_name\\\\n  loop\\\\n    _sch := r.table_schema","\\\\n    _rel := r.table_name","\\\\n    _tbl := format('%I.%I', _sch, _rel)","\\\\n\\\\n    -- Enable and force RLS (deny by default when no policy matches)\\\\n    execute format('alter table %s enable row level security","', _tbl)","\\\\n    execute format('alter table %s force row level security","', _tbl)","\\\\n\\\\n    -- Policy names (consistent & idempotent)\\\\n    _sel_pol := format('%s_tenant_select', _rel)","\\\\n    _ins_pol := format('%s_tenant_insert', _rel)","\\\\n    _upd_pol := format('%s_tenant_update', _rel)","\\\\n    _del_pol := format('%s_tenant_delete', _rel)","\\\\n\\\\n    -- Drop existing policies with same names (idempotency)\\\\n    if exists (select 1 from pg_policies p where p.schemaname=_sch and p.tablename=_rel and p.policyname=_sel_pol) then\\\\n      execute format('drop policy %I on %I.%I","', _sel_pol, _sch, _rel)","\\\\n    end if","\\\\n    if exists (select 1 from pg_policies p where p.schemaname=_sch and p.tablename=_rel and p.policyname=_ins_pol) then\\\\n      execute format('drop policy %I on %I.%I","', _ins_pol, _sch, _rel)","\\\\n    end if","\\\\n    if exists (select 1 from pg_policies p where p.schemaname=_sch and p.tablename=_rel and p.policyname=_upd_pol) then\\\\n      execute format('drop policy %I on %I.%I","', _upd_pol, _sch, _rel)","\\\\n    end if","\\\\n    if exists (select 1 from pg_policies p where p.schemaname=_sch and p.tablename=_rel and p.policyname=_del_pol) then\\\\n      execute format('drop policy %I on %I.%I","', _del_pol, _sch, _rel)","\\\\n    end if","\\\\n\\\\n    -- Deny-by-default is achieved by RLS+FORCE"," now add allow rules ONLY for same-tenant access.\\\\n    execute format($SQL$\\\\n      create policy %I on %I.%I\\\\n      as permissive\\\\n      for select\\\\n      using ( tenant_id = app.current_tenant_id() )","\\\\n    $SQL$, _sel_pol, _sch, _rel)","\\\\n\\\\n    execute format($SQL$\\\\n      create policy %I on %I.%I\\\\n      as permissive\\\\n      for insert\\\\n      with check ( tenant_id = app.current_tenant_id() )","\\\\n    $SQL$, _ins_pol, _sch, _rel)","\\\\n\\\\n    execute format($SQL$\\\\n      create policy %I on %I.%I\\\\n      as permissive\\\\n      for update\\\\n      using ( tenant_id = app.current_tenant_id() )\\\\n      with check ( tenant_id = app.current_tenant_id() )","\\\\n    $SQL$, _upd_pol, _sch, _rel)","\\\\n\\\\n    execute format($SQL$\\\\n      create policy %I on %I.%I\\\\n      as permissive\\\\n      for delete\\\\n      using ( tenant_id = app.current_tenant_id() )","\\\\n    $SQL$, _del_pol, _sch, _rel)","\\\\n\\\\n  end loop","\\\\nend $$","\\\\n\\\\n-- 3) OPTIONAL: visibility note for tables lacking tenant_id (informational NOTICEs)\\\\ndo $$\\\\ndeclare r record","\\\\nbegin\\\\n  for r in\\\\n    select t.table_schema, t.table_name\\\\n    from information_schema.tables t\\\\n    where t.table_schema='public'\\\\n      and t.table_type='BASE TABLE'\\\\n      and not exists (\\\\n        select 1 from information_schema.columns c\\\\n        where c.table_schema=t.table_schema and c.table_name=t.table_name and c.column_name='tenant_id'\\\\n      )\\\\n      and t.table_name not in ('tenants','plans','regions') -- whitelist global tables if applicable\\\\n  loop\\\\n    raise notice 'Table %:%. lacks tenant_id column — review if it should be multi-tenant.', r.table_schema, r.table_name","\\\\n  end loop","\\\\nend $$","\\\\n\\\\n-- End of RLS Hardening"}	steep_sun
20250824045128	{"-- Table to lock a restaurant table to a session.\\\\ncreate table if not exists public.table_sessions (\\\\n  id uuid primary key default gen_random_uuid(),\\\\n  tenant_id uuid not null,\\\\n  table_id uuid not null,\\\\n  pin_hash text not null,\\\\n  status text not null default 'active', -- active|closed\\\\n  created_at timestamptz not null default now(),\\\\n  locked_at timestamptz not null default now(),\\\\n  expires_at timestamptz not null,\\\\n  created_by text\\\\n)","\\\\n\\\\n-- Only one ACTIVE session per (tenant_id, table_id)\\\\ncreate unique index if not exists uniq_active_table_session\\\\non public.table_sessions (tenant_id, table_id)\\\\nwhere status = 'active'","\\\\n\\\\n-- Basic RLS: reuse your existing hardening (tenant_id scoped)\\\\nalter table public.table_sessions enable row level security","\\\\nalter table public.table_sessions force row level security","\\\\n\\\\n-- Policies mirror your existing pattern:\\\\ndrop policy if exists table_sessions_tenant_select on public.table_sessions","\\\\ncreate policy table_sessions_tenant_select on public.table_sessions\\\\n  for select using (tenant_id = app.current_tenant_id())","\\\\n\\\\ndrop policy if exists table_sessions_tenant_insert on public.table_sessions","\\\\ncreate policy table_sessions_tenant_insert on public.table_sessions\\\\n  for insert with check (tenant_id = app.current_tenant_id())","\\\\n\\\\ndrop policy if exists table_sessions_tenant_update on public.table_sessions","\\\\ncreate policy table_sessions_tenant_update on public.table_sessions\\\\n  for update using (tenant_id = app.current_tenant_id()) with check (tenant_id = app.current_tenant_id())","\\\\n\\\\ndrop policy if exists table_sessions_tenant_delete on public.table_sessions","\\\\ncreate policy table_sessions_tenant_delete on public.table_sessions\\\\n  for delete using (tenant_id = app.current_tenant_id())",""}	twilight_sound
	{"-- Add missing \\"processing\\" status to the order_status enum\\\\nALTER TYPE order_status ADD VALUE IF NOT EXISTS 'processing'",""}	
20250824063014	{"\\\\n\\\\n-- Transactional function for idempotent checkout\\\\ncreate schema if not exists app","\\\\n\\\\ncreate or replace function app.checkout_order(\\\\n  p_tenant_id uuid,\\\\n  p_session_id text,\\\\n  p_mode text,\\\\n  p_table_id uuid,\\\\n  p_cart_version integer,\\\\n  p_idempotency_key text,\\\\n  p_total_cents integer\\\\n)\\\\nreturns table(order_id uuid, duplicate boolean)\\\\nlanguage plpgsql\\\\nsecurity definer\\\\nas $$\\\\ndeclare\\\\n  v_cur_version integer","\\\\n  v_existing_id uuid","\\\\nbegin\\\\n  -- Require same-tenant execution context (optional extra check)\\\\n  if p_tenant_id <> app.current_tenant_id() then\\\\n    raise exception 'forbidden' using errcode = '42501'","\\\\n  end if","\\\\n\\\\n  -- Fast path: duplicate idempotency returns existing order\\\\n  select id into v_existing_id\\\\n  from public.orders\\\\n  where tenant_id = p_tenant_id\\\\n    and idempotency_key = p_idempotency_key\\\\n  limit 1","\\\\n\\\\n  if found then\\\\n    return query select v_existing_id, true","\\\\n  end if","\\\\n\\\\n  -- Begin atomic section\\\\n  perform pg_advisory_xact_lock(hashtext(p_tenant_id::text || coalesce(p_table_id::text,'')))","\\\\n\\\\n  -- CAS: bump cart_version only if matches\\\\n  select cart_version into v_cur_version\\\\n  from public.table_sessions\\\\n  where tenant_id = p_tenant_id and id = p_session_id\\\\n  for update","\\\\n\\\\n  if not found then\\\\n    raise exception 'stale_cart' using errcode = '55000'","\\\\n  end if","\\\\n\\\\n  if v_cur_version <> p_cart_version then\\\\n    raise exception 'stale_cart' using errcode = '55000'","\\\\n  end if","\\\\n\\\\n  update public.table_sessions\\\\n    set cart_version = cart_version + 1\\\\n  where tenant_id = p_tenant_id and id = p_session_id","\\\\n\\\\n  -- One active order per table (enforced also by partial unique index)\\\\n  if p_mode = 'table' and p_table_id is not null then\\\\n    if exists (\\\\n      select 1 from public.orders\\\\n      where tenant_id = p_tenant_id\\\\n        and table_id = p_table_id\\\\n        and status in ('pending','processing')\\\\n    ) then\\\\n      raise exception 'active_order_exists' using errcode = '55000'","\\\\n    end if","\\\\n  end if","\\\\n\\\\n  -- Insert order"," unique (tenant_id, idempotency_key) handles duplicates\\\\n  insert into public.orders(\\\\n    tenant_id, session_id, table_id, mode, status, total_cents, idempotency_key\\\\n  ) values (\\\\n    p_tenant_id, p_session_id, case when p_mode='table' then p_table_id else null end,\\\\n    p_mode, 'pending', p_total_cents, p_idempotency_key\\\\n  )\\\\n  returning id into v_existing_id","\\\\n\\\\n  return query select v_existing_id, false","\\\\nend","\\\\n$$","\\\\n\\\\n-- RLS safe access for same-tenant (function runs as definer but checks tenant match)\\\\n-- Ensure orders/table_sessions policies already enforce tenant scoping."}	royal_king
20250824063520	{"-- Ensure orders table exists (no-op if present)\\\\ncreate table if not exists public.orders (\\\\n  id uuid primary key default gen_random_uuid(),\\\\n  tenant_id uuid not null,\\\\n  session_id text not null,\\\\n  table_id uuid null,\\\\n  mode text not null check (mode in ('table','takeaway')),\\\\n  total_cents integer not null default 0,\\\\n  status text not null default 'pending' check (status in ('pending','processing','paid','cancelled')),\\\\n  idempotency_key text not null,\\\\n  created_at timestamptz not null default now()\\\\n)","\\\\n\\\\n-- Ensure columns exist (safe idempotent alters)\\\\nalter table public.orders add column if not exists idempotency_key text not null default ''::text","\\\\nalter table public.orders alter column idempotency_key drop default","\\\\n\\\\nalter table public.orders add column if not exists status text not null default 'pending'","\\\\nalter table public.orders add column if not exists mode text not null default 'takeaway'","\\\\nalter table public.orders add column if not exists total_cents integer not null default 0","\\\\nalter table public.orders add column if not exists session_id text not null default ''","\\\\nalter table public.orders add column if not exists table_id uuid null","\\\\n\\\\n-- Indexes\\\\ncreate index if not exists idx_orders_tenant_created on public.orders(tenant_id, created_at desc)","\\\\n\\\\n-- Unique idempotency per tenant\\\\ncreate unique index if not exists ux_orders_tenant_idem on public.orders(tenant_id, idempotency_key)","\\\\n\\\\n-- One active order per table (partial unique index)\\\\ncreate unique index if not exists ux_orders_active_per_table\\\\n  on public.orders(tenant_id, table_id)\\\\n  where table_id is not null and status in ('pending','processing')","\\\\n\\\\n-- Optimistic cart: bump-able version on table_sessions\\\\nalter table public.table_sessions\\\\n  add column if not exists cart_version integer not null default 0","\\\\n\\\\n-- RLS (deny by default + same-tenant access)\\\\nalter table public.orders enable row level security","\\\\n\\\\ndo $$\\\\nbegin\\\\n  if not exists (select 1 from pg_policies where schemaname='public' and tablename='orders' and policyname='orders_same_tenant_rw') then\\\\n    create policy orders_same_tenant_rw\\\\n      on public.orders\\\\n      using (tenant_id = app.current_tenant_id())\\\\n      with check (tenant_id = app.current_tenant_id())","\\\\n  end if","\\\\nend$$","\\\\n\\\\n-- Transactional RPC function for checkout (atomic)\\\\ncreate schema if not exists app","\\\\n\\\\ncreate or replace function app.checkout_order(\\\\n  p_tenant_id uuid,\\\\n  p_session_id text,\\\\n  p_mode text,\\\\n  p_table_id uuid,\\\\n  p_cart_version integer,\\\\n  p_idempotency_key text,\\\\n  p_total_cents integer\\\\n)\\\\nreturns table(order_id uuid, duplicate boolean)\\\\nlanguage plpgsql\\\\nsecurity definer\\\\nset search_path = public, pg_temp\\\\nas $fn$\\\\ndeclare\\\\n  v_cur_version integer","\\\\n  v_existing_id uuid","\\\\nbegin\\\\n  -- Optional tenant guard if app.current_tenant_id() is available\\\\n  if p_tenant_id <> app.current_tenant_id() then\\\\n    raise exception 'forbidden' using errcode = '42501'","\\\\n  end if","\\\\n\\\\n  -- Fast path: duplicate idempotency\\\\n  select id into v_existing_id\\\\n  from public.orders\\\\n  where tenant_id = p_tenant_id\\\\n    and idempotency_key = p_idempotency_key\\\\n  limit 1","\\\\n\\\\n  if found then\\\\n    return query select v_existing_id, true","\\\\n  end if","\\\\n\\\\n  -- Transactional critical section (table-scoped advisory lock)\\\\n  perform pg_advisory_xact_lock(hashtext(p_tenant_id::text || coalesce(p_table_id::text,'')))","\\\\n\\\\n  -- CAS: ensure cart_version matches and bump it\\\\n  select cart_version into v_cur_version\\\\n  from public.table_sessions\\\\n  where tenant_id = p_tenant_id and id = p_session_id\\\\n  for update","\\\\n\\\\n  if not found or v_cur_version <> p_cart_version then\\\\n    raise exception 'stale_cart' using errcode = '55000'","\\\\n  end if","\\\\n\\\\n  update public.table_sessions\\\\n     set cart_version = cart_version + 1\\\\n   where tenant_id = p_tenant_id and id = p_session_id","\\\\n\\\\n  -- One active order per table for dine-in (also enforced by partial unique index)\\\\n  if p_mode = 'table' and p_table_id is not null then\\\\n    if exists (\\\\n      select 1 from public.orders\\\\n       where tenant_id = p_tenant_id\\\\n         and table_id = p_table_id\\\\n         and status in ('pending','processing')\\\\n    ) then\\\\n      raise exception 'active_order_exists' using errcode = '55000'","\\\\n    end if","\\\\n  end if","\\\\n\\\\n  -- Insert order"," tenant + idempotency_key unique handles duplicates\\\\n  insert into public.orders(\\\\n    tenant_id, session_id, table_id, mode, status, total_cents, idempotency_key\\\\n  ) values (\\\\n    p_tenant_id, p_session_id, case when p_mode='table' then p_table_id else null end,\\\\n    p_mode, 'pending', p_total_cents, p_idempotency_key\\\\n  )\\\\n  returning id into v_existing_id","\\\\n\\\\n  return query select v_existing_id, false","\\\\nend","\\\\n$fn$","\\\\n\\\\n-- Optional: lock down execute to authenticated roles only (adjust as per your roles)\\\\n-- revoke all on function app.checkout_order(uuid,text,text,uuid,integer,text,integer) from public",""}	rapid_sky
20250824063901	{"-- SAFETY: drop old/broken index if it exists (name must match)\\\\ndrop index if exists public.ux_orders_active_per_table","\\\\n\\\\n-- Recreate the partial unique index OUTSIDE any DO block\\\\ncreate unique index if not exists ux_orders_active_per_table\\\\n  on public.orders(tenant_id, table_id)\\\\n  where table_id is not null and status in ('pending','processing')","\\\\n\\\\n-- Ensure idempotency index exists too\\\\ncreate unique index if not exists ux_orders_tenant_idem\\\\n  on public.orders(tenant_id, idempotency_key)","\\\\n\\\\n-- Recreate the function with clear delimiters and search_path\\\\ncreate or replace function app.checkout_order(\\\\n  p_tenant_id uuid,\\\\n  p_session_id text,\\\\n  p_mode text,\\\\n  p_table_id uuid,\\\\n  p_cart_version integer,\\\\n  p_idempotency_key text,\\\\n  p_total_cents integer\\\\n)\\\\nreturns table(order_id uuid, duplicate boolean)\\\\nlanguage plpgsql\\\\nsecurity definer\\\\nset search_path = public, pg_temp\\\\nas $fn$\\\\ndeclare\\\\n  v_cur_version integer","\\\\n  v_existing_id uuid","\\\\nbegin\\\\n  -- Optional tenant guard if app.current_tenant_id() is available\\\\n  if p_tenant_id <> app.current_tenant_id() then\\\\n    raise exception 'forbidden' using errcode = '42501'","\\\\n  end if","\\\\n\\\\n  -- Fast path: duplicate idempotency\\\\n  select id into v_existing_id\\\\n  from public.orders\\\\n  where tenant_id = p_tenant_id\\\\n    and idempotency_key = p_idempotency_key\\\\n  limit 1","\\\\n\\\\n  if found then\\\\n    return query select v_existing_id, true","\\\\n  end if","\\\\n\\\\n  -- Transactional critical section (table-scoped advisory lock)\\\\n  perform pg_advisory_xact_lock(hashtext(p_tenant_id::text || coalesce(p_table_id::text,'')))","\\\\n\\\\n  -- CAS: ensure cart_version matches and bump it\\\\n  select cart_version into v_cur_version\\\\n  from public.table_sessions\\\\n  where tenant_id = p_tenant_id and id = p_session_id\\\\n  for update","\\\\n\\\\n  if not found or v_cur_version <> p_cart_version then\\\\n    raise exception 'stale_cart' using errcode = '55000'","\\\\n  end if","\\\\n\\\\n  update public.table_sessions\\\\n     set cart_version = cart_version + 1\\\\n   where tenant_id = p_tenant_id and id = p_session_id","\\\\n\\\\n  -- One active order per table for dine-in (also enforced by partial unique index)\\\\n  if p_mode = 'table' and p_table_id is not null then\\\\n    if exists (\\\\n      select 1 from public.orders\\\\n       where tenant_id = p_tenant_id\\\\n         and table_id = p_table_id\\\\n         and status in ('pending','processing')\\\\n    ) then\\\\n      raise exception 'active_order_exists' using errcode = '55000'","\\\\n    end if","\\\\n  end if","\\\\n\\\\n  -- Insert order"," tenant + idempotency_key unique handles duplicates\\\\n  insert into public.orders(\\\\n    tenant_id, session_id, table_id, mode, status, total_cents, idempotency_key\\\\n  ) values (\\\\n    p_tenant_id, p_session_id, case when p_mode='table' then p_table_id else null end,\\\\n    p_mode, 'pending', p_total_cents, p_idempotency_key\\\\n  )\\\\n  returning id into v_existing_id","\\\\n\\\\n  return query select v_existing_id, false","\\\\nend","\\\\n$fn$",""}	tender_bar
20250824064154	{"-- Ensure idempotency index exists (safe)\\\\ncreate unique index if not exists ux_orders_tenant_idem\\\\n  on public.orders(tenant_id, idempotency_key)","\\\\n\\\\n-- Guarantee the partial unique index has the correct predicate:\\\\n-- Drop first (in case a wrong definition already exists), then create.\\\\ndrop index if exists public.ux_orders_active_per_table","\\\\n\\\\ncreate unique index ux_orders_active_per_table\\\\n  on public.orders(tenant_id, table_id)\\\\n  where table_id is not null and status in ('pending','processing')",""}	humble_wildflower
20250824064157	{"create schema if not exists app","\\\\n\\\\ncreate or replace function app.checkout_order(\\\\n  p_tenant_id uuid,\\\\n  p_session_id text,\\\\n  p_mode text,\\\\n  p_table_id uuid,\\\\n  p_cart_version integer,\\\\n  p_idempotency_key text,\\\\n  p_total_cents integer\\\\n)\\\\nreturns table(order_id uuid, duplicate boolean)\\\\nlanguage plpgsql\\\\nsecurity definer\\\\nset search_path = public, pg_temp\\\\nas $fn$\\\\ndeclare\\\\n  v_cur_version integer","\\\\n  v_existing_id uuid","\\\\nbegin\\\\n  if p_tenant_id <> app.current_tenant_id() then\\\\n    raise exception 'forbidden' using errcode = '42501'","\\\\n  end if","\\\\n\\\\n  select id into v_existing_id\\\\n  from public.orders\\\\n  where tenant_id = p_tenant_id\\\\n    and idempotency_key = p_idempotency_key\\\\n  limit 1","\\\\n\\\\n  if found then\\\\n    return query select v_existing_id, true","\\\\n  end if","\\\\n\\\\n  perform pg_advisory_xact_lock(hashtext(p_tenant_id::text || coalesce(p_table_id::text,'')))","\\\\n\\\\n  select cart_version into v_cur_version\\\\n  from public.table_sessions\\\\n  where tenant_id = p_tenant_id and id = p_session_id\\\\n  for update","\\\\n\\\\n  if not found or v_cur_version <> p_cart_version then\\\\n    raise exception 'stale_cart' using errcode = '55000'","\\\\n  end if","\\\\n\\\\n  update public.table_sessions\\\\n     set cart_version = cart_version + 1\\\\n   where tenant_id = p_tenant_id and id = p_session_id","\\\\n\\\\n  if p_mode = 'table' and p_table_id is not null then\\\\n    if exists (\\\\n      select 1 from public.orders\\\\n       where tenant_id = p_tenant_id\\\\n         and table_id = p_table_id\\\\n         and status in ('pending','processing')\\\\n    ) then\\\\n      raise exception 'active_order_exists' using errcode = '55000'","\\\\n    end if","\\\\n  end if","\\\\n\\\\n  insert into public.orders(\\\\n    tenant_id, session_id, table_id, mode, status, total_cents, idempotency_key\\\\n  ) values (\\\\n    p_tenant_id, p_session_id, case when p_mode='table' then p_table_id else null end,\\\\n    p_mode, 'pending', p_total_cents, p_idempotency_key\\\\n  )\\\\n  returning id into v_existing_id","\\\\n\\\\n  return query select v_existing_id, false","\\\\nend","\\\\n$fn$",""}	navy_poetry
20250824101144	{"\\\\n\\\\n-- Clean up any duplicate active orders per table before creating unique index\\\\ndelete from public.orders o\\\\nusing public.orders o2\\\\nwhere o.ctid < o2.ctid\\\\n  and o.tenant_id = o2.tenant_id\\\\n  and o.table_id = o2.table_id\\\\n  and o.table_id is not null\\\\n  and o.status in ('pending','processing')\\\\n  and o2.status in ('pending','processing')",""}	polished_math
20250824101148	{"\\\\n\\\\n-- Add idempotency column if missing\\\\ndo $$\\\\nbegin\\\\n  if not exists (\\\\n    select 1 from information_schema.columns\\\\n    where table_name = 'orders' and column_name = 'idempotency_key'\\\\n  ) then\\\\n    alter table public.orders add column idempotency_key text","\\\\n  end if","\\\\nend $$","\\\\n\\\\n-- Add processing status to enum if it exists\\\\ndo $$ \\\\nbegin\\\\n  if exists (select 1 from pg_type where typname = 'order_status') then\\\\n    begin\\\\n      alter type order_status add value if not exists 'processing'","\\\\n    exception when duplicate_object then \\\\n      null","\\\\n    end","\\\\n  end if","\\\\nend $$","\\\\n\\\\n-- Add cart_version to table_sessions for optimistic locking\\\\ndo $$\\\\nbegin\\\\n  if not exists (\\\\n    select 1 from information_schema.columns\\\\n    where table_name = 'table_sessions' and column_name = 'cart_version'\\\\n  ) then\\\\n    alter table public.table_sessions add column cart_version integer not null default 0","\\\\n  end if","\\\\nend $$","\\\\n\\\\n-- Create unique indexes (safe/idempotent)\\\\ncreate unique index if not exists ux_orders_tenant_idem\\\\n  on public.orders(tenant_id, idempotency_key)","\\\\n\\\\ncreate unique index if not exists ux_orders_active_per_table\\\\n  on public.orders(tenant_id, table_id)\\\\n  where table_id is not null and status in ('pending','processing')",""}	precious_canyon
20250824101154	{"\\\\n\\\\n-- Ensure app schema exists\\\\ncreate schema if not exists app","\\\\n\\\\n-- Transactional function for idempotent checkout\\\\ncreate or replace function app.checkout_order(\\\\n  p_tenant_id uuid,\\\\n  p_session_id text,\\\\n  p_mode text,\\\\n  p_table_id uuid,\\\\n  p_cart_version integer,\\\\n  p_idempotency_key text,\\\\n  p_total_cents integer\\\\n)\\\\nreturns table(order_id uuid, duplicate boolean)\\\\nlanguage plpgsql\\\\nsecurity definer\\\\nset search_path = public, pg_temp\\\\nas $fn$\\\\ndeclare\\\\n  v_cur_version integer","\\\\n  v_existing_id uuid","\\\\nbegin\\\\n  -- Tenant validation (if app.current_tenant_id() function exists)\\\\n  begin\\\\n    if p_tenant_id <> app.current_tenant_id() then\\\\n      raise exception 'forbidden' using errcode = '42501'","\\\\n    end if","\\\\n  exception when undefined_function then\\\\n    -- app.current_tenant_id() doesn't exist, skip validation\\\\n    null","\\\\n  end","\\\\n\\\\n  -- Fast path: duplicate idempotency returns existing order\\\\n  select id into v_existing_id\\\\n  from public.orders\\\\n  where tenant_id = p_tenant_id\\\\n    and idempotency_key = p_idempotency_key\\\\n  limit 1","\\\\n\\\\n  if found then\\\\n    return query select v_existing_id, true","\\\\n    return","\\\\n  end if","\\\\n\\\\n  -- Begin atomic section with advisory lock\\\\n  perform pg_advisory_xact_lock(hashtext(p_tenant_id::text || coalesce(p_table_id::text,'')))","\\\\n\\\\n  -- CAS: ensure cart_version matches and bump it\\\\n  select cart_version into v_cur_version\\\\n  from public.table_sessions\\\\n  where tenant_id = p_tenant_id and id = p_session_id\\\\n  for update","\\\\n\\\\n  if not found then\\\\n    raise exception 'stale_cart' using errcode = '55000'","\\\\n  end if","\\\\n\\\\n  if v_cur_version <> p_cart_version then\\\\n    raise exception 'stale_cart' using errcode = '55000'","\\\\n  end if","\\\\n\\\\n  update public.table_sessions\\\\n     set cart_version = cart_version + 1\\\\n   where tenant_id = p_tenant_id and id = p_session_id","\\\\n\\\\n  -- One active order per table (dine-in only)\\\\n  if p_mode = 'table' and p_table_id is not null then\\\\n    if exists (\\\\n      select 1 from public.orders\\\\n       where tenant_id = p_tenant_id\\\\n         and table_id = p_table_id\\\\n         and status in ('pending','processing')\\\\n    ) then\\\\n      raise exception 'active_order_exists' using errcode = '55000'","\\\\n    end if","\\\\n  end if","\\\\n\\\\n  -- Insert order"," unique (tenant_id, idempotency_key) handles duplicates\\\\n  insert into public.orders(\\\\n    tenant_id, session_id, table_id, mode, status, total_cents, idempotency_key\\\\n  ) values (\\\\n    p_tenant_id, p_session_id, case when p_mode='table' then p_table_id else null end,\\\\n    p_mode, 'pending', p_total_cents, p_idempotency_key\\\\n  )\\\\n  returning id into v_existing_id","\\\\n\\\\n  return query select v_existing_id, false","\\\\nend","\\\\n$fn$",""}	dark_pine
20250824113613	{"-- Clean up any duplicate active orders before creating unique index\\\\ndelete from public.orders o\\\\nusing public.orders o2\\\\nwhere o.ctid < o2.ctid\\\\n  and o.tenant_id = o2.tenant_id\\\\n  and o.table_id = o2.table_id\\\\n  and o.status in ('pending','processing')\\\\n  and o2.status in ('pending','processing')",""}	peaceful_breeze
20250824113615	{"-- Ensure orders table has required columns\\\\nalter table if exists public.orders\\\\n  add column if not exists idempotency_key text","\\\\n\\\\n-- Add processing status to enum if it exists\\\\ndo $$ begin\\\\n  alter type order_status add value if not exists 'processing'","\\\\nexception when duplicate_object then null"," end $$","\\\\n\\\\n-- Create unique indexes (safe/idempotent)\\\\ncreate unique index if not exists ux_orders_tenant_idem\\\\n  on public.orders(tenant_id, idempotency_key)","\\\\n\\\\ncreate unique index if not exists ux_orders_active_per_table\\\\n  on public.orders(tenant_id, table_id)\\\\n  where table_id is not null and status in ('pending','processing')","\\\\n\\\\n-- Ensure cart_version exists on table_sessions\\\\nalter table if exists public.table_sessions\\\\n  add column if not exists cart_version integer not null default 0",""}	snowy_breeze
20250824113619	{"-- Transactional RPC function for checkout (atomic)\\\\ncreate schema if not exists app","\\\\n\\\\ncreate or replace function app.checkout_order(\\\\n  p_tenant_id uuid,\\\\n  p_session_id text,\\\\n  p_mode text,\\\\n  p_table_id uuid,\\\\n  p_cart_version integer,\\\\n  p_idempotency_key text,\\\\n  p_total_cents integer\\\\n)\\\\nreturns table(order_id uuid, duplicate boolean)\\\\nlanguage plpgsql\\\\nsecurity definer\\\\nset search_path = public, pg_temp\\\\nas $fn$\\\\ndeclare\\\\n  v_cur_version integer","\\\\n  v_existing_id uuid","\\\\nbegin\\\\n  -- Optional tenant guard if app.current_tenant_id() is available\\\\n  if p_tenant_id <> app.current_tenant_id() then\\\\n    raise exception 'forbidden' using errcode = '42501'","\\\\n  end if","\\\\n\\\\n  -- Fast path: duplicate idempotency\\\\n  select id into v_existing_id\\\\n  from public.orders\\\\n  where tenant_id = p_tenant_id\\\\n    and idempotency_key = p_idempotency_key\\\\n  limit 1","\\\\n\\\\n  if found then\\\\n    return query select v_existing_id, true","\\\\n  end if","\\\\n\\\\n  -- Transactional critical section (table-scoped advisory lock)\\\\n  perform pg_advisory_xact_lock(hashtext(p_tenant_id::text || coalesce(p_table_id::text,'')))","\\\\n\\\\n  -- CAS: ensure cart_version matches and bump it\\\\n  select cart_version into v_cur_version\\\\n  from public.table_sessions\\\\n  where tenant_id = p_tenant_id and id = p_session_id\\\\n  for update","\\\\n\\\\n  if not found or v_cur_version <> p_cart_version then\\\\n    raise exception 'stale_cart' using errcode = '55000'","\\\\n  end if","\\\\n\\\\n  update public.table_sessions\\\\n     set cart_version = cart_version + 1\\\\n   where tenant_id = p_tenant_id and id = p_session_id","\\\\n\\\\n  -- One active order per table for dine-in (also enforced by partial unique index)\\\\n  if p_mode = 'table' and p_table_id is not null then\\\\n    if exists (\\\\n      select 1 from public.orders\\\\n       where tenant_id = p_tenant_id\\\\n         and table_id = p_table_id\\\\n         and status in ('pending','processing')\\\\n    ) then\\\\n      raise exception 'active_order_exists' using errcode = '55000'","\\\\n    end if","\\\\n  end if","\\\\n\\\\n  -- Insert order"," tenant + idempotency_key unique handles duplicates\\\\n  insert into public.orders(\\\\n    tenant_id, session_id, table_id, mode, status, total_cents, idempotency_key\\\\n  ) values (\\\\n    p_tenant_id, p_session_id, case when p_mode='table' then p_table_id else null end,\\\\n    p_mode, 'pending', p_total_cents, p_idempotency_key\\\\n  )\\\\n  returning id into v_existing_id","\\\\n\\\\n  return query select v_existing_id, false","\\\\nend","\\\\n$fn$",""}	weathered_pine
20250826080420	{"\\\\n\\\\nDROP POLICY IF EXISTS \\"staff_self_select\\" ON public.staff","\\\\n\\\\nCREATE POLICY \\"staff_self_select\\"\\\\nON public.staff\\\\nFOR SELECT\\\\nTO authenticated\\\\nUSING (user_id = auth.uid())",""}	silver_art
\.


--
-- TOC entry 5540 (class 0 OID 22805)
-- Dependencies: 399
-- Data for Name: seed_files; Type: TABLE DATA; Schema: supabase_migrations; Owner: postgres
--

COPY supabase_migrations.seed_files (path, hash) FROM stdin;
\.


--
-- TOC entry 4149 (class 0 OID 16658)
-- Dependencies: 361
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5949 (class 0 OID 0)
-- Dependencies: 353
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 325, true);


--
-- TOC entry 5950 (class 0 OID 0)
-- Dependencies: 378
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1270, true);


--
-- TOC entry 4589 (class 2606 OID 17054)
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- TOC entry 4544 (class 2606 OID 17055)
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 4612 (class 2606 OID 17056)
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- TOC entry 4568 (class 2606 OID 17057)
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- TOC entry 4570 (class 2606 OID 17058)
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- TOC entry 4542 (class 2606 OID 17059)
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- TOC entry 4591 (class 2606 OID 17060)
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- TOC entry 4587 (class 2606 OID 17061)
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- TOC entry 4579 (class 2606 OID 17062)
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- TOC entry 4581 (class 2606 OID 17063)
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- TOC entry 4895 (class 2606 OID 17064)
-- Name: oauth_clients oauth_clients_client_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_client_id_key UNIQUE (client_id);


--
-- TOC entry 4898 (class 2606 OID 17065)
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- TOC entry 4616 (class 2606 OID 17066)
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4536 (class 2606 OID 17067)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4539 (class 2606 OID 17068)
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- TOC entry 4601 (class 2606 OID 17069)
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- TOC entry 4603 (class 2606 OID 17070)
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- TOC entry 4608 (class 2606 OID 17071)
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- TOC entry 4547 (class 2606 OID 17072)
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- TOC entry 4574 (class 2606 OID 17073)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4598 (class 2606 OID 17074)
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- TOC entry 4593 (class 2606 OID 17075)
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- TOC entry 4529 (class 2606 OID 17076)
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- TOC entry 4531 (class 2606 OID 17077)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4887 (class 2606 OID 17078)
-- Name: analytics_daily analytics_daily_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analytics_daily
    ADD CONSTRAINT analytics_daily_pkey PRIMARY KEY (tenant_id, day);


--
-- TOC entry 4737 (class 2606 OID 17079)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4955 (class 2606 OID 107557)
-- Name: billing_plans billing_plans_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing_plans
    ADD CONSTRAINT billing_plans_code_key UNIQUE (code);


--
-- TOC entry 4957 (class 2606 OID 107555)
-- Name: billing_plans billing_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing_plans
    ADD CONSTRAINT billing_plans_pkey PRIMARY KEY (id);


--
-- TOC entry 4948 (class 2606 OID 106069)
-- Name: billing_webhooks billing_webhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing_webhooks
    ADD CONSTRAINT billing_webhooks_pkey PRIMARY KEY (id);


--
-- TOC entry 4950 (class 2606 OID 106071)
-- Name: billing_webhooks billing_webhooks_provider_event_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing_webhooks
    ADD CONSTRAINT billing_webhooks_provider_event_id_key UNIQUE (provider, event_id);


--
-- TOC entry 4876 (class 2606 OID 17080)
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4870 (class 2606 OID 17081)
-- Name: cart_sessions cart_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_sessions
    ADD CONSTRAINT cart_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4872 (class 2606 OID 17082)
-- Name: cart_sessions cart_sessions_session_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_sessions
    ADD CONSTRAINT cart_sessions_session_token_key UNIQUE (session_token);


--
-- TOC entry 4918 (class 2606 OID 17083)
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- TOC entry 4648 (class 2606 OID 17084)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4665 (class 2606 OID 17085)
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- TOC entry 4667 (class 2606 OID 17086)
-- Name: customers customers_tenant_id_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_tenant_id_email_key UNIQUE (tenant_id, email);


--
-- TOC entry 4669 (class 2606 OID 17087)
-- Name: customers customers_tenant_id_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_tenant_id_phone_key UNIQUE (tenant_id, phone);


--
-- TOC entry 4793 (class 2606 OID 17088)
-- Name: customization customization_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customization
    ADD CONSTRAINT customization_pkey PRIMARY KEY (tenant_id);


--
-- TOC entry 4742 (class 2606 OID 17089)
-- Name: daily_sales_summary daily_sales_summary_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_sales_summary
    ADD CONSTRAINT daily_sales_summary_pkey PRIMARY KEY (id);


--
-- TOC entry 4744 (class 2606 OID 17090)
-- Name: daily_sales_summary daily_sales_summary_tenant_id_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_sales_summary
    ADD CONSTRAINT daily_sales_summary_tenant_id_date_key UNIQUE (tenant_id, date);


--
-- TOC entry 4795 (class 2606 OID 17091)
-- Name: domain_events domain_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.domain_events
    ADD CONSTRAINT domain_events_pkey PRIMARY KEY (id);


--
-- TOC entry 4720 (class 2606 OID 17092)
-- Name: inventory_items inventory_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4892 (class 2606 OID 17093)
-- Name: invitations invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_pkey PRIMARY KEY (id);


--
-- TOC entry 4776 (class 2606 OID 17094)
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- TOC entry 4791 (class 2606 OID 17095)
-- Name: menu_categories menu_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_categories
    ADD CONSTRAINT menu_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4662 (class 2606 OID 17096)
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4914 (class 2606 OID 17098)
-- Name: menu_sections menu_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_sections
    ADD CONSTRAINT menu_sections_pkey PRIMARY KEY (id);


--
-- TOC entry 4916 (class 2606 OID 17099)
-- Name: menu_sections menu_sections_tenant_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_sections
    ADD CONSTRAINT menu_sections_tenant_name_unique UNIQUE (tenant_id, name);


--
-- TOC entry 4735 (class 2606 OID 17100)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4707 (class 2606 OID 17101)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4806 (class 2606 OID 17102)
-- Name: order_status_events order_status_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_events
    ADD CONSTRAINT order_status_events_pkey PRIMARY KEY (id);


--
-- TOC entry 4694 (class 2606 OID 17103)
-- Name: orders orders_order_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_code_key UNIQUE (order_code);


--
-- TOC entry 4696 (class 2606 OID 17104)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 4698 (class 2606 OID 17105)
-- Name: orders orders_tenant_id_order_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_tenant_id_order_number_key UNIQUE (tenant_id, order_number);


--
-- TOC entry 4863 (class 2606 OID 17106)
-- Name: payment_events payment_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_events
    ADD CONSTRAINT payment_events_pkey PRIMARY KEY (id);


--
-- TOC entry 4855 (class 2606 OID 17107)
-- Name: payment_intents payment_intents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_intents
    ADD CONSTRAINT payment_intents_pkey PRIMARY KEY (id);


--
-- TOC entry 4839 (class 2606 OID 17108)
-- Name: payment_providers payment_providers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_providers
    ADD CONSTRAINT payment_providers_pkey PRIMARY KEY (id);


--
-- TOC entry 4841 (class 2606 OID 17109)
-- Name: payment_providers payment_providers_tenant_provider_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_providers
    ADD CONSTRAINT payment_providers_tenant_provider_key UNIQUE (tenant_id, provider);


--
-- TOC entry 4819 (class 2606 OID 17110)
-- Name: payment_refunds payment_refunds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_refunds
    ADD CONSTRAINT payment_refunds_pkey PRIMARY KEY (id);


--
-- TOC entry 4828 (class 2606 OID 17111)
-- Name: payment_splits payment_splits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_splits
    ADD CONSTRAINT payment_splits_pkey PRIMARY KEY (id);


--
-- TOC entry 4713 (class 2606 OID 17112)
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- TOC entry 4835 (class 2606 OID 17113)
-- Name: printer_configs printer_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.printer_configs
    ADD CONSTRAINT printer_configs_pkey PRIMARY KEY (id);


--
-- TOC entry 4868 (class 2606 OID 17114)
-- Name: qr_scans qr_scans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_scans
    ADD CONSTRAINT qr_scans_pkey PRIMARY KEY (id);


--
-- TOC entry 4832 (class 2606 OID 17115)
-- Name: receipt_deliveries receipt_deliveries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receipt_deliveries
    ADD CONSTRAINT receipt_deliveries_pkey PRIMARY KEY (id);


--
-- TOC entry 4908 (class 2606 OID 17116)
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);


--
-- TOC entry 4768 (class 2606 OID 17119)
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- TOC entry 4727 (class 2606 OID 17120)
-- Name: staff_schedules staff_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_schedules
    ADD CONSTRAINT staff_schedules_pkey PRIMARY KEY (id);


--
-- TOC entry 4770 (class 2606 OID 17121)
-- Name: staff staff_tenant_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_tenant_id_user_id_key UNIQUE (tenant_id, user_id);


--
-- TOC entry 4946 (class 2606 OID 105871)
-- Name: subscription_events subscription_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_events
    ADD CONSTRAINT subscription_events_pkey PRIMARY KEY (id);


--
-- TOC entry 4938 (class 2606 OID 105744)
-- Name: subscription_plans subscription_plans_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_code_key UNIQUE (code);


--
-- TOC entry 4940 (class 2606 OID 105742)
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- TOC entry 4760 (class 2606 OID 17122)
-- Name: table_sessions table_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.table_sessions
    ADD CONSTRAINT table_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4785 (class 2606 OID 17123)
-- Name: tables tables_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tables
    ADD CONSTRAINT tables_pkey PRIMARY KEY (id);


--
-- TOC entry 4942 (class 2606 OID 105834)
-- Name: tenant_entitlements tenant_entitlements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_entitlements
    ADD CONSTRAINT tenant_entitlements_pkey PRIMARY KEY (id);


--
-- TOC entry 4944 (class 2606 OID 105836)
-- Name: tenant_entitlements tenant_entitlements_tenant_id_feature_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_entitlements
    ADD CONSTRAINT tenant_entitlements_tenant_id_feature_key_key UNIQUE (tenant_id, feature_key);


--
-- TOC entry 4929 (class 2606 OID 17125)
-- Name: tenant_settings tenant_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_settings
    ADD CONSTRAINT tenant_settings_pkey PRIMARY KEY (tenant_id);


--
-- TOC entry 4936 (class 2606 OID 105657)
-- Name: tenant_subscriptions tenant_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_subscriptions
    ADD CONSTRAINT tenant_subscriptions_pkey PRIMARY KEY (id);


--
-- TOC entry 4927 (class 2606 OID 17126)
-- Name: tenant_tax_config tenant_tax_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_tax_config
    ADD CONSTRAINT tenant_tax_config_pkey PRIMARY KEY (tenant_id);


--
-- TOC entry 4638 (class 2606 OID 17127)
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- TOC entry 4640 (class 2606 OID 17128)
-- Name: tenants tenants_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_slug_key UNIQUE (slug);


--
-- TOC entry 4911 (class 2606 OID 17129)
-- Name: tm_settings tm_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tm_settings
    ADD CONSTRAINT tm_settings_pkey PRIMARY KEY (tenant_id);


--
-- TOC entry 4787 (class 2606 OID 117561)
-- Name: tables uq_tables_tenant_code; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tables
    ADD CONSTRAINT uq_tables_tenant_code UNIQUE (tenant_id, code);


--
-- TOC entry 4644 (class 2606 OID 17133)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4646 (class 2606 OID 17134)
-- Name: users users_tenant_id_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_email_key UNIQUE (tenant_id, email);


--
-- TOC entry 4982 (class 2606 OID 118443)
-- Name: zones zones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT zones_pkey PRIMARY KEY (id);


--
-- TOC entry 4633 (class 2606 OID 17136)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4960 (class 2606 OID 111039)
-- Name: messages_2025_09_28 messages_2025_09_28_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_09_28
    ADD CONSTRAINT messages_2025_09_28_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4963 (class 2606 OID 111112)
-- Name: messages_2025_09_29 messages_2025_09_29_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_09_29
    ADD CONSTRAINT messages_2025_09_29_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4966 (class 2606 OID 112227)
-- Name: messages_2025_09_30 messages_2025_09_30_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_09_30
    ADD CONSTRAINT messages_2025_09_30_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4969 (class 2606 OID 113563)
-- Name: messages_2025_10_01 messages_2025_10_01_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_10_01
    ADD CONSTRAINT messages_2025_10_01_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4972 (class 2606 OID 114678)
-- Name: messages_2025_10_02 messages_2025_10_02_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_10_02
    ADD CONSTRAINT messages_2025_10_02_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4975 (class 2606 OID 115793)
-- Name: messages_2025_10_03 messages_2025_10_03_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_10_03
    ADD CONSTRAINT messages_2025_10_03_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4978 (class 2606 OID 117890)
-- Name: messages_2025_10_04 messages_2025_10_04_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_10_04
    ADD CONSTRAINT messages_2025_10_04_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4985 (class 2606 OID 120085)
-- Name: messages_2025_10_05 messages_2025_10_05_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_10_05
    ADD CONSTRAINT messages_2025_10_05_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4629 (class 2606 OID 17145)
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- TOC entry 4626 (class 2606 OID 17146)
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- TOC entry 4750 (class 2606 OID 17147)
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- TOC entry 4550 (class 2606 OID 17148)
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- TOC entry 4560 (class 2606 OID 17149)
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- TOC entry 4562 (class 2606 OID 17150)
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4558 (class 2606 OID 17151)
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- TOC entry 4748 (class 2606 OID 17152)
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
-- TOC entry 4624 (class 2606 OID 17153)
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- TOC entry 4622 (class 2606 OID 17154)
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- TOC entry 4635 (class 2606 OID 17155)
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: postgres
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- TOC entry 4752 (class 2606 OID 17156)
-- Name: seed_files seed_files_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: postgres
--

ALTER TABLE ONLY supabase_migrations.seed_files
    ADD CONSTRAINT seed_files_pkey PRIMARY KEY (path);


--
-- TOC entry 4545 (class 1259 OID 16532)
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- TOC entry 4519 (class 1259 OID 16748)
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4520 (class 1259 OID 16750)
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4521 (class 1259 OID 16751)
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4577 (class 1259 OID 16829)
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- TOC entry 4610 (class 1259 OID 16937)
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- TOC entry 4566 (class 1259 OID 16917)
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- TOC entry 5951 (class 0 OID 0)
-- Dependencies: 4566
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- TOC entry 4571 (class 1259 OID 16745)
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- TOC entry 4613 (class 1259 OID 16934)
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- TOC entry 4614 (class 1259 OID 16935)
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- TOC entry 4585 (class 1259 OID 16940)
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- TOC entry 4582 (class 1259 OID 16801)
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- TOC entry 4583 (class 1259 OID 16946)
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- TOC entry 4893 (class 1259 OID 58425)
-- Name: oauth_clients_client_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_clients_client_id_idx ON auth.oauth_clients USING btree (client_id);


--
-- TOC entry 4896 (class 1259 OID 58426)
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- TOC entry 4617 (class 1259 OID 16993)
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- TOC entry 4618 (class 1259 OID 16992)
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- TOC entry 4619 (class 1259 OID 16994)
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- TOC entry 4522 (class 1259 OID 16752)
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4523 (class 1259 OID 16749)
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4532 (class 1259 OID 16515)
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- TOC entry 4533 (class 1259 OID 16516)
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- TOC entry 4534 (class 1259 OID 16744)
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- TOC entry 4537 (class 1259 OID 16831)
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- TOC entry 4540 (class 1259 OID 16936)
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- TOC entry 4604 (class 1259 OID 16873)
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- TOC entry 4605 (class 1259 OID 16938)
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- TOC entry 4606 (class 1259 OID 16888)
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- TOC entry 4609 (class 1259 OID 16887)
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- TOC entry 4572 (class 1259 OID 16939)
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- TOC entry 4575 (class 1259 OID 16830)
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- TOC entry 4596 (class 1259 OID 16855)
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- TOC entry 4599 (class 1259 OID 16854)
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- TOC entry 4594 (class 1259 OID 16840)
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- TOC entry 4595 (class 1259 OID 17002)
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- TOC entry 4584 (class 1259 OID 16999)
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- TOC entry 4576 (class 1259 OID 16828)
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- TOC entry 4524 (class 1259 OID 16908)
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- TOC entry 5952 (class 0 OID 0)
-- Dependencies: 4524
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- TOC entry 4525 (class 1259 OID 16746)
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- TOC entry 4526 (class 1259 OID 16505)
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- TOC entry 4527 (class 1259 OID 16963)
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- TOC entry 4649 (class 1259 OID 79871)
-- Name: categories_tenant_name_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX categories_tenant_name_unique ON public.categories USING btree (tenant_id, name);


--
-- TOC entry 4888 (class 1259 OID 45862)
-- Name: idx_analytics_daily_tenant_day; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_daily_tenant_day ON public.analytics_daily USING btree (tenant_id, day);


--
-- TOC entry 4738 (class 1259 OID 17855)
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at);


--
-- TOC entry 4739 (class 1259 OID 17854)
-- Name: idx_audit_logs_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_tenant_id ON public.audit_logs USING btree (tenant_id);


--
-- TOC entry 4740 (class 1259 OID 93264)
-- Name: idx_audit_logs_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);


--
-- TOC entry 4951 (class 1259 OID 106079)
-- Name: idx_bwh_payload_gin; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bwh_payload_gin ON public.billing_webhooks USING gin (payload);


--
-- TOC entry 4952 (class 1259 OID 106078)
-- Name: idx_bwh_provider_event_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bwh_provider_event_type ON public.billing_webhooks USING btree (provider, event_type);


--
-- TOC entry 4953 (class 1259 OID 106077)
-- Name: idx_bwh_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bwh_tenant ON public.billing_webhooks USING btree (tenant_id);


--
-- TOC entry 4877 (class 1259 OID 82220)
-- Name: idx_cart_items_cart; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_items_cart ON public.cart_items USING btree (cart_id);


--
-- TOC entry 4878 (class 1259 OID 93286)
-- Name: idx_cart_items_menu_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_items_menu_item_id ON public.cart_items USING btree (menu_item_id);


--
-- TOC entry 4879 (class 1259 OID 82221)
-- Name: idx_cart_items_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_items_tenant ON public.cart_items USING btree (tenant_id);


--
-- TOC entry 4880 (class 1259 OID 94356)
-- Name: idx_cart_items_tenant_cart; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_items_tenant_cart ON public.cart_items USING btree (tenant_id, cart_id);


--
-- TOC entry 4881 (class 1259 OID 99633)
-- Name: idx_cart_items_tenant_cart_item; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_items_tenant_cart_item ON public.cart_items USING btree (tenant_id, cart_id, menu_item_id);


--
-- TOC entry 4882 (class 1259 OID 94378)
-- Name: idx_cart_items_tenant_menu_item; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_items_tenant_menu_item ON public.cart_items USING btree (tenant_id, menu_item_id);


--
-- TOC entry 4873 (class 1259 OID 93308)
-- Name: idx_cart_sessions_table_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_sessions_table_id ON public.cart_sessions USING btree (table_id);


--
-- TOC entry 4874 (class 1259 OID 93330)
-- Name: idx_cart_sessions_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_sessions_tenant_id ON public.cart_sessions USING btree (tenant_id);


--
-- TOC entry 4919 (class 1259 OID 82179)
-- Name: idx_carts_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_carts_status ON public.carts USING btree (status);


--
-- TOC entry 4920 (class 1259 OID 82178)
-- Name: idx_carts_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_carts_tenant ON public.carts USING btree (tenant_id);


--
-- TOC entry 4921 (class 1259 OID 99677)
-- Name: idx_carts_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_carts_tenant_id ON public.carts USING btree (tenant_id, id);


--
-- TOC entry 4922 (class 1259 OID 97560)
-- Name: idx_carts_tenant_user_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_carts_tenant_user_created ON public.carts USING btree (tenant_id, user_id, created_at DESC);


--
-- TOC entry 4923 (class 1259 OID 84048)
-- Name: idx_carts_tenant_user_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_carts_tenant_user_status ON public.carts USING btree (tenant_id, user_id, status);


--
-- TOC entry 4924 (class 1259 OID 84049)
-- Name: idx_carts_user_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_carts_user_created_at ON public.carts USING btree (user_id, created_at DESC);


--
-- TOC entry 4650 (class 1259 OID 97972)
-- Name: idx_categories_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_categories_tenant_id ON public.categories USING btree (tenant_id);


--
-- TOC entry 4670 (class 1259 OID 96956)
-- Name: idx_customers_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customers_tenant ON public.customers USING btree (tenant_id);


--
-- TOC entry 4671 (class 1259 OID 97322)
-- Name: idx_customers_tenant_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customers_tenant_created ON public.customers USING btree (tenant_id, created_at DESC);


--
-- TOC entry 4672 (class 1259 OID 95332)
-- Name: idx_customers_tenant_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customers_tenant_email ON public.customers USING btree (tenant_id, email);


--
-- TOC entry 4673 (class 1259 OID 95333)
-- Name: idx_customers_tenant_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customers_tenant_phone ON public.customers USING btree (tenant_id, phone);


--
-- TOC entry 4745 (class 1259 OID 97973)
-- Name: idx_daily_sales_summary_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_daily_sales_summary_tenant_id ON public.daily_sales_summary USING btree (tenant_id);


--
-- TOC entry 4714 (class 1259 OID 95585)
-- Name: idx_inventory_items_name_trgm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_items_name_trgm ON public.inventory_items USING gin (name public.gin_trgm_ops);


--
-- TOC entry 4715 (class 1259 OID 93352)
-- Name: idx_inventory_items_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_items_tenant_id ON public.inventory_items USING btree (tenant_id);


--
-- TOC entry 4716 (class 1259 OID 95606)
-- Name: idx_inventory_items_tenant_restocked; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_items_tenant_restocked ON public.inventory_items USING btree (tenant_id, last_restocked_at DESC);


--
-- TOC entry 4717 (class 1259 OID 97366)
-- Name: idx_inventory_items_tenant_updated; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_items_tenant_updated ON public.inventory_items USING btree (tenant_id, updated_at DESC);


--
-- TOC entry 4718 (class 1259 OID 95460)
-- Name: idx_inventory_tenant_low_stock; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_tenant_low_stock ON public.inventory_items USING btree (tenant_id, current_stock, minimum_stock) WHERE (current_stock <= minimum_stock);


--
-- TOC entry 4889 (class 1259 OID 54674)
-- Name: idx_invitations_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_invitations_email ON public.invitations USING btree (email);


--
-- TOC entry 4890 (class 1259 OID 54675)
-- Name: idx_invitations_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_invitations_tenant ON public.invitations USING btree (tenant_id);


--
-- TOC entry 4772 (class 1259 OID 97388)
-- Name: idx_locations_tenant_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_locations_tenant_created ON public.locations USING btree (tenant_id, created_at DESC);


--
-- TOC entry 4773 (class 1259 OID 93374)
-- Name: idx_locations_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_locations_tenant_id ON public.locations USING btree (tenant_id);


--
-- TOC entry 4774 (class 1259 OID 95688)
-- Name: idx_locations_tenant_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_locations_tenant_name ON public.locations USING btree (tenant_id, name);


--
-- TOC entry 4788 (class 1259 OID 93396)
-- Name: idx_menu_categories_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_categories_tenant_id ON public.menu_categories USING btree (tenant_id);


--
-- TOC entry 4789 (class 1259 OID 95730)
-- Name: idx_menu_categories_tenant_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_categories_tenant_name ON public.menu_categories USING btree (tenant_id, name);


--
-- TOC entry 4651 (class 1259 OID 17847)
-- Name: idx_menu_items_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_items_category_id ON public.menu_items USING btree (category_id);


--
-- TOC entry 4652 (class 1259 OID 77746)
-- Name: idx_menu_items_section; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_items_section ON public.menu_items USING btree (section_id);


--
-- TOC entry 4653 (class 1259 OID 27375)
-- Name: idx_menu_items_tenant_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_items_tenant_active ON public.menu_items USING btree (tenant_id, active);


--
-- TOC entry 4654 (class 1259 OID 109904)
-- Name: idx_menu_items_tenant_available; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_items_tenant_available ON public.menu_items USING btree (tenant_id, is_available);


--
-- TOC entry 4655 (class 1259 OID 17846)
-- Name: idx_menu_items_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_items_tenant_id ON public.menu_items USING btree (tenant_id);


--
-- TOC entry 4656 (class 1259 OID 93938)
-- Name: idx_menu_items_tenant_section; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_items_tenant_section ON public.menu_items USING btree (tenant_id, section_id);


--
-- TOC entry 4657 (class 1259 OID 94568)
-- Name: idx_menu_items_tenant_section_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_items_tenant_section_active ON public.menu_items USING btree (tenant_id, section_id, active) WHERE (active = true);


--
-- TOC entry 4658 (class 1259 OID 109905)
-- Name: idx_menu_items_tenant_section_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_items_tenant_section_name ON public.menu_items USING btree (tenant_id, section_id, name);


--
-- TOC entry 4659 (class 1259 OID 77744)
-- Name: idx_menu_items_tenant_section_ord; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_items_tenant_section_ord ON public.menu_items USING btree (tenant_id, section_id, ord);


--
-- TOC entry 4660 (class 1259 OID 109906)
-- Name: idx_menu_items_tenant_section_price; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_items_tenant_section_price ON public.menu_items USING btree (tenant_id, section_id, price);


--
-- TOC entry 4912 (class 1259 OID 77179)
-- Name: idx_menu_sections_tenant_ord; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_sections_tenant_ord ON public.menu_sections USING btree (tenant_id, ord);


--
-- TOC entry 4728 (class 1259 OID 17853)
-- Name: idx_notifications_is_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_is_read ON public.notifications USING btree (is_read);


--
-- TOC entry 4729 (class 1259 OID 97410)
-- Name: idx_notifications_tenant_created_desc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_tenant_created_desc ON public.notifications USING btree (tenant_id, created_at DESC);


--
-- TOC entry 4730 (class 1259 OID 93418)
-- Name: idx_notifications_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_tenant_id ON public.notifications USING btree (tenant_id);


--
-- TOC entry 4731 (class 1259 OID 95022)
-- Name: idx_notifications_tenant_user_isread; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_tenant_user_isread ON public.notifications USING btree (tenant_id, user_id, is_read);


--
-- TOC entry 4732 (class 1259 OID 94314)
-- Name: idx_notifications_tenant_user_unread; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_tenant_user_unread ON public.notifications USING btree (tenant_id, user_id, is_read) WHERE (is_read = false);


--
-- TOC entry 4733 (class 1259 OID 17852)
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- TOC entry 4701 (class 1259 OID 93440)
-- Name: idx_order_items_menu_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_menu_item_id ON public.order_items USING btree (menu_item_id);


--
-- TOC entry 4702 (class 1259 OID 17851)
-- Name: idx_order_items_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);


--
-- TOC entry 4703 (class 1259 OID 97436)
-- Name: idx_order_items_tenant_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_tenant_created ON public.order_items USING btree (tenant_id, created_at);


--
-- TOC entry 4704 (class 1259 OID 73280)
-- Name: idx_order_items_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_tenant_id ON public.order_items USING btree (tenant_id);


--
-- TOC entry 4705 (class 1259 OID 94170)
-- Name: idx_order_items_tenant_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_tenant_order ON public.order_items USING btree (tenant_id, order_id);


--
-- TOC entry 4796 (class 1259 OID 39547)
-- Name: idx_order_status_events_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_status_events_created_at ON public.order_status_events USING btree (created_at);


--
-- TOC entry 4797 (class 1259 OID 39546)
-- Name: idx_order_status_events_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_status_events_order_id ON public.order_status_events USING btree (order_id);


--
-- TOC entry 4674 (class 1259 OID 101557)
-- Name: idx_orders_cart; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_cart ON public.orders USING btree (cart_id);


--
-- TOC entry 4675 (class 1259 OID 17850)
-- Name: idx_orders_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at);


--
-- TOC entry 4676 (class 1259 OID 93506)
-- Name: idx_orders_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_customer_id ON public.orders USING btree (customer_id);


--
-- TOC entry 4677 (class 1259 OID 93528)
-- Name: idx_orders_staff_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_staff_id ON public.orders USING btree (staff_id);


--
-- TOC entry 4678 (class 1259 OID 17849)
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- TOC entry 4679 (class 1259 OID 93550)
-- Name: idx_orders_table_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_table_id ON public.orders USING btree (table_id);


--
-- TOC entry 4680 (class 1259 OID 101556)
-- Name: idx_orders_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_tenant ON public.orders USING btree (tenant_id);


--
-- TOC entry 4681 (class 1259 OID 98136)
-- Name: idx_orders_tenant_archived; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_tenant_archived ON public.orders USING btree (tenant_id, archived_at) WHERE (archived_at IS NOT NULL);


--
-- TOC entry 4682 (class 1259 OID 25253)
-- Name: idx_orders_tenant_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_tenant_created ON public.orders USING btree (tenant_id, created_at DESC);


--
-- TOC entry 4683 (class 1259 OID 85513)
-- Name: idx_orders_tenant_curr_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_tenant_curr_created ON public.orders USING btree (tenant_id, currency, created_at DESC);


--
-- TOC entry 4684 (class 1259 OID 17848)
-- Name: idx_orders_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_tenant_id ON public.orders USING btree (tenant_id);


--
-- TOC entry 4685 (class 1259 OID 98137)
-- Name: idx_orders_tenant_open_recent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_tenant_open_recent ON public.orders USING btree (tenant_id, status, created_at DESC) WHERE ((archived_at IS NULL) AND (status = ANY (ARRAY['pending'::public.order_status, 'preparing'::public.order_status, 'ready'::public.order_status])));


--
-- TOC entry 4686 (class 1259 OID 27374)
-- Name: idx_orders_tenant_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_tenant_status ON public.orders USING btree (tenant_id, status);


--
-- TOC entry 4687 (class 1259 OID 94732)
-- Name: idx_orders_tenant_status_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_tenant_status_active ON public.orders USING btree (tenant_id, status) WHERE (status = ANY (ARRAY['pending'::public.order_status, 'confirmed'::public.order_status, 'preparing'::public.order_status, 'ready'::public.order_status, 'processing'::public.order_status, 'placed'::public.order_status]));


--
-- TOC entry 4688 (class 1259 OID 93917)
-- Name: idx_orders_tenant_status_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_tenant_status_created ON public.orders USING btree (tenant_id, status, created_at DESC);


--
-- TOC entry 4689 (class 1259 OID 98180)
-- Name: idx_orders_tenant_status_open_recent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_tenant_status_open_recent ON public.orders USING btree (tenant_id, status, created_at DESC) WHERE ((archived_at IS NULL) AND (status = ANY (ARRAY['pending'::public.order_status, 'preparing'::public.order_status, 'ready'::public.order_status, 'processing'::public.order_status, 'placed'::public.order_status, 'confirmed'::public.order_status])));


--
-- TOC entry 4690 (class 1259 OID 98468)
-- Name: idx_orders_tenant_table_nonnull; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_tenant_table_nonnull ON public.orders USING btree (tenant_id, table_code) WHERE (table_code IS NOT NULL);


--
-- TOC entry 4691 (class 1259 OID 94774)
-- Name: idx_orders_tenant_table_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_tenant_table_status ON public.orders USING btree (tenant_id, table_id, status);


--
-- TOC entry 4692 (class 1259 OID 84072)
-- Name: idx_orders_tenant_user_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_tenant_user_created ON public.orders USING btree (tenant_id, user_id, created_at DESC);


--
-- TOC entry 4798 (class 1259 OID 93462)
-- Name: idx_ose_changed_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ose_changed_by ON public.order_status_events USING btree (changed_by);


--
-- TOC entry 4799 (class 1259 OID 93484)
-- Name: idx_ose_changed_by_staff_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ose_changed_by_staff_id ON public.order_status_events USING btree (changed_by_staff_id);


--
-- TOC entry 4800 (class 1259 OID 94856)
-- Name: idx_ose_order_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ose_order_created ON public.order_status_events USING btree (order_id, created_at DESC);


--
-- TOC entry 4801 (class 1259 OID 35246)
-- Name: idx_ose_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ose_tenant ON public.order_status_events USING btree (tenant_id);


--
-- TOC entry 4802 (class 1259 OID 36302)
-- Name: idx_ose_tenant_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ose_tenant_created ON public.order_status_events USING btree (tenant_id, created_at);


--
-- TOC entry 4803 (class 1259 OID 95854)
-- Name: idx_ose_tenant_order_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ose_tenant_order_created ON public.order_status_events USING btree (tenant_id, order_id, created_at DESC);


--
-- TOC entry 4804 (class 1259 OID 35330)
-- Name: idx_ose_to_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ose_to_status ON public.order_status_events USING btree (to_status);


--
-- TOC entry 4856 (class 1259 OID 39476)
-- Name: idx_payment_events_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_events_created_at ON public.payment_events USING btree (created_at);


--
-- TOC entry 4857 (class 1259 OID 39065)
-- Name: idx_payment_events_event_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_events_event_type ON public.payment_events USING btree (event_type);


--
-- TOC entry 4858 (class 1259 OID 97716)
-- Name: idx_payment_events_payment_intent_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_events_payment_intent_id ON public.payment_events USING btree (payment_intent_id);


--
-- TOC entry 4859 (class 1259 OID 38976)
-- Name: idx_payment_events_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_events_tenant_id ON public.payment_events USING btree (tenant_id);


--
-- TOC entry 4860 (class 1259 OID 97798)
-- Name: idx_payment_events_tenant_intent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_events_tenant_intent ON public.payment_events USING btree (tenant_id, payment_intent_id);


--
-- TOC entry 4843 (class 1259 OID 101406)
-- Name: idx_payment_intents_cart; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_intents_cart ON public.payment_intents USING btree (cart_id);


--
-- TOC entry 4844 (class 1259 OID 38894)
-- Name: idx_payment_intents_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_intents_status ON public.payment_intents USING btree (status);


--
-- TOC entry 4845 (class 1259 OID 101382)
-- Name: idx_payment_intents_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_intents_tenant ON public.payment_intents USING btree (tenant_id);


--
-- TOC entry 4846 (class 1259 OID 38892)
-- Name: idx_payment_intents_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_intents_tenant_id ON public.payment_intents USING btree (tenant_id);


--
-- TOC entry 4847 (class 1259 OID 94444)
-- Name: idx_payment_intents_tenant_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_intents_tenant_order ON public.payment_intents USING btree (tenant_id, order_id);


--
-- TOC entry 4807 (class 1259 OID 93572)
-- Name: idx_payment_refunds_created_by_staff_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_refunds_created_by_staff_id ON public.payment_refunds USING btree (created_by_staff_id);


--
-- TOC entry 4808 (class 1259 OID 39414)
-- Name: idx_payment_refunds_intent_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_refunds_intent_id ON public.payment_refunds USING btree (payment_intent_id);


--
-- TOC entry 4809 (class 1259 OID 34942)
-- Name: idx_payment_refunds_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_refunds_order ON public.payment_refunds USING btree (order_id);


--
-- TOC entry 4810 (class 1259 OID 34944)
-- Name: idx_payment_refunds_processed_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_refunds_processed_at ON public.payment_refunds USING btree (processed_at);


--
-- TOC entry 4811 (class 1259 OID 93594)
-- Name: idx_payment_refunds_refunded_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_refunds_refunded_by ON public.payment_refunds USING btree (refunded_by);


--
-- TOC entry 4812 (class 1259 OID 34943)
-- Name: idx_payment_refunds_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_refunds_status ON public.payment_refunds USING btree (status);


--
-- TOC entry 4820 (class 1259 OID 34573)
-- Name: idx_payment_splits_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_splits_order ON public.payment_splits USING btree (order_id);


--
-- TOC entry 4821 (class 1259 OID 93616)
-- Name: idx_payment_splits_payer_staff_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_splits_payer_staff_id ON public.payment_splits USING btree (payer_staff_id);


--
-- TOC entry 4708 (class 1259 OID 93638)
-- Name: idx_payments_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_order_id ON public.payments USING btree (order_id);


--
-- TOC entry 4709 (class 1259 OID 95164)
-- Name: idx_payments_tenant_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_tenant_created ON public.payments USING btree (tenant_id, created_at DESC);


--
-- TOC entry 4710 (class 1259 OID 93660)
-- Name: idx_payments_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_tenant_id ON public.payments USING btree (tenant_id);


--
-- TOC entry 4711 (class 1259 OID 95896)
-- Name: idx_payments_tenant_order_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_tenant_order_created ON public.payments USING btree (tenant_id, order_id, created_at DESC);


--
-- TOC entry 4861 (class 1259 OID 37469)
-- Name: idx_pe_event_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_pe_event_id ON public.payment_events USING btree (provider, event_id);


--
-- TOC entry 4848 (class 1259 OID 42513)
-- Name: idx_pi_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pi_created_at ON public.payment_intents USING btree (created_at);


--
-- TOC entry 4849 (class 1259 OID 97192)
-- Name: idx_pi_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pi_order ON public.payment_intents USING btree (order_id);


--
-- TOC entry 4850 (class 1259 OID 42619)
-- Name: idx_pi_provider; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pi_provider ON public.payment_intents USING btree (provider_id);


--
-- TOC entry 4851 (class 1259 OID 37337)
-- Name: idx_pi_provider_intent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pi_provider_intent ON public.payment_intents USING btree (provider, provider_intent_id);


--
-- TOC entry 4852 (class 1259 OID 37336)
-- Name: idx_pi_tenant_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pi_tenant_created ON public.payment_intents USING btree (tenant_id, created_at);


--
-- TOC entry 4853 (class 1259 OID 95206)
-- Name: idx_pi_tenant_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pi_tenant_status ON public.payment_intents USING btree (tenant_id, status);


--
-- TOC entry 4836 (class 1259 OID 37107)
-- Name: idx_pp_provider; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pp_provider ON public.payment_providers USING btree (provider);


--
-- TOC entry 4837 (class 1259 OID 37106)
-- Name: idx_pp_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pp_tenant ON public.payment_providers USING btree (tenant_id);


--
-- TOC entry 4813 (class 1259 OID 36026)
-- Name: idx_pr_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pr_created_at ON public.payment_refunds USING btree (created_at);


--
-- TOC entry 4814 (class 1259 OID 97214)
-- Name: idx_pr_payment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pr_payment ON public.payment_refunds USING btree (payment_id);


--
-- TOC entry 4815 (class 1259 OID 96872)
-- Name: idx_pr_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pr_tenant ON public.payment_refunds USING btree (tenant_id);


--
-- TOC entry 4816 (class 1259 OID 97278)
-- Name: idx_pr_tenant_created_desc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pr_tenant_created_desc ON public.payment_refunds USING btree (tenant_id, created_at DESC);


--
-- TOC entry 4817 (class 1259 OID 95248)
-- Name: idx_pr_tenant_status_processed; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pr_tenant_status_processed ON public.payment_refunds USING btree (tenant_id, status, processed_at DESC);


--
-- TOC entry 4833 (class 1259 OID 93682)
-- Name: idx_printer_configs_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_printer_configs_tenant_id ON public.printer_configs USING btree (tenant_id);


--
-- TOC entry 4822 (class 1259 OID 36564)
-- Name: idx_ps_method; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ps_method ON public.payment_splits USING btree (method);


--
-- TOC entry 4823 (class 1259 OID 97236)
-- Name: idx_ps_payment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ps_payment ON public.payment_splits USING btree (payment_id);


--
-- TOC entry 4824 (class 1259 OID 96934)
-- Name: idx_ps_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ps_tenant ON public.payment_splits USING btree (tenant_id);


--
-- TOC entry 4825 (class 1259 OID 97300)
-- Name: idx_ps_tenant_created_desc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ps_tenant_created_desc ON public.payment_splits USING btree (tenant_id, created_at DESC);


--
-- TOC entry 4826 (class 1259 OID 95290)
-- Name: idx_ps_tenant_order_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ps_tenant_order_created ON public.payment_splits USING btree (tenant_id, order_id, created_at DESC);


--
-- TOC entry 4864 (class 1259 OID 93704)
-- Name: idx_qr_scans_table_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_qr_scans_table_id ON public.qr_scans USING btree (table_id);


--
-- TOC entry 4865 (class 1259 OID 93726)
-- Name: idx_qr_scans_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_qr_scans_tenant_id ON public.qr_scans USING btree (tenant_id);


--
-- TOC entry 4866 (class 1259 OID 96060)
-- Name: idx_qr_scans_tenant_table; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_qr_scans_tenant_table ON public.qr_scans USING btree (tenant_id, table_id);


--
-- TOC entry 4829 (class 1259 OID 93748)
-- Name: idx_receipt_deliveries_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_receipt_deliveries_order_id ON public.receipt_deliveries USING btree (order_id);


--
-- TOC entry 4830 (class 1259 OID 96244)
-- Name: idx_receipt_deliveries_order_sent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_receipt_deliveries_order_sent ON public.receipt_deliveries USING btree (order_id, sent_at DESC);


--
-- TOC entry 4899 (class 1259 OID 71771)
-- Name: idx_res_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_res_tenant ON public.reservations USING btree (tenant_id);


--
-- TOC entry 4900 (class 1259 OID 71772)
-- Name: idx_res_tenant_table; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_res_tenant_table ON public.reservations USING btree (tenant_id, table_id);


--
-- TOC entry 4901 (class 1259 OID 93770)
-- Name: idx_reservations_table_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reservations_table_id ON public.reservations USING btree (table_id);


--
-- TOC entry 4902 (class 1259 OID 100934)
-- Name: idx_reservations_tenant_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reservations_tenant_status ON public.reservations USING btree (tenant_id, status);


--
-- TOC entry 4903 (class 1259 OID 100936)
-- Name: idx_reservations_tenant_table; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reservations_tenant_table ON public.reservations USING btree (tenant_id, table_id);


--
-- TOC entry 4904 (class 1259 OID 66525)
-- Name: idx_reservations_tenant_table_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reservations_tenant_table_time ON public.reservations USING btree (tenant_id, table_id, starts_at, ends_at);


--
-- TOC entry 4905 (class 1259 OID 72068)
-- Name: idx_reservations_tenant_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reservations_tenant_time ON public.reservations USING btree (tenant_id, starts_at, ends_at);


--
-- TOC entry 4906 (class 1259 OID 100935)
-- Name: idx_reservations_tenant_window; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reservations_tenant_window ON public.reservations USING btree (tenant_id, starts_at, ends_at);


--
-- TOC entry 4721 (class 1259 OID 97344)
-- Name: idx_ss_tenant_shift; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ss_tenant_shift ON public.staff_schedules USING btree (tenant_id, shift_date);


--
-- TOC entry 4722 (class 1259 OID 93792)
-- Name: idx_staff_schedules_staff_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_staff_schedules_staff_id ON public.staff_schedules USING btree (staff_id);


--
-- TOC entry 4723 (class 1259 OID 95398)
-- Name: idx_staff_schedules_tenant_date_staff; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_staff_schedules_tenant_date_staff ON public.staff_schedules USING btree (tenant_id, shift_date, staff_id);


--
-- TOC entry 4724 (class 1259 OID 93814)
-- Name: idx_staff_schedules_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_staff_schedules_tenant_id ON public.staff_schedules USING btree (tenant_id);


--
-- TOC entry 4725 (class 1259 OID 94422)
-- Name: idx_staff_schedules_tenant_staff_start; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_staff_schedules_tenant_staff_start ON public.staff_schedules USING btree (tenant_id, staff_id, start_time);


--
-- TOC entry 4762 (class 1259 OID 97975)
-- Name: idx_staff_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_staff_tenant_id ON public.staff USING btree (tenant_id);


--
-- TOC entry 4763 (class 1259 OID 102308)
-- Name: idx_staff_tenant_role_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_staff_tenant_role_status ON public.staff USING btree (tenant_id, role, status);


--
-- TOC entry 4764 (class 1259 OID 94400)
-- Name: idx_staff_tenant_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_staff_tenant_user ON public.staff USING btree (tenant_id, user_id);


--
-- TOC entry 4765 (class 1259 OID 27373)
-- Name: idx_staff_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_staff_user ON public.staff USING btree (user_id);


--
-- TOC entry 4766 (class 1259 OID 72136)
-- Name: idx_staff_user_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_staff_user_tenant ON public.staff USING btree (user_id, tenant_id);


--
-- TOC entry 4753 (class 1259 OID 73308)
-- Name: idx_table_sessions_table; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_table_sessions_table ON public.table_sessions USING btree (table_id);


--
-- TOC entry 4754 (class 1259 OID 73307)
-- Name: idx_table_sessions_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_table_sessions_tenant ON public.table_sessions USING btree (tenant_id);


--
-- TOC entry 4755 (class 1259 OID 71646)
-- Name: idx_table_sessions_tenant_table_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_table_sessions_tenant_table_created ON public.table_sessions USING btree (tenant_id, table_id, created_at DESC);


--
-- TOC entry 4756 (class 1259 OID 94690)
-- Name: idx_table_sessions_tenant_table_open; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_table_sessions_tenant_table_open ON public.table_sessions USING btree (tenant_id, table_id, created_at DESC) WHERE (ended_at IS NULL);


--
-- TOC entry 4757 (class 1259 OID 98158)
-- Name: idx_table_sessions_tenant_table_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_table_sessions_tenant_table_status ON public.table_sessions USING btree (tenant_id, table_id, status);


--
-- TOC entry 4758 (class 1259 OID 94940)
-- Name: idx_table_sessions_tenant_table_status_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_table_sessions_tenant_table_status_created ON public.table_sessions USING btree (tenant_id, table_id, status, created_at DESC);


--
-- TOC entry 4777 (class 1259 OID 71770)
-- Name: idx_tables_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tables_code ON public.tables USING btree (code);


--
-- TOC entry 4778 (class 1259 OID 71768)
-- Name: idx_tables_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tables_tenant ON public.tables USING btree (tenant_id);


--
-- TOC entry 4779 (class 1259 OID 100982)
-- Name: idx_tables_tenant_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tables_tenant_code ON public.tables USING btree (tenant_id, code);


--
-- TOC entry 4780 (class 1259 OID 66526)
-- Name: idx_tables_tenant_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tables_tenant_status ON public.tables USING btree (tenant_id, computed_status);


--
-- TOC entry 4781 (class 1259 OID 100983)
-- Name: idx_tables_tenant_table_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tables_tenant_table_number ON public.tables USING btree (tenant_id, table_number);


--
-- TOC entry 4782 (class 1259 OID 118018)
-- Name: idx_tables_tenant_zone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tables_tenant_zone ON public.tables USING btree (tenant_id, zone);


--
-- TOC entry 4783 (class 1259 OID 118019)
-- Name: idx_tables_tenant_zone_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tables_tenant_zone_code ON public.tables USING btree (tenant_id, zone, code);


--
-- TOC entry 4930 (class 1259 OID 105666)
-- Name: idx_tenant_subscriptions_provider; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tenant_subscriptions_provider ON public.tenant_subscriptions USING btree (provider, external_subscription_id);


--
-- TOC entry 4931 (class 1259 OID 105665)
-- Name: idx_tenant_subscriptions_tenant_period; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tenant_subscriptions_tenant_period ON public.tenant_subscriptions USING btree (tenant_id, current_period_end DESC);


--
-- TOC entry 4932 (class 1259 OID 105664)
-- Name: idx_tenant_subscriptions_tenant_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tenant_subscriptions_tenant_status ON public.tenant_subscriptions USING btree (tenant_id, status);


--
-- TOC entry 4909 (class 1259 OID 71774)
-- Name: idx_tm_settings_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tm_settings_tenant ON public.tm_settings USING btree (tenant_id);


--
-- TOC entry 4933 (class 1259 OID 106259)
-- Name: idx_ts_status_end; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ts_status_end ON public.tenant_subscriptions USING btree (status, current_period_end DESC);


--
-- TOC entry 4934 (class 1259 OID 106258)
-- Name: idx_ts_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ts_tenant ON public.tenant_subscriptions USING btree (tenant_id);


--
-- TOC entry 4641 (class 1259 OID 17845)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 4642 (class 1259 OID 17844)
-- Name: idx_users_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_tenant_id ON public.users USING btree (tenant_id);


--
-- TOC entry 4979 (class 1259 OID 118470)
-- Name: idx_zones_tenant_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_zones_tenant_name ON public.zones USING btree (tenant_id, lower(name));


--
-- TOC entry 4980 (class 1259 OID 118471)
-- Name: idx_zones_tenant_ord; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_zones_tenant_ord ON public.zones USING btree (tenant_id, ord);


--
-- TOC entry 4663 (class 1259 OID 79136)
-- Name: menu_items_tenant_section_name_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX menu_items_tenant_section_name_unique ON public.menu_items USING btree (tenant_id, section_id, name);


--
-- TOC entry 4636 (class 1259 OID 27481)
-- Name: tenants_code_key_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tenants_code_key_idx ON public.tenants USING btree (code);


--
-- TOC entry 4761 (class 1259 OID 22972)
-- Name: uniq_active_table_session; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uniq_active_table_session ON public.table_sessions USING btree (tenant_id, table_id) WHERE (status = 'active'::text);


--
-- TOC entry 4883 (class 1259 OID 99676)
-- Name: uq_cart_items_cart_item; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_cart_items_cart_item ON public.cart_items USING btree (cart_id, menu_item_id);


--
-- TOC entry 4771 (class 1259 OID 72844)
-- Name: uq_staff_user_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_staff_user_tenant ON public.staff USING btree (user_id, tenant_id);


--
-- TOC entry 4884 (class 1259 OID 85197)
-- Name: ux_cart_items_cart_menuitem; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ux_cart_items_cart_menuitem ON public.cart_items USING btree (cart_id, menu_item_id);


--
-- TOC entry 4885 (class 1259 OID 82508)
-- Name: ux_cart_items_tenant_cart_item; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ux_cart_items_tenant_cart_item ON public.cart_items USING btree (tenant_id, cart_id, menu_item_id);


--
-- TOC entry 4925 (class 1259 OID 84050)
-- Name: ux_carts_tenant_user_open; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ux_carts_tenant_user_open ON public.carts USING btree (tenant_id, user_id) WHERE (status = 'open'::text);


--
-- TOC entry 4699 (class 1259 OID 25781)
-- Name: ux_orders_active_per_table; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ux_orders_active_per_table ON public.orders USING btree (tenant_id, table_id) WHERE ((table_id IS NOT NULL) AND (status = ANY (ARRAY['pending'::public.order_status, 'processing'::public.order_status])));


--
-- TOC entry 4700 (class 1259 OID 24558)
-- Name: ux_orders_tenant_idem; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ux_orders_tenant_idem ON public.orders USING btree (tenant_id, idempotency_key);


--
-- TOC entry 4842 (class 1259 OID 42330)
-- Name: ux_payment_providers_one_default_per_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ux_payment_providers_one_default_per_tenant ON public.payment_providers USING btree (tenant_id) WHERE (is_default = true);


--
-- TOC entry 4627 (class 1259 OID 17270)
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- TOC entry 4631 (class 1259 OID 108701)
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4958 (class 1259 OID 111040)
-- Name: messages_2025_09_28_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_09_28_inserted_at_topic_idx ON realtime.messages_2025_09_28 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4961 (class 1259 OID 111113)
-- Name: messages_2025_09_29_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_09_29_inserted_at_topic_idx ON realtime.messages_2025_09_29 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4964 (class 1259 OID 112228)
-- Name: messages_2025_09_30_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_09_30_inserted_at_topic_idx ON realtime.messages_2025_09_30 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4967 (class 1259 OID 113564)
-- Name: messages_2025_10_01_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_10_01_inserted_at_topic_idx ON realtime.messages_2025_10_01 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4970 (class 1259 OID 114679)
-- Name: messages_2025_10_02_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_10_02_inserted_at_topic_idx ON realtime.messages_2025_10_02 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4973 (class 1259 OID 115794)
-- Name: messages_2025_10_03_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_10_03_inserted_at_topic_idx ON realtime.messages_2025_10_03 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4976 (class 1259 OID 117891)
-- Name: messages_2025_10_04_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_10_04_inserted_at_topic_idx ON realtime.messages_2025_10_04 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4983 (class 1259 OID 120086)
-- Name: messages_2025_10_05_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_10_05_inserted_at_topic_idx ON realtime.messages_2025_10_05 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4630 (class 1259 OID 17170)
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- TOC entry 4548 (class 1259 OID 16560)
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- TOC entry 4551 (class 1259 OID 16582)
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- TOC entry 4620 (class 1259 OID 17069)
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- TOC entry 4552 (class 1259 OID 19018)
-- Name: idx_name_bucket_level_unique; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
-- TOC entry 4553 (class 1259 OID 17034)
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- TOC entry 4554 (class 1259 OID 19020)
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- TOC entry 4746 (class 1259 OID 19021)
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- TOC entry 4555 (class 1259 OID 16583)
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- TOC entry 4556 (class 1259 OID 19019)
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- TOC entry 4986 (class 0 OID 0)
-- Name: messages_2025_09_28_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_09_28_inserted_at_topic_idx;


--
-- TOC entry 4987 (class 0 OID 0)
-- Name: messages_2025_09_28_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_28_pkey;


--
-- TOC entry 4988 (class 0 OID 0)
-- Name: messages_2025_09_29_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_09_29_inserted_at_topic_idx;


--
-- TOC entry 4989 (class 0 OID 0)
-- Name: messages_2025_09_29_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_29_pkey;


--
-- TOC entry 4990 (class 0 OID 0)
-- Name: messages_2025_09_30_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_09_30_inserted_at_topic_idx;


--
-- TOC entry 4991 (class 0 OID 0)
-- Name: messages_2025_09_30_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_30_pkey;


--
-- TOC entry 4992 (class 0 OID 0)
-- Name: messages_2025_10_01_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_10_01_inserted_at_topic_idx;


--
-- TOC entry 4993 (class 0 OID 0)
-- Name: messages_2025_10_01_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_10_01_pkey;


--
-- TOC entry 4994 (class 0 OID 0)
-- Name: messages_2025_10_02_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_10_02_inserted_at_topic_idx;


--
-- TOC entry 4995 (class 0 OID 0)
-- Name: messages_2025_10_02_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_10_02_pkey;


--
-- TOC entry 4996 (class 0 OID 0)
-- Name: messages_2025_10_03_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_10_03_inserted_at_topic_idx;


--
-- TOC entry 4997 (class 0 OID 0)
-- Name: messages_2025_10_03_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_10_03_pkey;


--
-- TOC entry 4998 (class 0 OID 0)
-- Name: messages_2025_10_04_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_10_04_inserted_at_topic_idx;


--
-- TOC entry 4999 (class 0 OID 0)
-- Name: messages_2025_10_04_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_10_04_pkey;


--
-- TOC entry 5000 (class 0 OID 0)
-- Name: messages_2025_10_05_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_10_05_inserted_at_topic_idx;


--
-- TOC entry 5001 (class 0 OID 0)
-- Name: messages_2025_10_05_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_10_05_pkey;


--
-- TOC entry 5116 (class 2620 OID 101407)
-- Name: payment_intents biu_payment_intents_set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER biu_payment_intents_set_updated_at BEFORE UPDATE ON public.payment_intents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 5126 (class 2620 OID 105663)
-- Name: tenant_subscriptions biu_tenant_subscriptions_set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER biu_tenant_subscriptions_set_updated_at BEFORE UPDATE ON public.tenant_subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 5122 (class 2620 OID 17158)
-- Name: reservations reservations_tenant_guard; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER reservations_tenant_guard BEFORE INSERT OR UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.reservation_tenant_matches_table();


--
-- TOC entry 5125 (class 2620 OID 17159)
-- Name: tenant_tax_config tenant_tax_config_set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER tenant_tax_config_set_updated_at BEFORE UPDATE ON public.tenant_tax_config FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 5103 (class 2620 OID 17160)
-- Name: order_items trg_order_items_enforce_tenant; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_order_items_enforce_tenant BEFORE INSERT OR UPDATE OF order_id ON public.order_items FOR EACH ROW EXECUTE FUNCTION public.order_items_enforce_tenant();


--
-- TOC entry 5112 (class 2620 OID 17161)
-- Name: order_status_events trg_order_paid_upsert_daily; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_order_paid_upsert_daily AFTER INSERT ON public.order_status_events FOR EACH ROW EXECUTE FUNCTION app.on_order_paid_upsert_daily();


--
-- TOC entry 5101 (class 2620 OID 17162)
-- Name: orders trg_orders_fill_defaults; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_orders_fill_defaults BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.orders_fill_defaults();


--
-- TOC entry 5113 (class 2620 OID 17163)
-- Name: order_status_events trg_ose_set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_ose_set_updated_at BEFORE UPDATE ON public.order_status_events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 5117 (class 2620 OID 102124)
-- Name: payment_intents trg_payment_intent_succeeded; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_payment_intent_succeeded AFTER UPDATE ON public.payment_intents FOR EACH ROW WHEN ((new.status = 'succeeded'::text)) EXECUTE FUNCTION app.on_payment_succeeded();


--
-- TOC entry 5118 (class 2620 OID 17165)
-- Name: payment_intents trg_payment_intents_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_payment_intents_updated_at BEFORE UPDATE ON public.payment_intents FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();


--
-- TOC entry 5120 (class 2620 OID 17166)
-- Name: payment_events trg_payment_refund; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_payment_refund AFTER INSERT ON public.payment_events FOR EACH ROW WHEN ((new.event_type = 'payment_refunded'::text)) EXECUTE FUNCTION app.handle_payment_refund();


--
-- TOC entry 5114 (class 2620 OID 17167)
-- Name: payment_refunds trg_payment_refunds_set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_payment_refunds_set_updated_at BEFORE UPDATE ON public.payment_refunds FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 5115 (class 2620 OID 17168)
-- Name: payment_splits trg_payment_splits_set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_payment_splits_set_updated_at BEFORE UPDATE ON public.payment_splits FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 5121 (class 2620 OID 17169)
-- Name: payment_events trg_payment_success; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_payment_success AFTER INSERT ON public.payment_events FOR EACH ROW WHEN ((new.event_type = 'payment_succeeded'::text)) EXECUTE FUNCTION app.handle_payment_success();


--
-- TOC entry 5119 (class 2620 OID 17170)
-- Name: payment_intents trg_pi_mark_order_paid; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_pi_mark_order_paid AFTER UPDATE OF status ON public.payment_intents FOR EACH ROW WHEN ((old.status IS DISTINCT FROM new.status)) EXECUTE FUNCTION app.on_payment_intent_succeeded_mark_order_paid();


--
-- TOC entry 5094 (class 2620 OID 17171)
-- Name: tenants trg_protect_tenant_code; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_protect_tenant_code BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.protect_tenant_code();


--
-- TOC entry 5095 (class 2620 OID 106017)
-- Name: tenants trg_provision_trial_on_tenant_create; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_provision_trial_on_tenant_create AFTER INSERT ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.provision_trial_on_tenant_create();


--
-- TOC entry 5109 (class 2620 OID 17172)
-- Name: table_sessions trg_table_sessions_enforce_tenant; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_table_sessions_enforce_tenant BEFORE INSERT OR UPDATE OF table_id ON public.table_sessions FOR EACH ROW EXECUTE FUNCTION public.table_sessions_enforce_tenant();


--
-- TOC entry 5110 (class 2620 OID 120033)
-- Name: tables trg_tables_id_default; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_tables_id_default BEFORE INSERT ON public.tables FOR EACH ROW EXECUTE FUNCTION public.tables_id_default();


--
-- TOC entry 5111 (class 2620 OID 17173)
-- Name: tables trg_tables_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_tables_updated_at BEFORE UPDATE ON public.tables FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 5123 (class 2620 OID 17174)
-- Name: tm_settings trg_tm_settings_updated; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_tm_settings_updated BEFORE UPDATE ON public.tm_settings FOR EACH ROW EXECUTE FUNCTION public.touch_tm_settings();


--
-- TOC entry 5124 (class 2620 OID 17175)
-- Name: tm_settings trg_tm_settings_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_tm_settings_updated_at BEFORE UPDATE ON public.tm_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 5098 (class 2620 OID 17179)
-- Name: categories update_categories_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5100 (class 2620 OID 17180)
-- Name: customers update_customers_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5105 (class 2620 OID 17181)
-- Name: inventory_items update_inventory_items_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5099 (class 2620 OID 17182)
-- Name: menu_items update_menu_items_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5104 (class 2620 OID 17183)
-- Name: order_items update_order_items_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON public.order_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5102 (class 2620 OID 17184)
-- Name: orders update_orders_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5106 (class 2620 OID 17186)
-- Name: staff_schedules update_staff_schedules_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_staff_schedules_updated_at BEFORE UPDATE ON public.staff_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5096 (class 2620 OID 17187)
-- Name: tenants update_tenants_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5097 (class 2620 OID 17188)
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5093 (class 2620 OID 17189)
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- TOC entry 5088 (class 2620 OID 17190)
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- TOC entry 5089 (class 2620 OID 120101)
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- TOC entry 5090 (class 2620 OID 17192)
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- TOC entry 5091 (class 2620 OID 120100)
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
-- TOC entry 5107 (class 2620 OID 17194)
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- TOC entry 5108 (class 2620 OID 120102)
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- TOC entry 5092 (class 2620 OID 17196)
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- TOC entry 5004 (class 2606 OID 17197)
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 5008 (class 2606 OID 17202)
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- TOC entry 5007 (class 2606 OID 17207)
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- TOC entry 5006 (class 2606 OID 17212)
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 5013 (class 2606 OID 17217)
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 5002 (class 2606 OID 17222)
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- TOC entry 5010 (class 2606 OID 17227)
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 5011 (class 2606 OID 17232)
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- TOC entry 5012 (class 2606 OID 17237)
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 5005 (class 2606 OID 17242)
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 5009 (class 2606 OID 17247)
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 5036 (class 2606 OID 17252)
-- Name: audit_logs audit_logs_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5037 (class 2606 OID 17257)
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5086 (class 2606 OID 106072)
-- Name: billing_webhooks billing_webhooks_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing_webhooks
    ADD CONSTRAINT billing_webhooks_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5075 (class 2606 OID 17262)
-- Name: cart_items cart_items_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.carts(id) ON DELETE CASCADE;


--
-- TOC entry 5076 (class 2606 OID 17267)
-- Name: cart_items cart_items_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id);


--
-- TOC entry 5074 (class 2606 OID 17277)
-- Name: cart_sessions cart_sessions_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_sessions
    ADD CONSTRAINT cart_sessions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5018 (class 2606 OID 17282)
-- Name: categories categories_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5022 (class 2606 OID 17287)
-- Name: customers customers_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5046 (class 2606 OID 17292)
-- Name: customization customization_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customization
    ADD CONSTRAINT customization_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5038 (class 2606 OID 17297)
-- Name: daily_sales_summary daily_sales_summary_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_sales_summary
    ADD CONSTRAINT daily_sales_summary_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5031 (class 2606 OID 17302)
-- Name: inventory_items inventory_items_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5077 (class 2606 OID 17307)
-- Name: invitations invitations_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5042 (class 2606 OID 17312)
-- Name: locations locations_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5045 (class 2606 OID 17317)
-- Name: menu_categories menu_categories_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_categories
    ADD CONSTRAINT menu_categories_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5019 (class 2606 OID 17322)
-- Name: menu_items menu_items_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- TOC entry 5020 (class 2606 OID 17327)
-- Name: menu_items menu_items_section_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_section_fk FOREIGN KEY (section_id) REFERENCES public.menu_sections(id) ON DELETE CASCADE;


--
-- TOC entry 5021 (class 2606 OID 17332)
-- Name: menu_items menu_items_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5034 (class 2606 OID 17337)
-- Name: notifications notifications_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5035 (class 2606 OID 17342)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5026 (class 2606 OID 17347)
-- Name: order_items order_items_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id) ON DELETE SET NULL;


--
-- TOC entry 5027 (class 2606 OID 17352)
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 5028 (class 2606 OID 17357)
-- Name: order_items order_items_tenant_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_tenant_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5047 (class 2606 OID 17362)
-- Name: order_status_events order_status_events_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_events
    ADD CONSTRAINT order_status_events_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- TOC entry 5048 (class 2606 OID 17367)
-- Name: order_status_events order_status_events_changed_by_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_events
    ADD CONSTRAINT order_status_events_changed_by_staff_id_fkey FOREIGN KEY (changed_by_staff_id) REFERENCES public.staff(id) ON DELETE SET NULL;


--
-- TOC entry 5049 (class 2606 OID 17372)
-- Name: order_status_events order_status_events_order_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_events
    ADD CONSTRAINT order_status_events_order_fk FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 5050 (class 2606 OID 17377)
-- Name: order_status_events order_status_events_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_events
    ADD CONSTRAINT order_status_events_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 5051 (class 2606 OID 17382)
-- Name: order_status_events order_status_events_tenant_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_events
    ADD CONSTRAINT order_status_events_tenant_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5052 (class 2606 OID 17387)
-- Name: order_status_events order_status_events_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_events
    ADD CONSTRAINT order_status_events_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5023 (class 2606 OID 17392)
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- TOC entry 5024 (class 2606 OID 104036)
-- Name: orders orders_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE SET NULL;


--
-- TOC entry 5025 (class 2606 OID 17407)
-- Name: orders orders_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5070 (class 2606 OID 17412)
-- Name: payment_intents payment_intents_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_intents
    ADD CONSTRAINT payment_intents_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- TOC entry 5071 (class 2606 OID 17417)
-- Name: payment_intents payment_intents_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_intents
    ADD CONSTRAINT payment_intents_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.payment_providers(id) ON DELETE SET NULL;


--
-- TOC entry 5072 (class 2606 OID 17422)
-- Name: payment_intents payment_intents_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_intents
    ADD CONSTRAINT payment_intents_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5069 (class 2606 OID 17427)
-- Name: payment_providers payment_providers_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_providers
    ADD CONSTRAINT payment_providers_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5053 (class 2606 OID 17432)
-- Name: payment_refunds payment_refunds_created_by_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_refunds
    ADD CONSTRAINT payment_refunds_created_by_staff_id_fkey FOREIGN KEY (created_by_staff_id) REFERENCES public.staff(id) ON DELETE SET NULL;


--
-- TOC entry 5054 (class 2606 OID 17437)
-- Name: payment_refunds payment_refunds_order_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_refunds
    ADD CONSTRAINT payment_refunds_order_fk FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- TOC entry 5055 (class 2606 OID 17442)
-- Name: payment_refunds payment_refunds_payment_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_refunds
    ADD CONSTRAINT payment_refunds_payment_fk FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE SET NULL;


--
-- TOC entry 5056 (class 2606 OID 17447)
-- Name: payment_refunds payment_refunds_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_refunds
    ADD CONSTRAINT payment_refunds_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE CASCADE;


--
-- TOC entry 5057 (class 2606 OID 17452)
-- Name: payment_refunds payment_refunds_refunded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_refunds
    ADD CONSTRAINT payment_refunds_refunded_by_fkey FOREIGN KEY (refunded_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- TOC entry 5058 (class 2606 OID 17457)
-- Name: payment_refunds payment_refunds_tenant_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_refunds
    ADD CONSTRAINT payment_refunds_tenant_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5059 (class 2606 OID 17462)
-- Name: payment_refunds payment_refunds_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_refunds
    ADD CONSTRAINT payment_refunds_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5060 (class 2606 OID 17467)
-- Name: payment_splits payment_splits_order_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_splits
    ADD CONSTRAINT payment_splits_order_fk FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 5061 (class 2606 OID 17472)
-- Name: payment_splits payment_splits_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_splits
    ADD CONSTRAINT payment_splits_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 5062 (class 2606 OID 17477)
-- Name: payment_splits payment_splits_payer_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_splits
    ADD CONSTRAINT payment_splits_payer_staff_id_fkey FOREIGN KEY (payer_staff_id) REFERENCES public.staff(id) ON DELETE SET NULL;


--
-- TOC entry 5063 (class 2606 OID 17482)
-- Name: payment_splits payment_splits_payment_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_splits
    ADD CONSTRAINT payment_splits_payment_fk FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE SET NULL;


--
-- TOC entry 5064 (class 2606 OID 17487)
-- Name: payment_splits payment_splits_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_splits
    ADD CONSTRAINT payment_splits_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE CASCADE;


--
-- TOC entry 5065 (class 2606 OID 17492)
-- Name: payment_splits payment_splits_tenant_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_splits
    ADD CONSTRAINT payment_splits_tenant_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5066 (class 2606 OID 17497)
-- Name: payment_splits payment_splits_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_splits
    ADD CONSTRAINT payment_splits_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5029 (class 2606 OID 17502)
-- Name: payments payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 5030 (class 2606 OID 17507)
-- Name: payments payments_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5068 (class 2606 OID 17512)
-- Name: printer_configs printer_configs_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.printer_configs
    ADD CONSTRAINT printer_configs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5073 (class 2606 OID 17522)
-- Name: qr_scans qr_scans_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_scans
    ADD CONSTRAINT qr_scans_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5067 (class 2606 OID 17527)
-- Name: receipt_deliveries receipt_deliveries_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receipt_deliveries
    ADD CONSTRAINT receipt_deliveries_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 5078 (class 2606 OID 17532)
-- Name: reservations reservations_table_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_table_fk FOREIGN KEY (table_id) REFERENCES public.tables(id) ON DELETE RESTRICT;


--
-- TOC entry 5079 (class 2606 OID 17537)
-- Name: reservations reservations_table_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables(id) ON DELETE CASCADE;


--
-- TOC entry 5080 (class 2606 OID 17542)
-- Name: reservations reservations_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5032 (class 2606 OID 17552)
-- Name: staff_schedules staff_schedules_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_schedules
    ADD CONSTRAINT staff_schedules_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5033 (class 2606 OID 17557)
-- Name: staff_schedules staff_schedules_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_schedules
    ADD CONSTRAINT staff_schedules_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5041 (class 2606 OID 17562)
-- Name: staff staff_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5085 (class 2606 OID 105872)
-- Name: subscription_events subscription_events_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_events
    ADD CONSTRAINT subscription_events_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5040 (class 2606 OID 17567)
-- Name: table_sessions table_sessions_table_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.table_sessions
    ADD CONSTRAINT table_sessions_table_fk FOREIGN KEY (table_id) REFERENCES public.tables(id) ON DELETE RESTRICT;


--
-- TOC entry 5043 (class 2606 OID 17572)
-- Name: tables tables_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tables
    ADD CONSTRAINT tables_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5044 (class 2606 OID 118696)
-- Name: tables tables_zone_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tables
    ADD CONSTRAINT tables_zone_fkey FOREIGN KEY (zone) REFERENCES public.zones(id) ON DELETE SET NULL;


--
-- TOC entry 5084 (class 2606 OID 105837)
-- Name: tenant_entitlements tenant_entitlements_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_entitlements
    ADD CONSTRAINT tenant_entitlements_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5082 (class 2606 OID 17577)
-- Name: tenant_settings tenant_settings_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_settings
    ADD CONSTRAINT tenant_settings_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5083 (class 2606 OID 106122)
-- Name: tenant_subscriptions tenant_subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_subscriptions
    ADD CONSTRAINT tenant_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id) ON DELETE CASCADE;


--
-- TOC entry 5081 (class 2606 OID 17582)
-- Name: tenant_tax_config tenant_tax_config_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_tax_config
    ADD CONSTRAINT tenant_tax_config_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5017 (class 2606 OID 17587)
-- Name: users users_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5087 (class 2606 OID 118444)
-- Name: zones zones_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT zones_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5003 (class 2606 OID 17592)
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 5039 (class 2606 OID 17597)
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 5014 (class 2606 OID 17602)
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 5015 (class 2606 OID 17607)
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 5016 (class 2606 OID 17612)
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- TOC entry 5288 (class 0 OID 16525)
-- Dependencies: 356
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5302 (class 0 OID 16927)
-- Dependencies: 372
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5293 (class 0 OID 16725)
-- Dependencies: 363
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5287 (class 0 OID 16518)
-- Dependencies: 355
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5297 (class 0 OID 16814)
-- Dependencies: 367
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5296 (class 0 OID 16802)
-- Dependencies: 366
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5295 (class 0 OID 16789)
-- Dependencies: 365
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5303 (class 0 OID 16977)
-- Dependencies: 373
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5286 (class 0 OID 16507)
-- Dependencies: 354
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5300 (class 0 OID 16856)
-- Dependencies: 370
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5301 (class 0 OID 16874)
-- Dependencies: 371
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5289 (class 0 OID 16533)
-- Dependencies: 357
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5294 (class 0 OID 16755)
-- Dependencies: 364
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5299 (class 0 OID 16841)
-- Dependencies: 369
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5298 (class 0 OID 16832)
-- Dependencies: 368
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5285 (class 0 OID 16495)
-- Dependencies: 352
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5340 (class 0 OID 45850)
-- Dependencies: 424
-- Name: analytics_daily; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.analytics_daily ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5360 (class 3256 OID 17627)
-- Name: analytics_daily analytics_daily_ins; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY analytics_daily_ins ON public.analytics_daily FOR INSERT WITH CHECK (((tenant_id)::text = public.jwt_tenant_id()));


--
-- TOC entry 5443 (class 3256 OID 17628)
-- Name: analytics_daily analytics_daily_ro; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY analytics_daily_ro ON public.analytics_daily FOR SELECT USING (((tenant_id)::text = public.jwt_tenant_id()));


--
-- TOC entry 5364 (class 3256 OID 17629)
-- Name: reservations anon_insert_reservations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY anon_insert_reservations ON public.reservations FOR INSERT TO anon WITH CHECK ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5318 (class 0 OID 17804)
-- Dependencies: 395
-- Name: audit_logs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5362 (class 3256 OID 90052)
-- Name: audit_logs audit_logs_read_authenticated; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY audit_logs_read_authenticated ON public.audit_logs FOR SELECT TO authenticated USING (((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(( SELECT auth.uid() AS uid)) ct(tenant_id)
  WHERE (ct.tenant_id = audit_logs.tenant_id))) OR (EXISTS ( SELECT 1
   FROM public.current_tenant_ids(( SELECT auth.uid() AS uid)) ct(tenant_id)
  WHERE (ct.tenant_id = audit_logs.tenant_id)))));


--
-- TOC entry 5423 (class 3256 OID 17631)
-- Name: audit_logs audit_logs_tenant_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY audit_logs_tenant_delete ON public.audit_logs FOR DELETE TO authenticated USING ((tenant_id = app.current_tenant_id()));


--
-- TOC entry 5421 (class 3256 OID 17632)
-- Name: audit_logs audit_logs_tenant_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY audit_logs_tenant_insert ON public.audit_logs FOR INSERT TO authenticated WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- TOC entry 5422 (class 3256 OID 17634)
-- Name: audit_logs audit_logs_tenant_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY audit_logs_tenant_update ON public.audit_logs FOR UPDATE TO authenticated USING ((tenant_id = app.current_tenant_id())) WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- TOC entry 5351 (class 0 OID 106058)
-- Dependencies: 441
-- Name: billing_webhooks; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.billing_webhooks ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5418 (class 3256 OID 106080)
-- Name: billing_webhooks bwh_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY bwh_select ON public.billing_webhooks FOR SELECT USING ((tenant_id = public.request_tenant_id()));


--
-- TOC entry 5339 (class 0 OID 37734)
-- Dependencies: 421
-- Name: cart_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5356 (class 3256 OID 93022)
-- Name: cart_items cart_items_del_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY cart_items_del_same_tenant ON public.cart_items FOR DELETE TO authenticated USING ((tenant_id = public.request_tenant_id()));


--
-- TOC entry 5353 (class 3256 OID 93020)
-- Name: cart_items cart_items_ins_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY cart_items_ins_same_tenant ON public.cart_items FOR INSERT TO authenticated WITH CHECK ((tenant_id = public.request_tenant_id()));


--
-- TOC entry 5354 (class 3256 OID 93021)
-- Name: cart_items cart_items_upd_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY cart_items_upd_same_tenant ON public.cart_items FOR UPDATE TO authenticated USING ((tenant_id = public.request_tenant_id()));


--
-- TOC entry 5338 (class 0 OID 37670)
-- Dependencies: 420
-- Name: cart_sessions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.cart_sessions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5458 (class 3256 OID 17637)
-- Name: cart_sessions cart_sessions_rw_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY cart_sessions_rw_same_tenant ON public.cart_sessions TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(app.current_uid()) ct(tenant_id)
  WHERE (ct.tenant_id = cart_sessions.tenant_id)))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = app.current_uid()) AND (s.tenant_id = cart_sessions.tenant_id)))));


--
-- TOC entry 5345 (class 0 OID 82145)
-- Dependencies: 432
-- Name: carts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5365 (class 3256 OID 93046)
-- Name: carts carts_del_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY carts_del_same_tenant ON public.carts FOR DELETE TO authenticated USING ((tenant_id = public.request_tenant_id()));


--
-- TOC entry 5358 (class 3256 OID 93044)
-- Name: carts carts_ins_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY carts_ins_same_tenant ON public.carts FOR INSERT TO authenticated WITH CHECK ((tenant_id = public.request_tenant_id()));


--
-- TOC entry 5361 (class 3256 OID 93045)
-- Name: carts carts_upd_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY carts_upd_same_tenant ON public.carts FOR UPDATE TO authenticated USING ((tenant_id = public.request_tenant_id()));


--
-- TOC entry 5309 (class 0 OID 17572)
-- Dependencies: 386
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5367 (class 3256 OID 90076)
-- Name: categories categories_read_authenticated; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY categories_read_authenticated ON public.categories FOR SELECT TO authenticated USING (((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(( SELECT auth.uid() AS uid)) ct(tenant_id)
  WHERE (ct.tenant_id = categories.tenant_id))) OR (EXISTS ( SELECT 1
   FROM public.current_tenant_ids(( SELECT auth.uid() AS uid)) ct(tenant_id)
  WHERE (ct.tenant_id = categories.tenant_id))) OR (EXISTS ( SELECT 1
   FROM public.current_tenant_ids(( SELECT auth.uid() AS uid)) ct(tenant_id)
  WHERE (ct.tenant_id = categories.tenant_id)))));


--
-- TOC entry 5374 (class 3256 OID 17640)
-- Name: categories categories_tenant_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY categories_tenant_delete ON public.categories FOR DELETE USING ((tenant_id = app.current_tenant_id()));


--
-- TOC entry 5376 (class 3256 OID 17641)
-- Name: categories categories_tenant_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY categories_tenant_insert ON public.categories FOR INSERT WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- TOC entry 5456 (class 3256 OID 17643)
-- Name: categories categories_tenant_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY categories_tenant_update ON public.categories FOR UPDATE USING ((tenant_id = app.current_tenant_id())) WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- TOC entry 5311 (class 0 OID 17636)
-- Dependencies: 388
-- Name: customers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5327 (class 0 OID 27310)
-- Dependencies: 405
-- Name: customization; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.customization ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5375 (class 3256 OID 93070)
-- Name: customization customization_del_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY customization_del_same_tenant ON public.customization FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(app.current_uid()) ct(tenant_id)
  WHERE (ct.tenant_id = customization.tenant_id))));


--
-- TOC entry 5368 (class 3256 OID 93068)
-- Name: customization customization_ins_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY customization_ins_same_tenant ON public.customization FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(app.current_uid()) ct(tenant_id)
  WHERE (ct.tenant_id = customization.tenant_id))));


--
-- TOC entry 5387 (class 3256 OID 17650)
-- Name: customization customization_select_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY customization_select_same_tenant ON public.customization FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(app.current_uid()) ct(tenant_id)
  WHERE (ct.tenant_id = customization.tenant_id))));


--
-- TOC entry 5373 (class 3256 OID 93069)
-- Name: customization customization_upd_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY customization_upd_same_tenant ON public.customization FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(app.current_uid()) ct(tenant_id)
  WHERE (ct.tenant_id = customization.tenant_id))));


--
-- TOC entry 5319 (class 0 OID 17823)
-- Dependencies: 396
-- Name: daily_sales_summary; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.daily_sales_summary ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5328 (class 0 OID 27364)
-- Dependencies: 406
-- Name: domain_events; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.domain_events ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5449 (class 3256 OID 17657)
-- Name: domain_events domain_events_ro_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY domain_events_ro_same_tenant ON public.domain_events FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(app.current_uid()) ct(tenant_id)
  WHERE (ct.tenant_id = domain_events.tenant_id))));


--
-- TOC entry 5315 (class 0 OID 17744)
-- Dependencies: 392
-- Name: inventory_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5369 (class 3256 OID 17661)
-- Name: inventory_items inventory_items_tenant_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY inventory_items_tenant_update ON public.inventory_items FOR UPDATE USING ((tenant_id = app.current_tenant_id())) WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- TOC entry 5341 (class 0 OID 54616)
-- Dependencies: 427
-- Name: invitations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5451 (class 3256 OID 17662)
-- Name: invitations invitations_tenant_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY invitations_tenant_insert ON public.invitations FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(app.current_uid()) ct(tenant_id)
  WHERE (ct.tenant_id = invitations.tenant_id))));


--
-- TOC entry 5462 (class 3256 OID 17663)
-- Name: invitations invitations_tenant_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY invitations_tenant_read ON public.invitations FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(app.current_uid()) ct(tenant_id)
  WHERE (ct.tenant_id = invitations.tenant_id))));


--
-- TOC entry 5463 (class 3256 OID 17664)
-- Name: invitations invitations_tenant_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY invitations_tenant_update ON public.invitations FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(app.current_uid()) ct(tenant_id)
  WHERE (ct.tenant_id = invitations.tenant_id)))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = app.current_uid()) AND (s.tenant_id = invitations.tenant_id) AND (s.role = 'admin'::text)))));


--
-- TOC entry 5324 (class 0 OID 27223)
-- Dependencies: 402
-- Name: locations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5381 (class 3256 OID 93094)
-- Name: locations locations_del_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY locations_del_same_tenant ON public.locations FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(app.current_uid()) ct(tenant_id)
  WHERE (ct.tenant_id = locations.tenant_id))));


--
-- TOC entry 5379 (class 3256 OID 93092)
-- Name: locations locations_ins_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY locations_ins_same_tenant ON public.locations FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(app.current_uid()) ct(tenant_id)
  WHERE (ct.tenant_id = locations.tenant_id))));


--
-- TOC entry 5388 (class 3256 OID 17666)
-- Name: locations locations_select_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY locations_select_same_tenant ON public.locations FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(app.current_uid()) ct(tenant_id)
  WHERE (ct.tenant_id = locations.tenant_id))));


--
-- TOC entry 5380 (class 3256 OID 93093)
-- Name: locations locations_upd_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY locations_upd_same_tenant ON public.locations FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(app.current_uid()) ct(tenant_id)
  WHERE (ct.tenant_id = locations.tenant_id))));


--
-- TOC entry 5326 (class 0 OID 27296)
-- Dependencies: 404
-- Name: menu_categories; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5385 (class 3256 OID 93118)
-- Name: menu_categories menu_categories_del_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY menu_categories_del_same_tenant ON public.menu_categories FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(app.current_uid()) ct(tenant_id)
  WHERE (ct.tenant_id = menu_categories.tenant_id))));


--
-- TOC entry 5383 (class 3256 OID 93116)
-- Name: menu_categories menu_categories_ins_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY menu_categories_ins_same_tenant ON public.menu_categories FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(app.current_uid()) ct(tenant_id)
  WHERE (ct.tenant_id = menu_categories.tenant_id))));


--
-- TOC entry 5408 (class 3256 OID 17669)
-- Name: menu_categories menu_categories_select_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY menu_categories_select_same_tenant ON public.menu_categories FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(app.current_uid()) ct(tenant_id)
  WHERE (ct.tenant_id = menu_categories.tenant_id))));


--
-- TOC entry 5384 (class 3256 OID 93117)
-- Name: menu_categories menu_categories_upd_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY menu_categories_upd_same_tenant ON public.menu_categories FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(app.current_uid()) ct(tenant_id)
  WHERE (ct.tenant_id = menu_categories.tenant_id))));


--
-- TOC entry 5310 (class 0 OID 17589)
-- Dependencies: 387
-- Name: menu_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5413 (class 3256 OID 17673)
-- Name: menu_items menu_items_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY menu_items_delete ON public.menu_items FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(app.current_uid()) ct(tenant_id)
  WHERE (ct.tenant_id = menu_items.tenant_id))));


--
-- TOC entry 5400 (class 3256 OID 90102)
-- Name: menu_items menu_items_insert_authenticated; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY menu_items_insert_authenticated ON public.menu_items FOR INSERT TO authenticated WITH CHECK ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5402 (class 3256 OID 90103)
-- Name: menu_items menu_items_read_authenticated; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY menu_items_read_authenticated ON public.menu_items FOR SELECT TO authenticated USING ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5403 (class 3256 OID 90104)
-- Name: menu_items menu_items_update_authenticated; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY menu_items_update_authenticated ON public.menu_items FOR UPDATE TO authenticated USING ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid))) WITH CHECK ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5344 (class 0 OID 77126)
-- Dependencies: 431
-- Name: menu_sections; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.menu_sections ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5460 (class 3256 OID 17681)
-- Name: menu_sections menu_sections_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY menu_sections_delete ON public.menu_sections FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(app.current_uid()) ct(tenant_id)
  WHERE (ct.tenant_id = menu_sections.tenant_id))));


--
-- TOC entry 5459 (class 3256 OID 17682)
-- Name: menu_sections menu_sections_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY menu_sections_insert ON public.menu_sections FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(app.current_uid()) ct(tenant_id)
  WHERE (ct.tenant_id = menu_sections.tenant_id))));


--
-- TOC entry 5465 (class 3256 OID 17683)
-- Name: menu_sections menu_sections_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY menu_sections_select ON public.menu_sections FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(app.current_uid()) ct(tenant_id)
  WHERE (ct.tenant_id = menu_sections.tenant_id))));


--
-- TOC entry 5461 (class 3256 OID 17684)
-- Name: menu_sections menu_sections_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY menu_sections_update ON public.menu_sections FOR UPDATE TO authenticated USING (((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)) OR (EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = app.current_uid()) AND (s.tenant_id = menu_sections.tenant_id)))))) WITH CHECK (((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)) OR (EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = app.current_uid()) AND (s.tenant_id = menu_sections.tenant_id))))));


--
-- TOC entry 5317 (class 0 OID 17783)
-- Dependencies: 394
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5483 (class 3256 OID 17686)
-- Name: notifications notifications_tenant_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY notifications_tenant_delete ON public.notifications FOR DELETE USING ((tenant_id = app.current_tenant_id()));


--
-- TOC entry 5484 (class 3256 OID 17687)
-- Name: notifications notifications_tenant_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY notifications_tenant_insert ON public.notifications FOR INSERT WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- TOC entry 5485 (class 3256 OID 17688)
-- Name: notifications notifications_tenant_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY notifications_tenant_select ON public.notifications FOR SELECT USING ((tenant_id = app.current_tenant_id()));


--
-- TOC entry 5486 (class 3256 OID 17689)
-- Name: notifications notifications_tenant_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY notifications_tenant_update ON public.notifications FOR UPDATE USING ((tenant_id = app.current_tenant_id())) WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- TOC entry 5313 (class 0 OID 17699)
-- Dependencies: 390
-- Name: order_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5487 (class 3256 OID 17690)
-- Name: order_items order_items_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY order_items_delete ON public.order_items FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.orders o
  WHERE ((o.id = order_items.order_id) AND (o.tenant_id = public.jwt_tenant_id_uuid())))));


--
-- TOC entry 5488 (class 3256 OID 17691)
-- Name: order_items order_items_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY order_items_insert ON public.order_items FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.orders o
  WHERE ((o.id = order_items.order_id) AND (o.tenant_id = public.jwt_tenant_id_uuid())))));


--
-- TOC entry 5419 (class 3256 OID 90127)
-- Name: order_items order_items_read_authenticated; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY order_items_read_authenticated ON public.order_items FOR SELECT TO authenticated USING (((tenant_id = public.request_tenant_id()) OR (EXISTS ( SELECT 1
   FROM public.orders o
  WHERE ((o.id = order_items.order_id) AND (o.tenant_id = public.jwt_tenant_id_uuid()))))));


--
-- TOC entry 5489 (class 3256 OID 17693)
-- Name: order_items order_items_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY order_items_update ON public.order_items FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.orders o
  WHERE ((o.id = order_items.order_id) AND (o.tenant_id = public.jwt_tenant_id_uuid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.orders o
  WHERE ((o.id = order_items.order_id) AND (o.tenant_id = public.jwt_tenant_id_uuid())))));


--
-- TOC entry 5329 (class 0 OID 33826)
-- Dependencies: 411
-- Name: order_status_events; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.order_status_events ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5312 (class 0 OID 17659)
-- Dependencies: 389
-- Name: orders; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5444 (class 3256 OID 17697)
-- Name: orders orders_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY orders_delete ON public.orders FOR DELETE USING ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5448 (class 3256 OID 17698)
-- Name: orders orders_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY orders_insert ON public.orders FOR INSERT WITH CHECK ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5441 (class 3256 OID 90173)
-- Name: orders orders_read_authenticated; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY orders_read_authenticated ON public.orders FOR SELECT TO authenticated USING (((tenant_id = public.request_tenant_id()) OR (tenant_id = public.jwt_tenant_id_uuid())));


--
-- TOC entry 5452 (class 3256 OID 17700)
-- Name: orders orders_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY orders_update ON public.orders FOR UPDATE USING ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid))) WITH CHECK ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5407 (class 3256 OID 17702)
-- Name: order_status_events ose_insert_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY ose_insert_same_tenant ON public.order_status_events FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(app.current_uid()) ct(tenant_id)
  WHERE (ct.tenant_id = order_status_events.tenant_id))));


--
-- TOC entry 5424 (class 3256 OID 90150)
-- Name: order_status_events ose_read_authenticated; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY ose_read_authenticated ON public.order_status_events FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(( SELECT auth.uid() AS uid)) ct(tenant_id)
  WHERE (ct.tenant_id = order_status_events.tenant_id))));


--
-- TOC entry 5336 (class 0 OID 37378)
-- Dependencies: 418
-- Name: payment_events; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5466 (class 3256 OID 17708)
-- Name: payment_events payment_events_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payment_events_delete ON public.payment_events FOR DELETE USING ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5467 (class 3256 OID 17709)
-- Name: payment_events payment_events_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payment_events_insert ON public.payment_events FOR INSERT WITH CHECK ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5468 (class 3256 OID 17710)
-- Name: payment_events payment_events_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payment_events_select ON public.payment_events FOR SELECT USING ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5469 (class 3256 OID 17711)
-- Name: payment_events payment_events_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payment_events_update ON public.payment_events FOR UPDATE USING ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid))) WITH CHECK ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5335 (class 0 OID 37148)
-- Dependencies: 417
-- Name: payment_intents; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5435 (class 3256 OID 17713)
-- Name: payment_intents payment_intents_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payment_intents_delete ON public.payment_intents FOR DELETE TO authenticated USING ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5433 (class 3256 OID 17714)
-- Name: payment_intents payment_intents_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payment_intents_insert ON public.payment_intents FOR INSERT TO authenticated WITH CHECK ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5442 (class 3256 OID 90194)
-- Name: payment_intents payment_intents_read_authenticated; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payment_intents_read_authenticated ON public.payment_intents FOR SELECT TO authenticated USING ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5434 (class 3256 OID 17716)
-- Name: payment_intents payment_intents_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payment_intents_update ON public.payment_intents FOR UPDATE TO authenticated USING ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid))) WITH CHECK ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5334 (class 0 OID 34014)
-- Dependencies: 416
-- Name: payment_providers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payment_providers ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5471 (class 3256 OID 17718)
-- Name: payment_providers payment_providers_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payment_providers_delete ON public.payment_providers FOR DELETE USING ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5472 (class 3256 OID 17719)
-- Name: payment_providers payment_providers_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payment_providers_insert ON public.payment_providers FOR INSERT WITH CHECK ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5473 (class 3256 OID 17720)
-- Name: payment_providers payment_providers_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payment_providers_select ON public.payment_providers FOR SELECT USING ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5474 (class 3256 OID 17721)
-- Name: payment_providers payment_providers_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payment_providers_update ON public.payment_providers FOR UPDATE USING ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid))) WITH CHECK ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5330 (class 0 OID 33845)
-- Dependencies: 412
-- Name: payment_refunds; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payment_refunds ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5420 (class 3256 OID 17723)
-- Name: payment_refunds payment_refunds_rw_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payment_refunds_rw_same_tenant ON public.payment_refunds TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(app.current_uid()) ct(tenant_id)
  WHERE (ct.tenant_id = payment_refunds.tenant_id)))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(app.current_uid()) ct(tenant_id)
  WHERE (ct.tenant_id = payment_refunds.tenant_id))));


--
-- TOC entry 5331 (class 0 OID 33866)
-- Dependencies: 413
-- Name: payment_splits; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payment_splits ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5477 (class 3256 OID 17725)
-- Name: payment_splits payment_splits_rw_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payment_splits_rw_same_tenant ON public.payment_splits TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(app.current_uid()) ct(tenant_id)
  WHERE (ct.tenant_id = payment_splits.tenant_id)))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(app.current_uid()) ct(tenant_id)
  WHERE (ct.tenant_id = payment_splits.tenant_id))));


--
-- TOC entry 5314 (class 0 OID 17722)
-- Dependencies: 391
-- Name: payments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5425 (class 3256 OID 17727)
-- Name: payments payments_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payments_delete ON public.payments FOR DELETE USING ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5453 (class 3256 OID 17728)
-- Name: payments payments_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payments_insert ON public.payments FOR INSERT WITH CHECK ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5455 (class 3256 OID 17729)
-- Name: payments payments_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payments_select ON public.payments FOR SELECT USING ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5382 (class 3256 OID 17730)
-- Name: payments payments_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payments_update ON public.payments FOR UPDATE USING ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid))) WITH CHECK ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5386 (class 3256 OID 101470)
-- Name: payment_intents pi_allow_all; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY pi_allow_all ON public.payment_intents USING (true) WITH CHECK (true);


--
-- TOC entry 5333 (class 0 OID 33897)
-- Dependencies: 415
-- Name: printer_configs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.printer_configs ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5391 (class 3256 OID 91459)
-- Name: printer_configs printer_configs deny all; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "printer_configs deny all" ON public.printer_configs TO anon, authenticated USING (false) WITH CHECK (false);


--
-- TOC entry 5439 (class 3256 OID 17732)
-- Name: menu_items public_read_menu_items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY public_read_menu_items ON public.menu_items FOR SELECT TO anon USING ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5426 (class 3256 OID 17733)
-- Name: menu_sections public_read_menu_sections; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY public_read_menu_sections ON public.menu_sections FOR SELECT TO anon USING ((tenant_id = public.request_tenant_id()));


--
-- TOC entry 5337 (class 0 OID 37610)
-- Dependencies: 419
-- Name: qr_scans; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5479 (class 3256 OID 17734)
-- Name: qr_scans qr_scans_select_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY qr_scans_select_same_tenant ON public.qr_scans FOR SELECT TO authenticated USING ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5332 (class 0 OID 33880)
-- Dependencies: 414
-- Name: receipt_deliveries; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.receipt_deliveries ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5392 (class 3256 OID 91460)
-- Name: receipt_deliveries receipt_deliveries deny all; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "receipt_deliveries deny all" ON public.receipt_deliveries TO anon, authenticated USING (false) WITH CHECK (false);


--
-- TOC entry 5342 (class 0 OID 65126)
-- Dependencies: 429
-- Name: reservations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5438 (class 3256 OID 17735)
-- Name: reservations reservations_del; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY reservations_del ON public.reservations FOR DELETE TO authenticated USING ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5478 (class 3256 OID 17736)
-- Name: reservations reservations_ins; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY reservations_ins ON public.reservations FOR INSERT TO authenticated WITH CHECK ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5476 (class 3256 OID 17737)
-- Name: reservations reservations_sel; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY reservations_sel ON public.reservations FOR SELECT USING ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5437 (class 3256 OID 17738)
-- Name: reservations reservations_upd; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY reservations_upd ON public.reservations FOR UPDATE TO authenticated USING ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid))) WITH CHECK ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5417 (class 3256 OID 105947)
-- Name: subscription_events se_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY se_insert ON public.subscription_events FOR INSERT WITH CHECK ((tenant_id = public.request_tenant_id()));


--
-- TOC entry 5416 (class 3256 OID 105946)
-- Name: subscription_events se_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY se_select ON public.subscription_events FOR SELECT USING ((tenant_id = public.request_tenant_id()));


--
-- TOC entry 5390 (class 3256 OID 17747)
-- Name: cart_items service_role_full_cart_items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY service_role_full_cart_items ON public.cart_items TO service_role USING ((app."current_role"() = 'service_role'::text)) WITH CHECK ((app."current_role"() = 'service_role'::text));


--
-- TOC entry 5427 (class 3256 OID 17748)
-- Name: carts service_role_full_carts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY service_role_full_carts ON public.carts TO service_role USING ((app."current_role"() = 'service_role'::text)) WITH CHECK ((app."current_role"() = 'service_role'::text));


--
-- TOC entry 5359 (class 3256 OID 17749)
-- Name: order_items service_role_full_order_items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY service_role_full_order_items ON public.order_items TO service_role USING ((app."current_role"() = 'service_role'::text)) WITH CHECK ((app."current_role"() = 'service_role'::text));


--
-- TOC entry 5454 (class 3256 OID 17750)
-- Name: orders service_role_full_orders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY service_role_full_orders ON public.orders TO service_role USING ((app."current_role"() = 'service_role'::text)) WITH CHECK ((app."current_role"() = 'service_role'::text));


--
-- TOC entry 5357 (class 3256 OID 17751)
-- Name: tenant_settings service_role_full_tenant_settings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY service_role_full_tenant_settings ON public.tenant_settings TO service_role USING ((app."current_role"() = 'service_role'::text)) WITH CHECK ((app."current_role"() = 'service_role'::text));


--
-- TOC entry 5323 (class 0 OID 27206)
-- Dependencies: 401
-- Name: staff; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5316 (class 0 OID 17762)
-- Dependencies: 393
-- Name: staff_schedules; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.staff_schedules ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5481 (class 3256 OID 17754)
-- Name: staff_schedules staff_schedules_tenant_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY staff_schedules_tenant_delete ON public.staff_schedules FOR DELETE USING ((tenant_id = app.current_tenant_id()));


--
-- TOC entry 5464 (class 3256 OID 17755)
-- Name: staff_schedules staff_schedules_tenant_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY staff_schedules_tenant_insert ON public.staff_schedules FOR INSERT WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- TOC entry 5475 (class 3256 OID 17756)
-- Name: staff_schedules staff_schedules_tenant_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY staff_schedules_tenant_select ON public.staff_schedules FOR SELECT USING ((tenant_id = app.current_tenant_id()));


--
-- TOC entry 5480 (class 3256 OID 17757)
-- Name: staff_schedules staff_schedules_tenant_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY staff_schedules_tenant_update ON public.staff_schedules FOR UPDATE USING ((tenant_id = app.current_tenant_id())) WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- TOC entry 5436 (class 3256 OID 17759)
-- Name: staff staff_self_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY staff_self_select ON public.staff FOR SELECT TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid)));


--
-- TOC entry 5350 (class 0 OID 105862)
-- Dependencies: 440
-- Name: subscription_events; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5322 (class 0 OID 22961)
-- Dependencies: 400
-- Name: table_sessions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.table_sessions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5366 (class 3256 OID 17760)
-- Name: table_sessions table_sessions_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY table_sessions_delete ON public.table_sessions FOR DELETE USING (((tenant_id = public.jwt_tenant_id_uuid()) OR (EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = ( SELECT auth.uid() AS uid)) AND (s.tenant_id = table_sessions.tenant_id))))));


--
-- TOC entry 5370 (class 3256 OID 17761)
-- Name: table_sessions table_sessions_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY table_sessions_insert ON public.table_sessions FOR INSERT WITH CHECK (((tenant_id = public.jwt_tenant_id_uuid()) OR (EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = ( SELECT auth.uid() AS uid)) AND (s.tenant_id = table_sessions.tenant_id))))));


--
-- TOC entry 5371 (class 3256 OID 17762)
-- Name: table_sessions table_sessions_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY table_sessions_select ON public.table_sessions FOR SELECT USING (((tenant_id = public.jwt_tenant_id_uuid()) OR (EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = ( SELECT auth.uid() AS uid)) AND (s.tenant_id = table_sessions.tenant_id))))));


--
-- TOC entry 5372 (class 3256 OID 17763)
-- Name: table_sessions table_sessions_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY table_sessions_update ON public.table_sessions FOR UPDATE USING (((tenant_id = public.jwt_tenant_id_uuid()) OR (EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = ( SELECT auth.uid() AS uid)) AND (s.tenant_id = table_sessions.tenant_id)))))) WITH CHECK (((tenant_id = public.jwt_tenant_id_uuid()) OR (EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = ( SELECT auth.uid() AS uid)) AND (s.tenant_id = table_sessions.tenant_id))))));


--
-- TOC entry 5325 (class 0 OID 27239)
-- Dependencies: 403
-- Name: tables; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5377 (class 3256 OID 17765)
-- Name: tables tables_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tables_delete ON public.tables FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = ( SELECT auth.uid() AS uid)) AND (s.tenant_id = tables.tenant_id)))));


--
-- TOC entry 5378 (class 3256 OID 17766)
-- Name: tables tables_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tables_insert ON public.tables FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = ( SELECT auth.uid() AS uid)) AND (s.tenant_id = tables.tenant_id)))));


--
-- TOC entry 5363 (class 3256 OID 90286)
-- Name: tables tables_read_authenticated; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tables_read_authenticated ON public.tables FOR SELECT TO authenticated USING (((tenant_id = public.jwt_tenant_id_uuid()) OR (EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = tables.tenant_id)))) OR (EXISTS ( SELECT 1
   FROM public.current_tenant_ids(( SELECT auth.uid() AS uid)) ct(tenant_id)
  WHERE (ct.tenant_id = tables.tenant_id)))));


--
-- TOC entry 5432 (class 3256 OID 17770)
-- Name: tables tables_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tables_update ON public.tables FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = ( SELECT auth.uid() AS uid)) AND (s.tenant_id = tables.tenant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = ( SELECT auth.uid() AS uid)) AND (s.tenant_id = tables.tenant_id)))));


--
-- TOC entry 5414 (class 3256 OID 105925)
-- Name: tenant_entitlements te_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY te_delete ON public.tenant_entitlements FOR DELETE USING ((tenant_id = public.request_tenant_id()));


--
-- TOC entry 5410 (class 3256 OID 105923)
-- Name: tenant_entitlements te_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY te_insert ON public.tenant_entitlements FOR INSERT WITH CHECK ((tenant_id = public.request_tenant_id()));


--
-- TOC entry 5409 (class 3256 OID 105922)
-- Name: tenant_entitlements te_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY te_select ON public.tenant_entitlements FOR SELECT USING ((tenant_id = public.request_tenant_id()));


--
-- TOC entry 5411 (class 3256 OID 105924)
-- Name: tenant_entitlements te_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY te_update ON public.tenant_entitlements FOR UPDATE USING ((tenant_id = public.request_tenant_id())) WITH CHECK ((tenant_id = public.request_tenant_id()));


--
-- TOC entry 5349 (class 0 OID 105826)
-- Dependencies: 439
-- Name: tenant_entitlements; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.tenant_entitlements ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5470 (class 3256 OID 17783)
-- Name: payment_intents tenant_modify_payment_intents; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_modify_payment_intents ON public.payment_intents TO service_role USING ((tenant_id = public.request_tenant_id())) WITH CHECK ((tenant_id = public.request_tenant_id()));


--
-- TOC entry 5457 (class 3256 OID 17786)
-- Name: cart_items tenant_select_cart_items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_select_cart_items ON public.cart_items FOR SELECT USING ((tenant_id = public.request_tenant_id()));


--
-- TOC entry 5355 (class 3256 OID 17787)
-- Name: carts tenant_select_carts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_select_carts ON public.carts FOR SELECT USING ((tenant_id = public.request_tenant_id()));


--
-- TOC entry 5347 (class 0 OID 85662)
-- Dependencies: 434
-- Name: tenant_settings; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.tenant_settings ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5348 (class 0 OID 105644)
-- Dependencies: 437
-- Name: tenant_subscriptions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.tenant_subscriptions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5397 (class 3256 OID 105711)
-- Name: tenant_subscriptions tenant_subscriptions_isolation_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_subscriptions_isolation_delete ON public.tenant_subscriptions FOR DELETE USING ((tenant_id = public.request_tenant_id()));


--
-- TOC entry 5395 (class 3256 OID 105709)
-- Name: tenant_subscriptions tenant_subscriptions_isolation_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_subscriptions_isolation_insert ON public.tenant_subscriptions FOR INSERT WITH CHECK ((tenant_id = public.request_tenant_id()));


--
-- TOC entry 5389 (class 3256 OID 105708)
-- Name: tenant_subscriptions tenant_subscriptions_isolation_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_subscriptions_isolation_select ON public.tenant_subscriptions FOR SELECT USING ((tenant_id = public.request_tenant_id()));


--
-- TOC entry 5396 (class 3256 OID 105710)
-- Name: tenant_subscriptions tenant_subscriptions_isolation_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenant_subscriptions_isolation_update ON public.tenant_subscriptions FOR UPDATE USING ((tenant_id = public.request_tenant_id()));


--
-- TOC entry 5346 (class 0 OID 82659)
-- Dependencies: 433
-- Name: tenant_tax_config; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.tenant_tax_config ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5307 (class 0 OID 17537)
-- Dependencies: 384
-- Name: tenants; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5440 (class 3256 OID 17795)
-- Name: tenants tenants_select_for_staff; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenants_select_for_staff ON public.tenants FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(( SELECT auth.uid() AS uid)) ct(tenant_id)
  WHERE (ct.tenant_id = tenants.id))));


--
-- TOC entry 5343 (class 0 OID 67236)
-- Dependencies: 430
-- Name: tm_settings; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.tm_settings ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5394 (class 3256 OID 17796)
-- Name: tm_settings tm_settings_del; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tm_settings_del ON public.tm_settings FOR DELETE USING (((tenant_id)::uuid = public.jwt_tenant_id_uuid()));


--
-- TOC entry 5393 (class 3256 OID 17797)
-- Name: tm_settings tm_settings_ins; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tm_settings_ins ON public.tm_settings FOR INSERT WITH CHECK (((tenant_id)::uuid = public.jwt_tenant_id_uuid()));


--
-- TOC entry 5415 (class 3256 OID 17800)
-- Name: tm_settings tm_settings_upd; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tm_settings_upd ON public.tm_settings FOR UPDATE USING (((tenant_id)::uuid = public.jwt_tenant_id_uuid())) WITH CHECK (((tenant_id)::uuid = public.jwt_tenant_id_uuid()));


--
-- TOC entry 5404 (class 3256 OID 105901)
-- Name: tenant_subscriptions ts_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY ts_delete ON public.tenant_subscriptions FOR DELETE USING ((tenant_id = public.request_tenant_id()));


--
-- TOC entry 5399 (class 3256 OID 105899)
-- Name: tenant_subscriptions ts_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY ts_insert ON public.tenant_subscriptions FOR INSERT WITH CHECK ((tenant_id = public.request_tenant_id()));


--
-- TOC entry 5398 (class 3256 OID 105898)
-- Name: tenant_subscriptions ts_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY ts_select ON public.tenant_subscriptions FOR SELECT USING ((tenant_id = public.request_tenant_id()));


--
-- TOC entry 5401 (class 3256 OID 105900)
-- Name: tenant_subscriptions ts_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY ts_update ON public.tenant_subscriptions FOR UPDATE USING ((tenant_id = public.request_tenant_id())) WITH CHECK ((tenant_id = public.request_tenant_id()));


--
-- TOC entry 5482 (class 3256 OID 17804)
-- Name: tenant_tax_config ttc_delete_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY ttc_delete_own ON public.tenant_tax_config FOR DELETE USING ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5412 (class 3256 OID 17805)
-- Name: tenant_tax_config ttc_insert_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY ttc_insert_own ON public.tenant_tax_config FOR INSERT WITH CHECK ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5405 (class 3256 OID 17806)
-- Name: tenant_tax_config ttc_select_by_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY ttc_select_by_tenant ON public.tenant_tax_config FOR SELECT USING ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5406 (class 3256 OID 17807)
-- Name: tenant_tax_config ttc_update_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY ttc_update_own ON public.tenant_tax_config FOR UPDATE USING ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid))) WITH CHECK ((tenant_id = ( SELECT public.jwt_tenant_id_uuid() AS jwt_tenant_id_uuid)));


--
-- TOC entry 5308 (class 0 OID 17552)
-- Dependencies: 385
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5445 (class 3256 OID 17808)
-- Name: users users_tenant_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY users_tenant_delete ON public.users FOR DELETE USING ((tenant_id = app.current_tenant_id()));


--
-- TOC entry 5446 (class 3256 OID 17809)
-- Name: users users_tenant_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY users_tenant_insert ON public.users FOR INSERT WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- TOC entry 5447 (class 3256 OID 17810)
-- Name: users users_tenant_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY users_tenant_select ON public.users FOR SELECT USING ((tenant_id = app.current_tenant_id()));


--
-- TOC entry 5450 (class 3256 OID 17811)
-- Name: users users_tenant_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY users_tenant_update ON public.users FOR UPDATE USING ((tenant_id = app.current_tenant_id())) WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- TOC entry 5352 (class 0 OID 118432)
-- Dependencies: 452
-- Name: zones; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5431 (class 3256 OID 118495)
-- Name: zones zones_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY zones_delete ON public.zones FOR DELETE USING ((tenant_id = public.request_tenant_id()));


--
-- TOC entry 5429 (class 3256 OID 118493)
-- Name: zones zones_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY zones_insert ON public.zones FOR INSERT WITH CHECK ((tenant_id = public.request_tenant_id()));


--
-- TOC entry 5428 (class 3256 OID 118492)
-- Name: zones zones_read_authenticated; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY zones_read_authenticated ON public.zones FOR SELECT USING ((tenant_id = public.request_tenant_id()));


--
-- TOC entry 5430 (class 3256 OID 118494)
-- Name: zones zones_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY zones_update ON public.zones FOR UPDATE USING ((tenant_id = public.request_tenant_id())) WITH CHECK ((tenant_id = public.request_tenant_id()));


--
-- TOC entry 5306 (class 0 OID 17255)
-- Dependencies: 382
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5290 (class 0 OID 16546)
-- Dependencies: 358
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5321 (class 0 OID 19036)
-- Dependencies: 398
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5292 (class 0 OID 16588)
-- Dependencies: 360
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5291 (class 0 OID 16561)
-- Dependencies: 359
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5320 (class 0 OID 18991)
-- Dependencies: 397
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5304 (class 0 OID 17035)
-- Dependencies: 374
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5305 (class 0 OID 17049)
-- Dependencies: 375
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5490 (class 6104 OID 17820)
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- TOC entry 5491 (class 6104 OID 17821)
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: supabase_admin
--

CREATE PUBLICATION supabase_realtime_messages_publication WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime_messages_publication OWNER TO supabase_admin;

--
-- TOC entry 5492 (class 6106 OID 17822)
-- Name: supabase_realtime order_items; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.order_items;


--
-- TOC entry 5493 (class 6106 OID 17823)
-- Name: supabase_realtime order_status_events; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.order_status_events;


--
-- TOC entry 5494 (class 6106 OID 17824)
-- Name: supabase_realtime orders; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.orders;


--
-- TOC entry 5495 (class 6106 OID 17825)
-- Name: supabase_realtime payment_events; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.payment_events;


--
-- TOC entry 5496 (class 6106 OID 17826)
-- Name: supabase_realtime payment_intents; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.payment_intents;


--
-- TOC entry 5497 (class 6106 OID 17827)
-- Name: supabase_realtime payments; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.payments;


--
-- TOC entry 5498 (class 6106 OID 17828)
-- Name: supabase_realtime_messages_publication messages; Type: PUBLICATION TABLE; Schema: realtime; Owner: supabase_admin
--

ALTER PUBLICATION supabase_realtime_messages_publication ADD TABLE ONLY realtime.messages;


--
-- TOC entry 5589 (class 0 OID 0)
-- Dependencies: 22
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- TOC entry 5590 (class 0 OID 0)
-- Dependencies: 26
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- TOC entry 5591 (class 0 OID 0)
-- Dependencies: 38
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- TOC entry 5592 (class 0 OID 0)
-- Dependencies: 43
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- TOC entry 5593 (class 0 OID 0)
-- Dependencies: 49
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- TOC entry 5594 (class 0 OID 0)
-- Dependencies: 19
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- TOC entry 5602 (class 0 OID 0)
-- Dependencies: 582
-- Name: FUNCTION citextin(cstring); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.citextin(cstring) TO postgres;
GRANT ALL ON FUNCTION extensions.citextin(cstring) TO anon;
GRANT ALL ON FUNCTION extensions.citextin(cstring) TO authenticated;
GRANT ALL ON FUNCTION extensions.citextin(cstring) TO service_role;


--
-- TOC entry 5603 (class 0 OID 0)
-- Dependencies: 627
-- Name: FUNCTION citextout(extensions.citext); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.citextout(extensions.citext) TO postgres;
GRANT ALL ON FUNCTION extensions.citextout(extensions.citext) TO anon;
GRANT ALL ON FUNCTION extensions.citextout(extensions.citext) TO authenticated;
GRANT ALL ON FUNCTION extensions.citextout(extensions.citext) TO service_role;


--
-- TOC entry 5604 (class 0 OID 0)
-- Dependencies: 692
-- Name: FUNCTION citextrecv(internal); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.citextrecv(internal) TO postgres;
GRANT ALL ON FUNCTION extensions.citextrecv(internal) TO anon;
GRANT ALL ON FUNCTION extensions.citextrecv(internal) TO authenticated;
GRANT ALL ON FUNCTION extensions.citextrecv(internal) TO service_role;


--
-- TOC entry 5605 (class 0 OID 0)
-- Dependencies: 621
-- Name: FUNCTION citextsend(extensions.citext); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.citextsend(extensions.citext) TO postgres;
GRANT ALL ON FUNCTION extensions.citextsend(extensions.citext) TO anon;
GRANT ALL ON FUNCTION extensions.citextsend(extensions.citext) TO authenticated;
GRANT ALL ON FUNCTION extensions.citextsend(extensions.citext) TO service_role;


--
-- TOC entry 5606 (class 0 OID 0)
-- Dependencies: 654
-- Name: FUNCTION gtrgm_in(cstring); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gtrgm_in(cstring) TO postgres;
GRANT ALL ON FUNCTION public.gtrgm_in(cstring) TO anon;
GRANT ALL ON FUNCTION public.gtrgm_in(cstring) TO authenticated;
GRANT ALL ON FUNCTION public.gtrgm_in(cstring) TO service_role;


--
-- TOC entry 5607 (class 0 OID 0)
-- Dependencies: 635
-- Name: FUNCTION gtrgm_out(public.gtrgm); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gtrgm_out(public.gtrgm) TO postgres;
GRANT ALL ON FUNCTION public.gtrgm_out(public.gtrgm) TO anon;
GRANT ALL ON FUNCTION public.gtrgm_out(public.gtrgm) TO authenticated;
GRANT ALL ON FUNCTION public.gtrgm_out(public.gtrgm) TO service_role;


--
-- TOC entry 5608 (class 0 OID 0)
-- Dependencies: 518
-- Name: FUNCTION citext(boolean); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.citext(boolean) TO postgres;
GRANT ALL ON FUNCTION extensions.citext(boolean) TO anon;
GRANT ALL ON FUNCTION extensions.citext(boolean) TO authenticated;
GRANT ALL ON FUNCTION extensions.citext(boolean) TO service_role;


--
-- TOC entry 5609 (class 0 OID 0)
-- Dependencies: 696
-- Name: FUNCTION citext(character); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.citext(character) TO postgres;
GRANT ALL ON FUNCTION extensions.citext(character) TO anon;
GRANT ALL ON FUNCTION extensions.citext(character) TO authenticated;
GRANT ALL ON FUNCTION extensions.citext(character) TO service_role;


--
-- TOC entry 5610 (class 0 OID 0)
-- Dependencies: 499
-- Name: FUNCTION citext(inet); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.citext(inet) TO postgres;
GRANT ALL ON FUNCTION extensions.citext(inet) TO anon;
GRANT ALL ON FUNCTION extensions.citext(inet) TO authenticated;
GRANT ALL ON FUNCTION extensions.citext(inet) TO service_role;


--
-- TOC entry 5611 (class 0 OID 0)
-- Dependencies: 668
-- Name: FUNCTION add_order_status_event(p_tenant_id uuid, p_order_id uuid, p_from text, p_to text, p_by_staff_id uuid); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.add_order_status_event(p_tenant_id uuid, p_order_id uuid, p_from text, p_to text, p_by_staff_id uuid) TO authenticated;


--
-- TOC entry 5612 (class 0 OID 0)
-- Dependencies: 698
-- Name: FUNCTION analytics_revenue(p_window text, p_granularity text); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.analytics_revenue(p_window text, p_granularity text) TO authenticated;


--
-- TOC entry 5613 (class 0 OID 0)
-- Dependencies: 488
-- Name: FUNCTION analytics_summary(p_window text); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.analytics_summary(p_window text) TO authenticated;


--
-- TOC entry 5614 (class 0 OID 0)
-- Dependencies: 724
-- Name: FUNCTION confirm_payment_and_close(p_tenant_id uuid, p_order_id uuid, p_intent_id uuid, p_amount numeric); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.confirm_payment_and_close(p_tenant_id uuid, p_order_id uuid, p_intent_id uuid, p_amount numeric) TO authenticated;


--
-- TOC entry 5615 (class 0 OID 0)
-- Dependencies: 519
-- Name: FUNCTION create_intent_for_order(p_order_id uuid, p_currency text, p_provider text); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.create_intent_for_order(p_order_id uuid, p_currency text, p_provider text) TO authenticated;


--
-- TOC entry 5616 (class 0 OID 0)
-- Dependencies: 599
-- Name: FUNCTION create_payment_intent(p_order_id uuid, p_amount numeric, p_currency text, p_provider text); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.create_payment_intent(p_order_id uuid, p_amount numeric, p_currency text, p_provider text) TO authenticated;


--
-- TOC entry 5618 (class 0 OID 0)
-- Dependencies: 489
-- Name: FUNCTION current_tenant_id(); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.current_tenant_id() TO authenticated;


--
-- TOC entry 5619 (class 0 OID 0)
-- Dependencies: 535
-- Name: FUNCTION ensure_payment_intent(p_tenant_id uuid, p_order_id uuid, p_provider text); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.ensure_payment_intent(p_tenant_id uuid, p_order_id uuid, p_provider text) TO authenticated;


--
-- TOC entry 5620 (class 0 OID 0)
-- Dependencies: 729
-- Name: FUNCTION kds_counts(p_tenant_id uuid); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.kds_counts(p_tenant_id uuid) TO authenticated;


--
-- TOC entry 5621 (class 0 OID 0)
-- Dependencies: 500
-- Name: FUNCTION kds_lane(status text); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.kds_lane(status text) TO authenticated;


--
-- TOC entry 5622 (class 0 OID 0)
-- Dependencies: 577
-- Name: FUNCTION kds_lane_counts(p_tenant_id uuid); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.kds_lane_counts(p_tenant_id uuid) TO authenticated;


--
-- TOC entry 5623 (class 0 OID 0)
-- Dependencies: 693
-- Name: FUNCTION kpi_summary(p_tenant_id uuid, p_window text); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.kpi_summary(p_tenant_id uuid, p_window text) TO authenticated;


--
-- TOC entry 5624 (class 0 OID 0)
-- Dependencies: 682
-- Name: FUNCTION mark_order_paid(p_order_id uuid, p_note text); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.mark_order_paid(p_order_id uuid, p_note text) TO authenticated;


--
-- TOC entry 5625 (class 0 OID 0)
-- Dependencies: 686
-- Name: FUNCTION mark_order_preparing(p_order_id uuid, p_note text); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.mark_order_preparing(p_order_id uuid, p_note text) TO authenticated;


--
-- TOC entry 5626 (class 0 OID 0)
-- Dependencies: 555
-- Name: FUNCTION mark_order_ready(p_order_id uuid, p_note text); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.mark_order_ready(p_order_id uuid, p_note text) TO authenticated;


--
-- TOC entry 5627 (class 0 OID 0)
-- Dependencies: 680
-- Name: FUNCTION mark_order_served(p_order_id uuid, p_note text); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.mark_order_served(p_order_id uuid, p_note text) TO authenticated;


--
-- TOC entry 5628 (class 0 OID 0)
-- Dependencies: 558
-- Name: FUNCTION mark_payment_intent_status(p_intent_id uuid, p_status text, p_event jsonb); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.mark_payment_intent_status(p_intent_id uuid, p_status text, p_event jsonb) TO authenticated;


--
-- TOC entry 5629 (class 0 OID 0)
-- Dependencies: 684
-- Name: FUNCTION order_fulfillment_timeline(p_tenant_id uuid, p_window text); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.order_fulfillment_timeline(p_tenant_id uuid, p_window text) TO authenticated;


--
-- TOC entry 5630 (class 0 OID 0)
-- Dependencies: 411
-- Name: TABLE order_status_events; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.order_status_events TO anon;
GRANT ALL ON TABLE public.order_status_events TO authenticated;
GRANT ALL ON TABLE public.order_status_events TO service_role;


--
-- TOC entry 5631 (class 0 OID 0)
-- Dependencies: 639
-- Name: FUNCTION order_set_status(p_order_id uuid, p_to_status text, p_reason text, p_meta jsonb); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.order_set_status(p_order_id uuid, p_to_status text, p_reason text, p_meta jsonb) TO authenticated;


--
-- TOC entry 5632 (class 0 OID 0)
-- Dependencies: 594
-- Name: FUNCTION payment_conversion_funnel(p_tenant_id uuid, p_window text); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.payment_conversion_funnel(p_tenant_id uuid, p_window text) TO authenticated;


--
-- TOC entry 5633 (class 0 OID 0)
-- Dependencies: 472
-- Name: FUNCTION peak_hours_heatmap(p_tenant_id uuid, p_window text); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.peak_hours_heatmap(p_tenant_id uuid, p_window text) TO authenticated;


--
-- TOC entry 5634 (class 0 OID 0)
-- Dependencies: 611
-- Name: FUNCTION push_order_status(p_order_id uuid, p_status text, p_note text, p_by_user uuid); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.push_order_status(p_order_id uuid, p_status text, p_note text, p_by_user uuid) TO authenticated;


--
-- TOC entry 5635 (class 0 OID 0)
-- Dependencies: 540
-- Name: FUNCTION revenue_by_method(p_tenant_id uuid, p_window text); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.revenue_by_method(p_tenant_id uuid, p_window text) TO authenticated;


--
-- TOC entry 5636 (class 0 OID 0)
-- Dependencies: 477
-- Name: FUNCTION revenue_timeseries(p_tenant_id uuid, p_window text, p_granularity text); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.revenue_timeseries(p_tenant_id uuid, p_window text, p_granularity text) TO authenticated;


--
-- TOC entry 5637 (class 0 OID 0)
-- Dependencies: 661
-- Name: FUNCTION set_default_payment_provider(p_provider_id uuid); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.set_default_payment_provider(p_provider_id uuid) TO authenticated;


--
-- TOC entry 5638 (class 0 OID 0)
-- Dependencies: 549
-- Name: FUNCTION top_items(p_tenant_id uuid, p_window text, p_limit integer); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.top_items(p_tenant_id uuid, p_window text, p_limit integer) TO authenticated;


--
-- TOC entry 5640 (class 0 OID 0)
-- Dependencies: 620
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- TOC entry 5641 (class 0 OID 0)
-- Dependencies: 681
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- TOC entry 5643 (class 0 OID 0)
-- Dependencies: 498
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- TOC entry 5645 (class 0 OID 0)
-- Dependencies: 467
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- TOC entry 5646 (class 0 OID 0)
-- Dependencies: 575
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;


--
-- TOC entry 5647 (class 0 OID 0)
-- Dependencies: 687
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea, text[], text[]) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;


--
-- TOC entry 5648 (class 0 OID 0)
-- Dependencies: 629
-- Name: FUNCTION citext_cmp(extensions.citext, extensions.citext); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.citext_cmp(extensions.citext, extensions.citext) TO postgres;
GRANT ALL ON FUNCTION extensions.citext_cmp(extensions.citext, extensions.citext) TO anon;
GRANT ALL ON FUNCTION extensions.citext_cmp(extensions.citext, extensions.citext) TO authenticated;
GRANT ALL ON FUNCTION extensions.citext_cmp(extensions.citext, extensions.citext) TO service_role;


--
-- TOC entry 5649 (class 0 OID 0)
-- Dependencies: 703
-- Name: FUNCTION citext_eq(extensions.citext, extensions.citext); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.citext_eq(extensions.citext, extensions.citext) TO postgres;
GRANT ALL ON FUNCTION extensions.citext_eq(extensions.citext, extensions.citext) TO anon;
GRANT ALL ON FUNCTION extensions.citext_eq(extensions.citext, extensions.citext) TO authenticated;
GRANT ALL ON FUNCTION extensions.citext_eq(extensions.citext, extensions.citext) TO service_role;


--
-- TOC entry 5650 (class 0 OID 0)
-- Dependencies: 579
-- Name: FUNCTION citext_ge(extensions.citext, extensions.citext); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.citext_ge(extensions.citext, extensions.citext) TO postgres;
GRANT ALL ON FUNCTION extensions.citext_ge(extensions.citext, extensions.citext) TO anon;
GRANT ALL ON FUNCTION extensions.citext_ge(extensions.citext, extensions.citext) TO authenticated;
GRANT ALL ON FUNCTION extensions.citext_ge(extensions.citext, extensions.citext) TO service_role;


--
-- TOC entry 5651 (class 0 OID 0)
-- Dependencies: 590
-- Name: FUNCTION citext_gt(extensions.citext, extensions.citext); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.citext_gt(extensions.citext, extensions.citext) TO postgres;
GRANT ALL ON FUNCTION extensions.citext_gt(extensions.citext, extensions.citext) TO anon;
GRANT ALL ON FUNCTION extensions.citext_gt(extensions.citext, extensions.citext) TO authenticated;
GRANT ALL ON FUNCTION extensions.citext_gt(extensions.citext, extensions.citext) TO service_role;


--
-- TOC entry 5652 (class 0 OID 0)
-- Dependencies: 593
-- Name: FUNCTION citext_hash(extensions.citext); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.citext_hash(extensions.citext) TO postgres;
GRANT ALL ON FUNCTION extensions.citext_hash(extensions.citext) TO anon;
GRANT ALL ON FUNCTION extensions.citext_hash(extensions.citext) TO authenticated;
GRANT ALL ON FUNCTION extensions.citext_hash(extensions.citext) TO service_role;


--
-- TOC entry 5653 (class 0 OID 0)
-- Dependencies: 634
-- Name: FUNCTION citext_hash_extended(extensions.citext, bigint); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.citext_hash_extended(extensions.citext, bigint) TO postgres;
GRANT ALL ON FUNCTION extensions.citext_hash_extended(extensions.citext, bigint) TO anon;
GRANT ALL ON FUNCTION extensions.citext_hash_extended(extensions.citext, bigint) TO authenticated;
GRANT ALL ON FUNCTION extensions.citext_hash_extended(extensions.citext, bigint) TO service_role;


--
-- TOC entry 5654 (class 0 OID 0)
-- Dependencies: 523
-- Name: FUNCTION citext_larger(extensions.citext, extensions.citext); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.citext_larger(extensions.citext, extensions.citext) TO postgres;
GRANT ALL ON FUNCTION extensions.citext_larger(extensions.citext, extensions.citext) TO anon;
GRANT ALL ON FUNCTION extensions.citext_larger(extensions.citext, extensions.citext) TO authenticated;
GRANT ALL ON FUNCTION extensions.citext_larger(extensions.citext, extensions.citext) TO service_role;


--
-- TOC entry 5655 (class 0 OID 0)
-- Dependencies: 701
-- Name: FUNCTION citext_le(extensions.citext, extensions.citext); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.citext_le(extensions.citext, extensions.citext) TO postgres;
GRANT ALL ON FUNCTION extensions.citext_le(extensions.citext, extensions.citext) TO anon;
GRANT ALL ON FUNCTION extensions.citext_le(extensions.citext, extensions.citext) TO authenticated;
GRANT ALL ON FUNCTION extensions.citext_le(extensions.citext, extensions.citext) TO service_role;


--
-- TOC entry 5656 (class 0 OID 0)
-- Dependencies: 713
-- Name: FUNCTION citext_lt(extensions.citext, extensions.citext); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.citext_lt(extensions.citext, extensions.citext) TO postgres;
GRANT ALL ON FUNCTION extensions.citext_lt(extensions.citext, extensions.citext) TO anon;
GRANT ALL ON FUNCTION extensions.citext_lt(extensions.citext, extensions.citext) TO authenticated;
GRANT ALL ON FUNCTION extensions.citext_lt(extensions.citext, extensions.citext) TO service_role;


--
-- TOC entry 5657 (class 0 OID 0)
-- Dependencies: 730
-- Name: FUNCTION citext_ne(extensions.citext, extensions.citext); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.citext_ne(extensions.citext, extensions.citext) TO postgres;
GRANT ALL ON FUNCTION extensions.citext_ne(extensions.citext, extensions.citext) TO anon;
GRANT ALL ON FUNCTION extensions.citext_ne(extensions.citext, extensions.citext) TO authenticated;
GRANT ALL ON FUNCTION extensions.citext_ne(extensions.citext, extensions.citext) TO service_role;


--
-- TOC entry 5658 (class 0 OID 0)
-- Dependencies: 610
-- Name: FUNCTION citext_pattern_cmp(extensions.citext, extensions.citext); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.citext_pattern_cmp(extensions.citext, extensions.citext) TO postgres;
GRANT ALL ON FUNCTION extensions.citext_pattern_cmp(extensions.citext, extensions.citext) TO anon;
GRANT ALL ON FUNCTION extensions.citext_pattern_cmp(extensions.citext, extensions.citext) TO authenticated;
GRANT ALL ON FUNCTION extensions.citext_pattern_cmp(extensions.citext, extensions.citext) TO service_role;


--
-- TOC entry 5659 (class 0 OID 0)
-- Dependencies: 490
-- Name: FUNCTION citext_pattern_ge(extensions.citext, extensions.citext); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.citext_pattern_ge(extensions.citext, extensions.citext) TO postgres;
GRANT ALL ON FUNCTION extensions.citext_pattern_ge(extensions.citext, extensions.citext) TO anon;
GRANT ALL ON FUNCTION extensions.citext_pattern_ge(extensions.citext, extensions.citext) TO authenticated;
GRANT ALL ON FUNCTION extensions.citext_pattern_ge(extensions.citext, extensions.citext) TO service_role;


--
-- TOC entry 5660 (class 0 OID 0)
-- Dependencies: 605
-- Name: FUNCTION citext_pattern_gt(extensions.citext, extensions.citext); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.citext_pattern_gt(extensions.citext, extensions.citext) TO postgres;
GRANT ALL ON FUNCTION extensions.citext_pattern_gt(extensions.citext, extensions.citext) TO anon;
GRANT ALL ON FUNCTION extensions.citext_pattern_gt(extensions.citext, extensions.citext) TO authenticated;
GRANT ALL ON FUNCTION extensions.citext_pattern_gt(extensions.citext, extensions.citext) TO service_role;


--
-- TOC entry 5661 (class 0 OID 0)
-- Dependencies: 728
-- Name: FUNCTION citext_pattern_le(extensions.citext, extensions.citext); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.citext_pattern_le(extensions.citext, extensions.citext) TO postgres;
GRANT ALL ON FUNCTION extensions.citext_pattern_le(extensions.citext, extensions.citext) TO anon;
GRANT ALL ON FUNCTION extensions.citext_pattern_le(extensions.citext, extensions.citext) TO authenticated;
GRANT ALL ON FUNCTION extensions.citext_pattern_le(extensions.citext, extensions.citext) TO service_role;


--
-- TOC entry 5662 (class 0 OID 0)
-- Dependencies: 464
-- Name: FUNCTION citext_pattern_lt(extensions.citext, extensions.citext); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.citext_pattern_lt(extensions.citext, extensions.citext) TO postgres;
GRANT ALL ON FUNCTION extensions.citext_pattern_lt(extensions.citext, extensions.citext) TO anon;
GRANT ALL ON FUNCTION extensions.citext_pattern_lt(extensions.citext, extensions.citext) TO authenticated;
GRANT ALL ON FUNCTION extensions.citext_pattern_lt(extensions.citext, extensions.citext) TO service_role;


--
-- TOC entry 5663 (class 0 OID 0)
-- Dependencies: 708
-- Name: FUNCTION citext_smaller(extensions.citext, extensions.citext); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.citext_smaller(extensions.citext, extensions.citext) TO postgres;
GRANT ALL ON FUNCTION extensions.citext_smaller(extensions.citext, extensions.citext) TO anon;
GRANT ALL ON FUNCTION extensions.citext_smaller(extensions.citext, extensions.citext) TO authenticated;
GRANT ALL ON FUNCTION extensions.citext_smaller(extensions.citext, extensions.citext) TO service_role;


--
-- TOC entry 5664 (class 0 OID 0)
-- Dependencies: 719
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.crypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;


--
-- TOC entry 5665 (class 0 OID 0)
-- Dependencies: 574
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.dearmor(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;


--
-- TOC entry 5666 (class 0 OID 0)
-- Dependencies: 456
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 5667 (class 0 OID 0)
-- Dependencies: 475
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 5668 (class 0 OID 0)
-- Dependencies: 709
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;


--
-- TOC entry 5669 (class 0 OID 0)
-- Dependencies: 657
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;


--
-- TOC entry 5670 (class 0 OID 0)
-- Dependencies: 512
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 5671 (class 0 OID 0)
-- Dependencies: 463
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 5672 (class 0 OID 0)
-- Dependencies: 496
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_bytes(integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;


--
-- TOC entry 5673 (class 0 OID 0)
-- Dependencies: 656
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_uuid() FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;


--
-- TOC entry 5674 (class 0 OID 0)
-- Dependencies: 646
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;


--
-- TOC entry 5675 (class 0 OID 0)
-- Dependencies: 568
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text, integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;


--
-- TOC entry 5677 (class 0 OID 0)
-- Dependencies: 598
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- TOC entry 5679 (class 0 OID 0)
-- Dependencies: 583
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- TOC entry 5681 (class 0 OID 0)
-- Dependencies: 608
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- TOC entry 5682 (class 0 OID 0)
-- Dependencies: 465
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 5683 (class 0 OID 0)
-- Dependencies: 487
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;


--
-- TOC entry 5684 (class 0 OID 0)
-- Dependencies: 530
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO dashboard_user;


--
-- TOC entry 5685 (class 0 OID 0)
-- Dependencies: 630
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO dashboard_user;


--
-- TOC entry 5686 (class 0 OID 0)
-- Dependencies: 609
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO dashboard_user;


--
-- TOC entry 5687 (class 0 OID 0)
-- Dependencies: 534
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;


--
-- TOC entry 5688 (class 0 OID 0)
-- Dependencies: 717
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_key_id(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;


--
-- TOC entry 5689 (class 0 OID 0)
-- Dependencies: 529
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;


--
-- TOC entry 5690 (class 0 OID 0)
-- Dependencies: 459
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 5691 (class 0 OID 0)
-- Dependencies: 700
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;


--
-- TOC entry 5692 (class 0 OID 0)
-- Dependencies: 685
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- TOC entry 5693 (class 0 OID 0)
-- Dependencies: 694
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 5694 (class 0 OID 0)
-- Dependencies: 711
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;


--
-- TOC entry 5695 (class 0 OID 0)
-- Dependencies: 501
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;


--
-- TOC entry 5696 (class 0 OID 0)
-- Dependencies: 478
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;


--
-- TOC entry 5697 (class 0 OID 0)
-- Dependencies: 553
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- TOC entry 5698 (class 0 OID 0)
-- Dependencies: 573
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 5699 (class 0 OID 0)
-- Dependencies: 731
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;


--
-- TOC entry 5700 (class 0 OID 0)
-- Dependencies: 720
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;


--
-- TOC entry 5701 (class 0 OID 0)
-- Dependencies: 723
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;


--
-- TOC entry 5702 (class 0 OID 0)
-- Dependencies: 509
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- TOC entry 5703 (class 0 OID 0)
-- Dependencies: 653
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;


--
-- TOC entry 5704 (class 0 OID 0)
-- Dependencies: 539
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;


--
-- TOC entry 5705 (class 0 OID 0)
-- Dependencies: 586
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;


--
-- TOC entry 5706 (class 0 OID 0)
-- Dependencies: 458
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- TOC entry 5707 (class 0 OID 0)
-- Dependencies: 526
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- TOC entry 5708 (class 0 OID 0)
-- Dependencies: 716
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- TOC entry 5709 (class 0 OID 0)
-- Dependencies: 514
-- Name: FUNCTION regexp_match(extensions.citext, extensions.citext); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.regexp_match(extensions.citext, extensions.citext) TO postgres;
GRANT ALL ON FUNCTION extensions.regexp_match(extensions.citext, extensions.citext) TO anon;
GRANT ALL ON FUNCTION extensions.regexp_match(extensions.citext, extensions.citext) TO authenticated;
GRANT ALL ON FUNCTION extensions.regexp_match(extensions.citext, extensions.citext) TO service_role;


--
-- TOC entry 5710 (class 0 OID 0)
-- Dependencies: 525
-- Name: FUNCTION regexp_match(extensions.citext, extensions.citext, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.regexp_match(extensions.citext, extensions.citext, text) TO postgres;
GRANT ALL ON FUNCTION extensions.regexp_match(extensions.citext, extensions.citext, text) TO anon;
GRANT ALL ON FUNCTION extensions.regexp_match(extensions.citext, extensions.citext, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.regexp_match(extensions.citext, extensions.citext, text) TO service_role;


--
-- TOC entry 5711 (class 0 OID 0)
-- Dependencies: 527
-- Name: FUNCTION regexp_matches(extensions.citext, extensions.citext); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.regexp_matches(extensions.citext, extensions.citext) TO postgres;
GRANT ALL ON FUNCTION extensions.regexp_matches(extensions.citext, extensions.citext) TO anon;
GRANT ALL ON FUNCTION extensions.regexp_matches(extensions.citext, extensions.citext) TO authenticated;
GRANT ALL ON FUNCTION extensions.regexp_matches(extensions.citext, extensions.citext) TO service_role;


--
-- TOC entry 5712 (class 0 OID 0)
-- Dependencies: 516
-- Name: FUNCTION regexp_matches(extensions.citext, extensions.citext, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.regexp_matches(extensions.citext, extensions.citext, text) TO postgres;
GRANT ALL ON FUNCTION extensions.regexp_matches(extensions.citext, extensions.citext, text) TO anon;
GRANT ALL ON FUNCTION extensions.regexp_matches(extensions.citext, extensions.citext, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.regexp_matches(extensions.citext, extensions.citext, text) TO service_role;


--
-- TOC entry 5713 (class 0 OID 0)
-- Dependencies: 676
-- Name: FUNCTION regexp_replace(extensions.citext, extensions.citext, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.regexp_replace(extensions.citext, extensions.citext, text) TO postgres;
GRANT ALL ON FUNCTION extensions.regexp_replace(extensions.citext, extensions.citext, text) TO anon;
GRANT ALL ON FUNCTION extensions.regexp_replace(extensions.citext, extensions.citext, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.regexp_replace(extensions.citext, extensions.citext, text) TO service_role;


--
-- TOC entry 5714 (class 0 OID 0)
-- Dependencies: 566
-- Name: FUNCTION regexp_replace(extensions.citext, extensions.citext, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.regexp_replace(extensions.citext, extensions.citext, text, text) TO postgres;
GRANT ALL ON FUNCTION extensions.regexp_replace(extensions.citext, extensions.citext, text, text) TO anon;
GRANT ALL ON FUNCTION extensions.regexp_replace(extensions.citext, extensions.citext, text, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.regexp_replace(extensions.citext, extensions.citext, text, text) TO service_role;


--
-- TOC entry 5715 (class 0 OID 0)
-- Dependencies: 565
-- Name: FUNCTION regexp_split_to_array(extensions.citext, extensions.citext); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.regexp_split_to_array(extensions.citext, extensions.citext) TO postgres;
GRANT ALL ON FUNCTION extensions.regexp_split_to_array(extensions.citext, extensions.citext) TO anon;
GRANT ALL ON FUNCTION extensions.regexp_split_to_array(extensions.citext, extensions.citext) TO authenticated;
GRANT ALL ON FUNCTION extensions.regexp_split_to_array(extensions.citext, extensions.citext) TO service_role;


--
-- TOC entry 5716 (class 0 OID 0)
-- Dependencies: 722
-- Name: FUNCTION regexp_split_to_array(extensions.citext, extensions.citext, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.regexp_split_to_array(extensions.citext, extensions.citext, text) TO postgres;
GRANT ALL ON FUNCTION extensions.regexp_split_to_array(extensions.citext, extensions.citext, text) TO anon;
GRANT ALL ON FUNCTION extensions.regexp_split_to_array(extensions.citext, extensions.citext, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.regexp_split_to_array(extensions.citext, extensions.citext, text) TO service_role;


--
-- TOC entry 5717 (class 0 OID 0)
-- Dependencies: 704
-- Name: FUNCTION regexp_split_to_table(extensions.citext, extensions.citext); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.regexp_split_to_table(extensions.citext, extensions.citext) TO postgres;
GRANT ALL ON FUNCTION extensions.regexp_split_to_table(extensions.citext, extensions.citext) TO anon;
GRANT ALL ON FUNCTION extensions.regexp_split_to_table(extensions.citext, extensions.citext) TO authenticated;
GRANT ALL ON FUNCTION extensions.regexp_split_to_table(extensions.citext, extensions.citext) TO service_role;


--
-- TOC entry 5718 (class 0 OID 0)
-- Dependencies: 640
-- Name: FUNCTION regexp_split_to_table(extensions.citext, extensions.citext, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.regexp_split_to_table(extensions.citext, extensions.citext, text) TO postgres;
GRANT ALL ON FUNCTION extensions.regexp_split_to_table(extensions.citext, extensions.citext, text) TO anon;
GRANT ALL ON FUNCTION extensions.regexp_split_to_table(extensions.citext, extensions.citext, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.regexp_split_to_table(extensions.citext, extensions.citext, text) TO service_role;


--
-- TOC entry 5719 (class 0 OID 0)
-- Dependencies: 655
-- Name: FUNCTION replace(extensions.citext, extensions.citext, extensions.citext); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.replace(extensions.citext, extensions.citext, extensions.citext) TO postgres;
GRANT ALL ON FUNCTION extensions.replace(extensions.citext, extensions.citext, extensions.citext) TO anon;
GRANT ALL ON FUNCTION extensions.replace(extensions.citext, extensions.citext, extensions.citext) TO authenticated;
GRANT ALL ON FUNCTION extensions.replace(extensions.citext, extensions.citext, extensions.citext) TO service_role;


--
-- TOC entry 5721 (class 0 OID 0)
-- Dependencies: 480
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- TOC entry 5722 (class 0 OID 0)
-- Dependencies: 493
-- Name: FUNCTION split_part(extensions.citext, extensions.citext, integer); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.split_part(extensions.citext, extensions.citext, integer) TO postgres;
GRANT ALL ON FUNCTION extensions.split_part(extensions.citext, extensions.citext, integer) TO anon;
GRANT ALL ON FUNCTION extensions.split_part(extensions.citext, extensions.citext, integer) TO authenticated;
GRANT ALL ON FUNCTION extensions.split_part(extensions.citext, extensions.citext, integer) TO service_role;


--
-- TOC entry 5723 (class 0 OID 0)
-- Dependencies: 589
-- Name: FUNCTION strpos(extensions.citext, extensions.citext); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.strpos(extensions.citext, extensions.citext) TO postgres;
GRANT ALL ON FUNCTION extensions.strpos(extensions.citext, extensions.citext) TO anon;
GRANT ALL ON FUNCTION extensions.strpos(extensions.citext, extensions.citext) TO authenticated;
GRANT ALL ON FUNCTION extensions.strpos(extensions.citext, extensions.citext) TO service_role;


--
-- TOC entry 5724 (class 0 OID 0)
-- Dependencies: 469
-- Name: FUNCTION texticlike(extensions.citext, extensions.citext); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.texticlike(extensions.citext, extensions.citext) TO postgres;
GRANT ALL ON FUNCTION extensions.texticlike(extensions.citext, extensions.citext) TO anon;
GRANT ALL ON FUNCTION extensions.texticlike(extensions.citext, extensions.citext) TO authenticated;
GRANT ALL ON FUNCTION extensions.texticlike(extensions.citext, extensions.citext) TO service_role;


--
-- TOC entry 5725 (class 0 OID 0)
-- Dependencies: 508
-- Name: FUNCTION texticlike(extensions.citext, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.texticlike(extensions.citext, text) TO postgres;
GRANT ALL ON FUNCTION extensions.texticlike(extensions.citext, text) TO anon;
GRANT ALL ON FUNCTION extensions.texticlike(extensions.citext, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.texticlike(extensions.citext, text) TO service_role;


--
-- TOC entry 5726 (class 0 OID 0)
-- Dependencies: 683
-- Name: FUNCTION texticnlike(extensions.citext, extensions.citext); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.texticnlike(extensions.citext, extensions.citext) TO postgres;
GRANT ALL ON FUNCTION extensions.texticnlike(extensions.citext, extensions.citext) TO anon;
GRANT ALL ON FUNCTION extensions.texticnlike(extensions.citext, extensions.citext) TO authenticated;
GRANT ALL ON FUNCTION extensions.texticnlike(extensions.citext, extensions.citext) TO service_role;


--
-- TOC entry 5727 (class 0 OID 0)
-- Dependencies: 538
-- Name: FUNCTION texticnlike(extensions.citext, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.texticnlike(extensions.citext, text) TO postgres;
GRANT ALL ON FUNCTION extensions.texticnlike(extensions.citext, text) TO anon;
GRANT ALL ON FUNCTION extensions.texticnlike(extensions.citext, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.texticnlike(extensions.citext, text) TO service_role;


--
-- TOC entry 5728 (class 0 OID 0)
-- Dependencies: 674
-- Name: FUNCTION texticregexeq(extensions.citext, extensions.citext); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.texticregexeq(extensions.citext, extensions.citext) TO postgres;
GRANT ALL ON FUNCTION extensions.texticregexeq(extensions.citext, extensions.citext) TO anon;
GRANT ALL ON FUNCTION extensions.texticregexeq(extensions.citext, extensions.citext) TO authenticated;
GRANT ALL ON FUNCTION extensions.texticregexeq(extensions.citext, extensions.citext) TO service_role;


--
-- TOC entry 5729 (class 0 OID 0)
-- Dependencies: 462
-- Name: FUNCTION texticregexeq(extensions.citext, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.texticregexeq(extensions.citext, text) TO postgres;
GRANT ALL ON FUNCTION extensions.texticregexeq(extensions.citext, text) TO anon;
GRANT ALL ON FUNCTION extensions.texticregexeq(extensions.citext, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.texticregexeq(extensions.citext, text) TO service_role;


--
-- TOC entry 5730 (class 0 OID 0)
-- Dependencies: 587
-- Name: FUNCTION texticregexne(extensions.citext, extensions.citext); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.texticregexne(extensions.citext, extensions.citext) TO postgres;
GRANT ALL ON FUNCTION extensions.texticregexne(extensions.citext, extensions.citext) TO anon;
GRANT ALL ON FUNCTION extensions.texticregexne(extensions.citext, extensions.citext) TO authenticated;
GRANT ALL ON FUNCTION extensions.texticregexne(extensions.citext, extensions.citext) TO service_role;


--
-- TOC entry 5731 (class 0 OID 0)
-- Dependencies: 471
-- Name: FUNCTION texticregexne(extensions.citext, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.texticregexne(extensions.citext, text) TO postgres;
GRANT ALL ON FUNCTION extensions.texticregexne(extensions.citext, text) TO anon;
GRANT ALL ON FUNCTION extensions.texticregexne(extensions.citext, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.texticregexne(extensions.citext, text) TO service_role;


--
-- TOC entry 5732 (class 0 OID 0)
-- Dependencies: 570
-- Name: FUNCTION translate(extensions.citext, extensions.citext, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.translate(extensions.citext, extensions.citext, text) TO postgres;
GRANT ALL ON FUNCTION extensions.translate(extensions.citext, extensions.citext, text) TO anon;
GRANT ALL ON FUNCTION extensions.translate(extensions.citext, extensions.citext, text) TO authenticated;
GRANT ALL ON FUNCTION extensions.translate(extensions.citext, extensions.citext, text) TO service_role;


--
-- TOC entry 5733 (class 0 OID 0)
-- Dependencies: 679
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;


--
-- TOC entry 5734 (class 0 OID 0)
-- Dependencies: 542
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1mc() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;


--
-- TOC entry 5735 (class 0 OID 0)
-- Dependencies: 714
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;


--
-- TOC entry 5736 (class 0 OID 0)
-- Dependencies: 504
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v4() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;


--
-- TOC entry 5737 (class 0 OID 0)
-- Dependencies: 560
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;


--
-- TOC entry 5738 (class 0 OID 0)
-- Dependencies: 569
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_nil() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;


--
-- TOC entry 5739 (class 0 OID 0)
-- Dependencies: 507
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_dns() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;


--
-- TOC entry 5740 (class 0 OID 0)
-- Dependencies: 567
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_oid() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;


--
-- TOC entry 5741 (class 0 OID 0)
-- Dependencies: 584
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_url() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;


--
-- TOC entry 5742 (class 0 OID 0)
-- Dependencies: 544
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_x500() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;


--
-- TOC entry 5743 (class 0 OID 0)
-- Dependencies: 603
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- TOC entry 5744 (class 0 OID 0)
-- Dependencies: 667
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO postgres;


--
-- TOC entry 5745 (class 0 OID 0)
-- Dependencies: 564
-- Name: FUNCTION app_is_platform(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.app_is_platform() TO anon;
GRANT ALL ON FUNCTION public.app_is_platform() TO authenticated;
GRANT ALL ON FUNCTION public.app_is_platform() TO service_role;


--
-- TOC entry 5746 (class 0 OID 0)
-- Dependencies: 601
-- Name: FUNCTION app_tenant_id(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.app_tenant_id() TO anon;
GRANT ALL ON FUNCTION public.app_tenant_id() TO authenticated;
GRANT ALL ON FUNCTION public.app_tenant_id() TO service_role;


--
-- TOC entry 5747 (class 0 OID 0)
-- Dependencies: 622
-- Name: FUNCTION calculate_order_total(order_uuid uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.calculate_order_total(order_uuid uuid) TO anon;
GRANT ALL ON FUNCTION public.calculate_order_total(order_uuid uuid) TO authenticated;
GRANT ALL ON FUNCTION public.calculate_order_total(order_uuid uuid) TO service_role;


--
-- TOC entry 5748 (class 0 OID 0)
-- Dependencies: 521
-- Name: FUNCTION can_user_see_menu_items(uid uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.can_user_see_menu_items(uid uuid) TO anon;
GRANT ALL ON FUNCTION public.can_user_see_menu_items(uid uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_user_see_menu_items(uid uuid) TO service_role;


--
-- TOC entry 5749 (class 0 OID 0)
-- Dependencies: 522
-- Name: FUNCTION cart_items_increment(p_tenant_id uuid, p_cart_id uuid, p_menu_item_id uuid, p_qty integer, p_price numeric, p_name text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.cart_items_increment(p_tenant_id uuid, p_cart_id uuid, p_menu_item_id uuid, p_qty integer, p_price numeric, p_name text) TO anon;
GRANT ALL ON FUNCTION public.cart_items_increment(p_tenant_id uuid, p_cart_id uuid, p_menu_item_id uuid, p_qty integer, p_price numeric, p_name text) TO authenticated;
GRANT ALL ON FUNCTION public.cart_items_increment(p_tenant_id uuid, p_cart_id uuid, p_menu_item_id uuid, p_qty integer, p_price numeric, p_name text) TO service_role;


--
-- TOC entry 5750 (class 0 OID 0)
-- Dependencies: 552
-- Name: FUNCTION cart_items_increment_batch(p_tenant_id uuid, p_cart_id uuid, p_lines jsonb); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.cart_items_increment_batch(p_tenant_id uuid, p_cart_id uuid, p_lines jsonb) TO anon;
GRANT ALL ON FUNCTION public.cart_items_increment_batch(p_tenant_id uuid, p_cart_id uuid, p_lines jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.cart_items_increment_batch(p_tenant_id uuid, p_cart_id uuid, p_lines jsonb) TO service_role;


--
-- TOC entry 5751 (class 0 OID 0)
-- Dependencies: 580
-- Name: FUNCTION checkout_cart(p_tenant_id uuid, p_user_id uuid, p_cart_id uuid, p_payment_intent_id text, p_notes text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.checkout_cart(p_tenant_id uuid, p_user_id uuid, p_cart_id uuid, p_payment_intent_id text, p_notes text) TO anon;
GRANT ALL ON FUNCTION public.checkout_cart(p_tenant_id uuid, p_user_id uuid, p_cart_id uuid, p_payment_intent_id text, p_notes text) TO authenticated;
GRANT ALL ON FUNCTION public.checkout_cart(p_tenant_id uuid, p_user_id uuid, p_cart_id uuid, p_payment_intent_id text, p_notes text) TO service_role;


--
-- TOC entry 5752 (class 0 OID 0)
-- Dependencies: 576
-- Name: FUNCTION checkout_cart(p_tenant_id uuid, p_user_id uuid, p_cart_id uuid, p_payment_intent_id uuid, p_notes text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.checkout_cart(p_tenant_id uuid, p_user_id uuid, p_cart_id uuid, p_payment_intent_id uuid, p_notes text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.checkout_cart(p_tenant_id uuid, p_user_id uuid, p_cart_id uuid, p_payment_intent_id uuid, p_notes text) TO anon;
GRANT ALL ON FUNCTION public.checkout_cart(p_tenant_id uuid, p_user_id uuid, p_cart_id uuid, p_payment_intent_id uuid, p_notes text) TO authenticated;
GRANT ALL ON FUNCTION public.checkout_cart(p_tenant_id uuid, p_user_id uuid, p_cart_id uuid, p_payment_intent_id uuid, p_notes text) TO service_role;


--
-- TOC entry 5753 (class 0 OID 0)
-- Dependencies: 479
-- Name: FUNCTION checkout_cart_v2(p_tenant_id uuid, p_user_id uuid, p_cart_id uuid, p_payment_intent_id text, p_notes text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.checkout_cart_v2(p_tenant_id uuid, p_user_id uuid, p_cart_id uuid, p_payment_intent_id text, p_notes text) TO anon;
GRANT ALL ON FUNCTION public.checkout_cart_v2(p_tenant_id uuid, p_user_id uuid, p_cart_id uuid, p_payment_intent_id text, p_notes text) TO authenticated;
GRANT ALL ON FUNCTION public.checkout_cart_v2(p_tenant_id uuid, p_user_id uuid, p_cart_id uuid, p_payment_intent_id text, p_notes text) TO service_role;


--
-- TOC entry 5754 (class 0 OID 0)
-- Dependencies: 474
-- Name: FUNCTION checkout_order(p_tenant_id uuid, p_session_id text, p_mode text, p_table_id uuid, p_cart_version integer, p_idempotency_key text, p_total_cents integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.checkout_order(p_tenant_id uuid, p_session_id text, p_mode text, p_table_id uuid, p_cart_version integer, p_idempotency_key text, p_total_cents integer) TO anon;
GRANT ALL ON FUNCTION public.checkout_order(p_tenant_id uuid, p_session_id text, p_mode text, p_table_id uuid, p_cart_version integer, p_idempotency_key text, p_total_cents integer) TO authenticated;
GRANT ALL ON FUNCTION public.checkout_order(p_tenant_id uuid, p_session_id text, p_mode text, p_table_id uuid, p_cart_version integer, p_idempotency_key text, p_total_cents integer) TO service_role;


--
-- TOC entry 5755 (class 0 OID 0)
-- Dependencies: 650
-- Name: FUNCTION current_tenant_ids(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.current_tenant_ids() TO anon;
GRANT ALL ON FUNCTION public.current_tenant_ids() TO authenticated;
GRANT ALL ON FUNCTION public.current_tenant_ids() TO service_role;


--
-- TOC entry 5756 (class 0 OID 0)
-- Dependencies: 626
-- Name: FUNCTION current_tenant_ids(uid uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.current_tenant_ids(uid uuid) TO anon;
GRANT ALL ON FUNCTION public.current_tenant_ids(uid uuid) TO authenticated;
GRANT ALL ON FUNCTION public.current_tenant_ids(uid uuid) TO service_role;


--
-- TOC entry 5757 (class 0 OID 0)
-- Dependencies: 666
-- Name: FUNCTION ensure_trial_subscription_for_current_tenant(default_plan_code text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.ensure_trial_subscription_for_current_tenant(default_plan_code text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.ensure_trial_subscription_for_current_tenant(default_plan_code text) TO anon;
GRANT ALL ON FUNCTION public.ensure_trial_subscription_for_current_tenant(default_plan_code text) TO authenticated;
GRANT ALL ON FUNCTION public.ensure_trial_subscription_for_current_tenant(default_plan_code text) TO service_role;


--
-- TOC entry 5758 (class 0 OID 0)
-- Dependencies: 721
-- Name: FUNCTION ensure_trial_subscription_for_tenant(p_tenant uuid, default_plan_code text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.ensure_trial_subscription_for_tenant(p_tenant uuid, default_plan_code text) TO anon;
GRANT ALL ON FUNCTION public.ensure_trial_subscription_for_tenant(p_tenant uuid, default_plan_code text) TO authenticated;
GRANT ALL ON FUNCTION public.ensure_trial_subscription_for_tenant(p_tenant uuid, default_plan_code text) TO service_role;


--
-- TOC entry 5759 (class 0 OID 0)
-- Dependencies: 403
-- Name: TABLE tables; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tables TO anon;
GRANT ALL ON TABLE public.tables TO authenticated;
GRANT ALL ON TABLE public.tables TO service_role;


--
-- TOC entry 5760 (class 0 OID 0)
-- Dependencies: 615
-- Name: FUNCTION fn_search_available_tables(p_tenant_id uuid, p_party_size integer, p_starts_at timestamp with time zone, p_ends_at timestamp with time zone); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.fn_search_available_tables(p_tenant_id uuid, p_party_size integer, p_starts_at timestamp with time zone, p_ends_at timestamp with time zone) TO service_role;
GRANT ALL ON FUNCTION public.fn_search_available_tables(p_tenant_id uuid, p_party_size integer, p_starts_at timestamp with time zone, p_ends_at timestamp with time zone) TO anon;
GRANT ALL ON FUNCTION public.fn_search_available_tables(p_tenant_id uuid, p_party_size integer, p_starts_at timestamp with time zone, p_ends_at timestamp with time zone) TO authenticated;


--
-- TOC entry 5761 (class 0 OID 0)
-- Dependencies: 562
-- Name: FUNCTION generate_order_number(tenant_uuid uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.generate_order_number(tenant_uuid uuid) TO anon;
GRANT ALL ON FUNCTION public.generate_order_number(tenant_uuid uuid) TO authenticated;
GRANT ALL ON FUNCTION public.generate_order_number(tenant_uuid uuid) TO service_role;


--
-- TOC entry 5762 (class 0 OID 0)
-- Dependencies: 604
-- Name: FUNCTION gin_extract_query_trgm(text, internal, smallint, internal, internal, internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gin_extract_query_trgm(text, internal, smallint, internal, internal, internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gin_extract_query_trgm(text, internal, smallint, internal, internal, internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gin_extract_query_trgm(text, internal, smallint, internal, internal, internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gin_extract_query_trgm(text, internal, smallint, internal, internal, internal, internal) TO service_role;


--
-- TOC entry 5763 (class 0 OID 0)
-- Dependencies: 664
-- Name: FUNCTION gin_extract_value_trgm(text, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gin_extract_value_trgm(text, internal) TO postgres;
GRANT ALL ON FUNCTION public.gin_extract_value_trgm(text, internal) TO anon;
GRANT ALL ON FUNCTION public.gin_extract_value_trgm(text, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gin_extract_value_trgm(text, internal) TO service_role;


--
-- TOC entry 5764 (class 0 OID 0)
-- Dependencies: 531
-- Name: FUNCTION gin_trgm_consistent(internal, smallint, text, integer, internal, internal, internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gin_trgm_consistent(internal, smallint, text, integer, internal, internal, internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gin_trgm_consistent(internal, smallint, text, integer, internal, internal, internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gin_trgm_consistent(internal, smallint, text, integer, internal, internal, internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gin_trgm_consistent(internal, smallint, text, integer, internal, internal, internal, internal) TO service_role;


--
-- TOC entry 5765 (class 0 OID 0)
-- Dependencies: 491
-- Name: FUNCTION gin_trgm_triconsistent(internal, smallint, text, integer, internal, internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gin_trgm_triconsistent(internal, smallint, text, integer, internal, internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gin_trgm_triconsistent(internal, smallint, text, integer, internal, internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gin_trgm_triconsistent(internal, smallint, text, integer, internal, internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gin_trgm_triconsistent(internal, smallint, text, integer, internal, internal, internal) TO service_role;


--
-- TOC entry 5766 (class 0 OID 0)
-- Dependencies: 484
-- Name: FUNCTION gtrgm_compress(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gtrgm_compress(internal) TO postgres;
GRANT ALL ON FUNCTION public.gtrgm_compress(internal) TO anon;
GRANT ALL ON FUNCTION public.gtrgm_compress(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gtrgm_compress(internal) TO service_role;


--
-- TOC entry 5767 (class 0 OID 0)
-- Dependencies: 591
-- Name: FUNCTION gtrgm_consistent(internal, text, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gtrgm_consistent(internal, text, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gtrgm_consistent(internal, text, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gtrgm_consistent(internal, text, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gtrgm_consistent(internal, text, smallint, oid, internal) TO service_role;


--
-- TOC entry 5768 (class 0 OID 0)
-- Dependencies: 689
-- Name: FUNCTION gtrgm_decompress(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gtrgm_decompress(internal) TO postgres;
GRANT ALL ON FUNCTION public.gtrgm_decompress(internal) TO anon;
GRANT ALL ON FUNCTION public.gtrgm_decompress(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gtrgm_decompress(internal) TO service_role;


--
-- TOC entry 5769 (class 0 OID 0)
-- Dependencies: 556
-- Name: FUNCTION gtrgm_distance(internal, text, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gtrgm_distance(internal, text, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gtrgm_distance(internal, text, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gtrgm_distance(internal, text, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gtrgm_distance(internal, text, smallint, oid, internal) TO service_role;


--
-- TOC entry 5770 (class 0 OID 0)
-- Dependencies: 457
-- Name: FUNCTION gtrgm_options(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gtrgm_options(internal) TO postgres;
GRANT ALL ON FUNCTION public.gtrgm_options(internal) TO anon;
GRANT ALL ON FUNCTION public.gtrgm_options(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gtrgm_options(internal) TO service_role;


--
-- TOC entry 5771 (class 0 OID 0)
-- Dependencies: 628
-- Name: FUNCTION gtrgm_penalty(internal, internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gtrgm_penalty(internal, internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gtrgm_penalty(internal, internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gtrgm_penalty(internal, internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gtrgm_penalty(internal, internal, internal) TO service_role;


--
-- TOC entry 5772 (class 0 OID 0)
-- Dependencies: 690
-- Name: FUNCTION gtrgm_picksplit(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gtrgm_picksplit(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gtrgm_picksplit(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gtrgm_picksplit(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gtrgm_picksplit(internal, internal) TO service_role;


--
-- TOC entry 5773 (class 0 OID 0)
-- Dependencies: 466
-- Name: FUNCTION gtrgm_same(public.gtrgm, public.gtrgm, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gtrgm_same(public.gtrgm, public.gtrgm, internal) TO postgres;
GRANT ALL ON FUNCTION public.gtrgm_same(public.gtrgm, public.gtrgm, internal) TO anon;
GRANT ALL ON FUNCTION public.gtrgm_same(public.gtrgm, public.gtrgm, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gtrgm_same(public.gtrgm, public.gtrgm, internal) TO service_role;


--
-- TOC entry 5774 (class 0 OID 0)
-- Dependencies: 578
-- Name: FUNCTION gtrgm_union(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gtrgm_union(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gtrgm_union(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gtrgm_union(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gtrgm_union(internal, internal) TO service_role;


--
-- TOC entry 5775 (class 0 OID 0)
-- Dependencies: 468
-- Name: FUNCTION is_valid_tax_components(js jsonb); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.is_valid_tax_components(js jsonb) TO anon;
GRANT ALL ON FUNCTION public.is_valid_tax_components(js jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.is_valid_tax_components(js jsonb) TO service_role;


--
-- TOC entry 5776 (class 0 OID 0)
-- Dependencies: 595
-- Name: FUNCTION jwt_tenant_id(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.jwt_tenant_id() FROM PUBLIC;
GRANT ALL ON FUNCTION public.jwt_tenant_id() TO anon;
GRANT ALL ON FUNCTION public.jwt_tenant_id() TO authenticated;
GRANT ALL ON FUNCTION public.jwt_tenant_id() TO service_role;


--
-- TOC entry 5777 (class 0 OID 0)
-- Dependencies: 461
-- Name: FUNCTION jwt_tenant_id_uuid(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.jwt_tenant_id_uuid() TO anon;
GRANT ALL ON FUNCTION public.jwt_tenant_id_uuid() TO authenticated;
GRANT ALL ON FUNCTION public.jwt_tenant_id_uuid() TO service_role;


--
-- TOC entry 5778 (class 0 OID 0)
-- Dependencies: 648
-- Name: FUNCTION kaf_apply_policies(tablename text, has_id boolean); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.kaf_apply_policies(tablename text, has_id boolean) TO anon;
GRANT ALL ON FUNCTION public.kaf_apply_policies(tablename text, has_id boolean) TO authenticated;
GRANT ALL ON FUNCTION public.kaf_apply_policies(tablename text, has_id boolean) TO service_role;


--
-- TOC entry 5779 (class 0 OID 0)
-- Dependencies: 515
-- Name: FUNCTION kaf_apply_policies_col(tab regclass, tenant_col text, is_root boolean); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.kaf_apply_policies_col(tab regclass, tenant_col text, is_root boolean) TO anon;
GRANT ALL ON FUNCTION public.kaf_apply_policies_col(tab regclass, tenant_col text, is_root boolean) TO authenticated;
GRANT ALL ON FUNCTION public.kaf_apply_policies_col(tab regclass, tenant_col text, is_root boolean) TO service_role;


--
-- TOC entry 5780 (class 0 OID 0)
-- Dependencies: 633
-- Name: FUNCTION notify_zones_change(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.notify_zones_change() TO anon;
GRANT ALL ON FUNCTION public.notify_zones_change() TO authenticated;
GRANT ALL ON FUNCTION public.notify_zones_change() TO service_role;


--
-- TOC entry 5781 (class 0 OID 0)
-- Dependencies: 671
-- Name: FUNCTION notify_zones_delete(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.notify_zones_delete() TO anon;
GRANT ALL ON FUNCTION public.notify_zones_delete() TO authenticated;
GRANT ALL ON FUNCTION public.notify_zones_delete() TO service_role;


--
-- TOC entry 5782 (class 0 OID 0)
-- Dependencies: 492
-- Name: FUNCTION on_payment_succeeded(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.on_payment_succeeded() TO anon;
GRANT ALL ON FUNCTION public.on_payment_succeeded() TO authenticated;
GRANT ALL ON FUNCTION public.on_payment_succeeded() TO service_role;


--
-- TOC entry 5783 (class 0 OID 0)
-- Dependencies: 476
-- Name: FUNCTION order_items_enforce_tenant(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.order_items_enforce_tenant() TO anon;
GRANT ALL ON FUNCTION public.order_items_enforce_tenant() TO authenticated;
GRANT ALL ON FUNCTION public.order_items_enforce_tenant() TO service_role;


--
-- TOC entry 5784 (class 0 OID 0)
-- Dependencies: 557
-- Name: FUNCTION orders_fill_defaults(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.orders_fill_defaults() TO anon;
GRANT ALL ON FUNCTION public.orders_fill_defaults() TO authenticated;
GRANT ALL ON FUNCTION public.orders_fill_defaults() TO service_role;


--
-- TOC entry 5785 (class 0 OID 0)
-- Dependencies: 712
-- Name: FUNCTION protect_tenant_code(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.protect_tenant_code() TO anon;
GRANT ALL ON FUNCTION public.protect_tenant_code() TO authenticated;
GRANT ALL ON FUNCTION public.protect_tenant_code() TO service_role;


--
-- TOC entry 5786 (class 0 OID 0)
-- Dependencies: 699
-- Name: FUNCTION provision_trial_on_tenant_create(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.provision_trial_on_tenant_create() TO anon;
GRANT ALL ON FUNCTION public.provision_trial_on_tenant_create() TO authenticated;
GRANT ALL ON FUNCTION public.provision_trial_on_tenant_create() TO service_role;


--
-- TOC entry 5787 (class 0 OID 0)
-- Dependencies: 625
-- Name: FUNCTION release_expired_holds(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.release_expired_holds() TO anon;
GRANT ALL ON FUNCTION public.release_expired_holds() TO authenticated;
GRANT ALL ON FUNCTION public.release_expired_holds() TO service_role;


--
-- TOC entry 5788 (class 0 OID 0)
-- Dependencies: 592
-- Name: FUNCTION request_tenant_id(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.request_tenant_id() TO anon;
GRANT ALL ON FUNCTION public.request_tenant_id() TO authenticated;
GRANT ALL ON FUNCTION public.request_tenant_id() TO service_role;


--
-- TOC entry 5789 (class 0 OID 0)
-- Dependencies: 715
-- Name: FUNCTION reservation_tenant_matches_table(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.reservation_tenant_matches_table() TO anon;
GRANT ALL ON FUNCTION public.reservation_tenant_matches_table() TO authenticated;
GRANT ALL ON FUNCTION public.reservation_tenant_matches_table() TO service_role;


--
-- TOC entry 5790 (class 0 OID 0)
-- Dependencies: 486
-- Name: FUNCTION revenue_timeseries(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.revenue_timeseries() TO anon;
GRANT ALL ON FUNCTION public.revenue_timeseries() TO authenticated;
GRANT ALL ON FUNCTION public.revenue_timeseries() TO service_role;


--
-- TOC entry 5791 (class 0 OID 0)
-- Dependencies: 536
-- Name: FUNCTION revenue_timeseries(tenant_ids uuid[]); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.revenue_timeseries(tenant_ids uuid[]) TO anon;
GRANT ALL ON FUNCTION public.revenue_timeseries(tenant_ids uuid[]) TO authenticated;
GRANT ALL ON FUNCTION public.revenue_timeseries(tenant_ids uuid[]) TO service_role;


--
-- TOC entry 5792 (class 0 OID 0)
-- Dependencies: 596
-- Name: FUNCTION set_limit(real); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.set_limit(real) TO postgres;
GRANT ALL ON FUNCTION public.set_limit(real) TO anon;
GRANT ALL ON FUNCTION public.set_limit(real) TO authenticated;
GRANT ALL ON FUNCTION public.set_limit(real) TO service_role;


--
-- TOC entry 5793 (class 0 OID 0)
-- Dependencies: 547
-- Name: FUNCTION set_updated_at(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.set_updated_at() TO anon;
GRANT ALL ON FUNCTION public.set_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.set_updated_at() TO service_role;


--
-- TOC entry 5794 (class 0 OID 0)
-- Dependencies: 502
-- Name: FUNCTION set_zones_updated_at(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.set_zones_updated_at() TO anon;
GRANT ALL ON FUNCTION public.set_zones_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.set_zones_updated_at() TO service_role;


--
-- TOC entry 5795 (class 0 OID 0)
-- Dependencies: 616
-- Name: FUNCTION show_limit(); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.show_limit() TO postgres;
GRANT ALL ON FUNCTION public.show_limit() TO anon;
GRANT ALL ON FUNCTION public.show_limit() TO authenticated;
GRANT ALL ON FUNCTION public.show_limit() TO service_role;


--
-- TOC entry 5796 (class 0 OID 0)
-- Dependencies: 675
-- Name: FUNCTION show_trgm(text); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.show_trgm(text) TO postgres;
GRANT ALL ON FUNCTION public.show_trgm(text) TO anon;
GRANT ALL ON FUNCTION public.show_trgm(text) TO authenticated;
GRANT ALL ON FUNCTION public.show_trgm(text) TO service_role;


--
-- TOC entry 5797 (class 0 OID 0)
-- Dependencies: 623
-- Name: FUNCTION similarity(text, text); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.similarity(text, text) TO postgres;
GRANT ALL ON FUNCTION public.similarity(text, text) TO anon;
GRANT ALL ON FUNCTION public.similarity(text, text) TO authenticated;
GRANT ALL ON FUNCTION public.similarity(text, text) TO service_role;


--
-- TOC entry 5798 (class 0 OID 0)
-- Dependencies: 606
-- Name: FUNCTION similarity_dist(text, text); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.similarity_dist(text, text) TO postgres;
GRANT ALL ON FUNCTION public.similarity_dist(text, text) TO anon;
GRANT ALL ON FUNCTION public.similarity_dist(text, text) TO authenticated;
GRANT ALL ON FUNCTION public.similarity_dist(text, text) TO service_role;


--
-- TOC entry 5799 (class 0 OID 0)
-- Dependencies: 707
-- Name: FUNCTION similarity_op(text, text); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.similarity_op(text, text) TO postgres;
GRANT ALL ON FUNCTION public.similarity_op(text, text) TO anon;
GRANT ALL ON FUNCTION public.similarity_op(text, text) TO authenticated;
GRANT ALL ON FUNCTION public.similarity_op(text, text) TO service_role;


--
-- TOC entry 5800 (class 0 OID 0)
-- Dependencies: 541
-- Name: FUNCTION strict_word_similarity(text, text); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.strict_word_similarity(text, text) TO postgres;
GRANT ALL ON FUNCTION public.strict_word_similarity(text, text) TO anon;
GRANT ALL ON FUNCTION public.strict_word_similarity(text, text) TO authenticated;
GRANT ALL ON FUNCTION public.strict_word_similarity(text, text) TO service_role;


--
-- TOC entry 5801 (class 0 OID 0)
-- Dependencies: 618
-- Name: FUNCTION strict_word_similarity_commutator_op(text, text); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.strict_word_similarity_commutator_op(text, text) TO postgres;
GRANT ALL ON FUNCTION public.strict_word_similarity_commutator_op(text, text) TO anon;
GRANT ALL ON FUNCTION public.strict_word_similarity_commutator_op(text, text) TO authenticated;
GRANT ALL ON FUNCTION public.strict_word_similarity_commutator_op(text, text) TO service_role;


--
-- TOC entry 5802 (class 0 OID 0)
-- Dependencies: 706
-- Name: FUNCTION strict_word_similarity_dist_commutator_op(text, text); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.strict_word_similarity_dist_commutator_op(text, text) TO postgres;
GRANT ALL ON FUNCTION public.strict_word_similarity_dist_commutator_op(text, text) TO anon;
GRANT ALL ON FUNCTION public.strict_word_similarity_dist_commutator_op(text, text) TO authenticated;
GRANT ALL ON FUNCTION public.strict_word_similarity_dist_commutator_op(text, text) TO service_role;


--
-- TOC entry 5803 (class 0 OID 0)
-- Dependencies: 691
-- Name: FUNCTION strict_word_similarity_dist_op(text, text); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.strict_word_similarity_dist_op(text, text) TO postgres;
GRANT ALL ON FUNCTION public.strict_word_similarity_dist_op(text, text) TO anon;
GRANT ALL ON FUNCTION public.strict_word_similarity_dist_op(text, text) TO authenticated;
GRANT ALL ON FUNCTION public.strict_word_similarity_dist_op(text, text) TO service_role;


--
-- TOC entry 5804 (class 0 OID 0)
-- Dependencies: 632
-- Name: FUNCTION strict_word_similarity_op(text, text); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.strict_word_similarity_op(text, text) TO postgres;
GRANT ALL ON FUNCTION public.strict_word_similarity_op(text, text) TO anon;
GRANT ALL ON FUNCTION public.strict_word_similarity_op(text, text) TO authenticated;
GRANT ALL ON FUNCTION public.strict_word_similarity_op(text, text) TO service_role;


--
-- TOC entry 5805 (class 0 OID 0)
-- Dependencies: 585
-- Name: FUNCTION table_sessions_enforce_tenant(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.table_sessions_enforce_tenant() TO anon;
GRANT ALL ON FUNCTION public.table_sessions_enforce_tenant() TO authenticated;
GRANT ALL ON FUNCTION public.table_sessions_enforce_tenant() TO service_role;


--
-- TOC entry 5806 (class 0 OID 0)
-- Dependencies: 571
-- Name: FUNCTION tables_id_default(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.tables_id_default() TO anon;
GRANT ALL ON FUNCTION public.tables_id_default() TO authenticated;
GRANT ALL ON FUNCTION public.tables_id_default() TO service_role;


--
-- TOC entry 5807 (class 0 OID 0)
-- Dependencies: 481
-- Name: FUNCTION tg_set_updated_at(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.tg_set_updated_at() TO anon;
GRANT ALL ON FUNCTION public.tg_set_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.tg_set_updated_at() TO service_role;


--
-- TOC entry 5808 (class 0 OID 0)
-- Dependencies: 613
-- Name: FUNCTION touch_tm_settings(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.touch_tm_settings() TO anon;
GRANT ALL ON FUNCTION public.touch_tm_settings() TO authenticated;
GRANT ALL ON FUNCTION public.touch_tm_settings() TO service_role;


--
-- TOC entry 5809 (class 0 OID 0)
-- Dependencies: 460
-- Name: FUNCTION touch_updated_at(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.touch_updated_at() TO anon;
GRANT ALL ON FUNCTION public.touch_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.touch_updated_at() TO service_role;


--
-- TOC entry 5810 (class 0 OID 0)
-- Dependencies: 726
-- Name: FUNCTION update_updated_at_column(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_updated_at_column() TO anon;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO service_role;


--
-- TOC entry 5811 (class 0 OID 0)
-- Dependencies: 524
-- Name: FUNCTION word_similarity(text, text); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.word_similarity(text, text) TO postgres;
GRANT ALL ON FUNCTION public.word_similarity(text, text) TO anon;
GRANT ALL ON FUNCTION public.word_similarity(text, text) TO authenticated;
GRANT ALL ON FUNCTION public.word_similarity(text, text) TO service_role;


--
-- TOC entry 5812 (class 0 OID 0)
-- Dependencies: 554
-- Name: FUNCTION word_similarity_commutator_op(text, text); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.word_similarity_commutator_op(text, text) TO postgres;
GRANT ALL ON FUNCTION public.word_similarity_commutator_op(text, text) TO anon;
GRANT ALL ON FUNCTION public.word_similarity_commutator_op(text, text) TO authenticated;
GRANT ALL ON FUNCTION public.word_similarity_commutator_op(text, text) TO service_role;


--
-- TOC entry 5813 (class 0 OID 0)
-- Dependencies: 561
-- Name: FUNCTION word_similarity_dist_commutator_op(text, text); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.word_similarity_dist_commutator_op(text, text) TO postgres;
GRANT ALL ON FUNCTION public.word_similarity_dist_commutator_op(text, text) TO anon;
GRANT ALL ON FUNCTION public.word_similarity_dist_commutator_op(text, text) TO authenticated;
GRANT ALL ON FUNCTION public.word_similarity_dist_commutator_op(text, text) TO service_role;


--
-- TOC entry 5814 (class 0 OID 0)
-- Dependencies: 705
-- Name: FUNCTION word_similarity_dist_op(text, text); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.word_similarity_dist_op(text, text) TO postgres;
GRANT ALL ON FUNCTION public.word_similarity_dist_op(text, text) TO anon;
GRANT ALL ON FUNCTION public.word_similarity_dist_op(text, text) TO authenticated;
GRANT ALL ON FUNCTION public.word_similarity_dist_op(text, text) TO service_role;


--
-- TOC entry 5815 (class 0 OID 0)
-- Dependencies: 669
-- Name: FUNCTION word_similarity_op(text, text); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.word_similarity_op(text, text) TO postgres;
GRANT ALL ON FUNCTION public.word_similarity_op(text, text) TO anon;
GRANT ALL ON FUNCTION public.word_similarity_op(text, text) TO authenticated;
GRANT ALL ON FUNCTION public.word_similarity_op(text, text) TO service_role;


--
-- TOC entry 5816 (class 0 OID 0)
-- Dependencies: 528
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO supabase_realtime_admin;


--
-- TOC entry 5817 (class 0 OID 0)
-- Dependencies: 670
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- TOC entry 5818 (class 0 OID 0)
-- Dependencies: 548
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO supabase_realtime_admin;


--
-- TOC entry 5819 (class 0 OID 0)
-- Dependencies: 543
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO supabase_realtime_admin;


--
-- TOC entry 5820 (class 0 OID 0)
-- Dependencies: 454
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO supabase_realtime_admin;


--
-- TOC entry 5821 (class 0 OID 0)
-- Dependencies: 673
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO supabase_realtime_admin;


--
-- TOC entry 5822 (class 0 OID 0)
-- Dependencies: 665
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO supabase_realtime_admin;


--
-- TOC entry 5823 (class 0 OID 0)
-- Dependencies: 546
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO supabase_realtime_admin;


--
-- TOC entry 5824 (class 0 OID 0)
-- Dependencies: 641
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- TOC entry 5825 (class 0 OID 0)
-- Dependencies: 660
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO supabase_realtime_admin;


--
-- TOC entry 5826 (class 0 OID 0)
-- Dependencies: 588
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO supabase_realtime_admin;


--
-- TOC entry 5827 (class 0 OID 0)
-- Dependencies: 511
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- TOC entry 5828 (class 0 OID 0)
-- Dependencies: 607
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- TOC entry 5829 (class 0 OID 0)
-- Dependencies: 602
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- TOC entry 5830 (class 0 OID 0)
-- Dependencies: 581
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- TOC entry 5831 (class 0 OID 0)
-- Dependencies: 1702
-- Name: FUNCTION max(extensions.citext); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.max(extensions.citext) TO postgres;
GRANT ALL ON FUNCTION extensions.max(extensions.citext) TO anon;
GRANT ALL ON FUNCTION extensions.max(extensions.citext) TO authenticated;
GRANT ALL ON FUNCTION extensions.max(extensions.citext) TO service_role;


--
-- TOC entry 5832 (class 0 OID 0)
-- Dependencies: 1703
-- Name: FUNCTION min(extensions.citext); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.min(extensions.citext) TO postgres;
GRANT ALL ON FUNCTION extensions.min(extensions.citext) TO anon;
GRANT ALL ON FUNCTION extensions.min(extensions.citext) TO authenticated;
GRANT ALL ON FUNCTION extensions.min(extensions.citext) TO service_role;


--
-- TOC entry 5834 (class 0 OID 0)
-- Dependencies: 356
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- TOC entry 5836 (class 0 OID 0)
-- Dependencies: 372
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- TOC entry 5839 (class 0 OID 0)
-- Dependencies: 363
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- TOC entry 5841 (class 0 OID 0)
-- Dependencies: 355
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- TOC entry 5843 (class 0 OID 0)
-- Dependencies: 367
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- TOC entry 5845 (class 0 OID 0)
-- Dependencies: 366
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- TOC entry 5847 (class 0 OID 0)
-- Dependencies: 365
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- TOC entry 5848 (class 0 OID 0)
-- Dependencies: 428
-- Name: TABLE oauth_clients; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_clients TO postgres;
GRANT ALL ON TABLE auth.oauth_clients TO dashboard_user;


--
-- TOC entry 5849 (class 0 OID 0)
-- Dependencies: 373
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- TOC entry 5851 (class 0 OID 0)
-- Dependencies: 354
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- TOC entry 5853 (class 0 OID 0)
-- Dependencies: 353
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- TOC entry 5855 (class 0 OID 0)
-- Dependencies: 370
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- TOC entry 5857 (class 0 OID 0)
-- Dependencies: 371
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- TOC entry 5861 (class 0 OID 0)
-- Dependencies: 364
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- TOC entry 5863 (class 0 OID 0)
-- Dependencies: 369
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- TOC entry 5866 (class 0 OID 0)
-- Dependencies: 368
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- TOC entry 5869 (class 0 OID 0)
-- Dependencies: 352
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- TOC entry 5870 (class 0 OID 0)
-- Dependencies: 351
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements TO dashboard_user;


--
-- TOC entry 5871 (class 0 OID 0)
-- Dependencies: 350
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements_info FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO dashboard_user;


--
-- TOC entry 5872 (class 0 OID 0)
-- Dependencies: 410
-- Name: TABLE analytics_active_tables_now; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.analytics_active_tables_now TO anon;
GRANT ALL ON TABLE public.analytics_active_tables_now TO authenticated;
GRANT ALL ON TABLE public.analytics_active_tables_now TO service_role;


--
-- TOC entry 5873 (class 0 OID 0)
-- Dependencies: 424
-- Name: TABLE analytics_daily; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.analytics_daily TO anon;
GRANT ALL ON TABLE public.analytics_daily TO authenticated;
GRANT ALL ON TABLE public.analytics_daily TO service_role;


--
-- TOC entry 5874 (class 0 OID 0)
-- Dependencies: 389
-- Name: TABLE orders; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.orders TO anon;
GRANT ALL ON TABLE public.orders TO authenticated;
GRANT ALL ON TABLE public.orders TO service_role;


--
-- TOC entry 5875 (class 0 OID 0)
-- Dependencies: 391
-- Name: TABLE payments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payments TO anon;
GRANT ALL ON TABLE public.payments TO authenticated;
GRANT ALL ON TABLE public.payments TO service_role;


--
-- TOC entry 5876 (class 0 OID 0)
-- Dependencies: 409
-- Name: TABLE analytics_kpi_summary_7d; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.analytics_kpi_summary_7d TO anon;
GRANT ALL ON TABLE public.analytics_kpi_summary_7d TO authenticated;
GRANT ALL ON TABLE public.analytics_kpi_summary_7d TO service_role;


--
-- TOC entry 5877 (class 0 OID 0)
-- Dependencies: 408
-- Name: TABLE analytics_revenue_7d; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.analytics_revenue_7d TO anon;
GRANT ALL ON TABLE public.analytics_revenue_7d TO authenticated;
GRANT ALL ON TABLE public.analytics_revenue_7d TO service_role;


--
-- TOC entry 5878 (class 0 OID 0)
-- Dependencies: 395
-- Name: TABLE audit_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.audit_logs TO anon;
GRANT ALL ON TABLE public.audit_logs TO authenticated;
GRANT ALL ON TABLE public.audit_logs TO service_role;


--
-- TOC entry 5879 (class 0 OID 0)
-- Dependencies: 443
-- Name: TABLE billing_plans; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.billing_plans TO anon;
GRANT ALL ON TABLE public.billing_plans TO authenticated;
GRANT ALL ON TABLE public.billing_plans TO service_role;


--
-- TOC entry 5880 (class 0 OID 0)
-- Dependencies: 441
-- Name: TABLE billing_webhooks; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.billing_webhooks TO anon;
GRANT ALL ON TABLE public.billing_webhooks TO authenticated;
GRANT ALL ON TABLE public.billing_webhooks TO service_role;


--
-- TOC entry 5881 (class 0 OID 0)
-- Dependencies: 421
-- Name: TABLE cart_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.cart_items TO anon;
GRANT ALL ON TABLE public.cart_items TO authenticated;
GRANT ALL ON TABLE public.cart_items TO service_role;


--
-- TOC entry 5882 (class 0 OID 0)
-- Dependencies: 420
-- Name: TABLE cart_sessions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.cart_sessions TO anon;
GRANT ALL ON TABLE public.cart_sessions TO authenticated;
GRANT ALL ON TABLE public.cart_sessions TO service_role;


--
-- TOC entry 5883 (class 0 OID 0)
-- Dependencies: 432
-- Name: TABLE carts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.carts TO anon;
GRANT ALL ON TABLE public.carts TO authenticated;
GRANT ALL ON TABLE public.carts TO service_role;


--
-- TOC entry 5884 (class 0 OID 0)
-- Dependencies: 386
-- Name: TABLE categories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.categories TO anon;
GRANT ALL ON TABLE public.categories TO authenticated;
GRANT ALL ON TABLE public.categories TO service_role;


--
-- TOC entry 5885 (class 0 OID 0)
-- Dependencies: 388
-- Name: TABLE customers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.customers TO anon;
GRANT ALL ON TABLE public.customers TO authenticated;
GRANT ALL ON TABLE public.customers TO service_role;


--
-- TOC entry 5886 (class 0 OID 0)
-- Dependencies: 405
-- Name: TABLE customization; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.customization TO anon;
GRANT ALL ON TABLE public.customization TO authenticated;
GRANT ALL ON TABLE public.customization TO service_role;


--
-- TOC entry 5887 (class 0 OID 0)
-- Dependencies: 396
-- Name: TABLE daily_sales_summary; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.daily_sales_summary TO anon;
GRANT ALL ON TABLE public.daily_sales_summary TO authenticated;
GRANT ALL ON TABLE public.daily_sales_summary TO service_role;


--
-- TOC entry 5888 (class 0 OID 0)
-- Dependencies: 406
-- Name: TABLE domain_events; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.domain_events TO anon;
GRANT ALL ON TABLE public.domain_events TO authenticated;
GRANT ALL ON TABLE public.domain_events TO service_role;


--
-- TOC entry 5889 (class 0 OID 0)
-- Dependencies: 392
-- Name: TABLE inventory_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.inventory_items TO anon;
GRANT ALL ON TABLE public.inventory_items TO authenticated;
GRANT ALL ON TABLE public.inventory_items TO service_role;


--
-- TOC entry 5890 (class 0 OID 0)
-- Dependencies: 427
-- Name: TABLE invitations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.invitations TO anon;
GRANT ALL ON TABLE public.invitations TO authenticated;
GRANT ALL ON TABLE public.invitations TO service_role;


--
-- TOC entry 5891 (class 0 OID 0)
-- Dependencies: 402
-- Name: TABLE locations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.locations TO anon;
GRANT ALL ON TABLE public.locations TO authenticated;
GRANT ALL ON TABLE public.locations TO service_role;


--
-- TOC entry 5892 (class 0 OID 0)
-- Dependencies: 404
-- Name: TABLE menu_categories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.menu_categories TO anon;
GRANT ALL ON TABLE public.menu_categories TO authenticated;
GRANT ALL ON TABLE public.menu_categories TO service_role;


--
-- TOC entry 5893 (class 0 OID 0)
-- Dependencies: 387
-- Name: TABLE menu_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.menu_items TO anon;
GRANT ALL ON TABLE public.menu_items TO authenticated;
GRANT ALL ON TABLE public.menu_items TO service_role;


--
-- TOC entry 5894 (class 0 OID 0)
-- Dependencies: 431
-- Name: TABLE menu_sections; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.menu_sections TO anon;
GRANT ALL ON TABLE public.menu_sections TO authenticated;
GRANT ALL ON TABLE public.menu_sections TO service_role;


--
-- TOC entry 5895 (class 0 OID 0)
-- Dependencies: 394
-- Name: TABLE notifications; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.notifications TO anon;
GRANT ALL ON TABLE public.notifications TO authenticated;
GRANT ALL ON TABLE public.notifications TO service_role;


--
-- TOC entry 5896 (class 0 OID 0)
-- Dependencies: 390
-- Name: TABLE order_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.order_items TO anon;
GRANT ALL ON TABLE public.order_items TO authenticated;
GRANT ALL ON TABLE public.order_items TO service_role;


--
-- TOC entry 5897 (class 0 OID 0)
-- Dependencies: 418
-- Name: TABLE payment_events; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payment_events TO anon;
GRANT ALL ON TABLE public.payment_events TO authenticated;
GRANT ALL ON TABLE public.payment_events TO service_role;


--
-- TOC entry 5898 (class 0 OID 0)
-- Dependencies: 417
-- Name: TABLE payment_intents; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payment_intents TO anon;
GRANT ALL ON TABLE public.payment_intents TO authenticated;
GRANT ALL ON TABLE public.payment_intents TO service_role;


--
-- TOC entry 5899 (class 0 OID 0)
-- Dependencies: 416
-- Name: TABLE payment_providers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payment_providers TO anon;
GRANT ALL ON TABLE public.payment_providers TO authenticated;
GRANT ALL ON TABLE public.payment_providers TO service_role;


--
-- TOC entry 5900 (class 0 OID 0)
-- Dependencies: 412
-- Name: TABLE payment_refunds; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payment_refunds TO anon;
GRANT ALL ON TABLE public.payment_refunds TO authenticated;
GRANT ALL ON TABLE public.payment_refunds TO service_role;


--
-- TOC entry 5901 (class 0 OID 0)
-- Dependencies: 413
-- Name: TABLE payment_splits; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payment_splits TO anon;
GRANT ALL ON TABLE public.payment_splits TO authenticated;
GRANT ALL ON TABLE public.payment_splits TO service_role;


--
-- TOC entry 5902 (class 0 OID 0)
-- Dependencies: 415
-- Name: TABLE printer_configs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.printer_configs TO anon;
GRANT ALL ON TABLE public.printer_configs TO authenticated;
GRANT ALL ON TABLE public.printer_configs TO service_role;


--
-- TOC entry 5903 (class 0 OID 0)
-- Dependencies: 419
-- Name: TABLE qr_scans; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.qr_scans TO anon;
GRANT ALL ON TABLE public.qr_scans TO authenticated;
GRANT ALL ON TABLE public.qr_scans TO service_role;


--
-- TOC entry 5904 (class 0 OID 0)
-- Dependencies: 414
-- Name: TABLE receipt_deliveries; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.receipt_deliveries TO anon;
GRANT ALL ON TABLE public.receipt_deliveries TO authenticated;
GRANT ALL ON TABLE public.receipt_deliveries TO service_role;


--
-- TOC entry 5905 (class 0 OID 0)
-- Dependencies: 429
-- Name: TABLE reservations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.reservations TO anon;
GRANT ALL ON TABLE public.reservations TO authenticated;
GRANT ALL ON TABLE public.reservations TO service_role;


--
-- TOC entry 5906 (class 0 OID 0)
-- Dependencies: 450
-- Name: TABLE restaurant_tables_backup; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.restaurant_tables_backup TO anon;
GRANT ALL ON TABLE public.restaurant_tables_backup TO authenticated;
GRANT ALL ON TABLE public.restaurant_tables_backup TO service_role;


--
-- TOC entry 5907 (class 0 OID 0)
-- Dependencies: 401
-- Name: TABLE staff; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.staff TO anon;
GRANT ALL ON TABLE public.staff TO authenticated;
GRANT ALL ON TABLE public.staff TO service_role;


--
-- TOC entry 5908 (class 0 OID 0)
-- Dependencies: 393
-- Name: TABLE staff_schedules; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.staff_schedules TO anon;
GRANT ALL ON TABLE public.staff_schedules TO authenticated;
GRANT ALL ON TABLE public.staff_schedules TO service_role;


--
-- TOC entry 5909 (class 0 OID 0)
-- Dependencies: 440
-- Name: TABLE subscription_events; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.subscription_events TO anon;
GRANT ALL ON TABLE public.subscription_events TO authenticated;
GRANT ALL ON TABLE public.subscription_events TO service_role;


--
-- TOC entry 5910 (class 0 OID 0)
-- Dependencies: 438
-- Name: TABLE subscription_plans; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.subscription_plans TO anon;
GRANT ALL ON TABLE public.subscription_plans TO authenticated;
GRANT ALL ON TABLE public.subscription_plans TO service_role;


--
-- TOC entry 5911 (class 0 OID 0)
-- Dependencies: 400
-- Name: TABLE table_sessions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.table_sessions TO anon;
GRANT ALL ON TABLE public.table_sessions TO authenticated;
GRANT ALL ON TABLE public.table_sessions TO service_role;


--
-- TOC entry 5912 (class 0 OID 0)
-- Dependencies: 437
-- Name: TABLE tenant_subscriptions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tenant_subscriptions TO anon;
GRANT ALL ON TABLE public.tenant_subscriptions TO authenticated;
GRANT ALL ON TABLE public.tenant_subscriptions TO service_role;


--
-- TOC entry 5913 (class 0 OID 0)
-- Dependencies: 442
-- Name: TABLE tenant_active_subscription_v; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tenant_active_subscription_v TO anon;
GRANT ALL ON TABLE public.tenant_active_subscription_v TO authenticated;
GRANT ALL ON TABLE public.tenant_active_subscription_v TO service_role;


--
-- TOC entry 5914 (class 0 OID 0)
-- Dependencies: 439
-- Name: TABLE tenant_entitlements; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tenant_entitlements TO anon;
GRANT ALL ON TABLE public.tenant_entitlements TO authenticated;
GRANT ALL ON TABLE public.tenant_entitlements TO service_role;


--
-- TOC entry 5915 (class 0 OID 0)
-- Dependencies: 434
-- Name: TABLE tenant_settings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tenant_settings TO anon;
GRANT ALL ON TABLE public.tenant_settings TO authenticated;
GRANT ALL ON TABLE public.tenant_settings TO service_role;


--
-- TOC entry 5916 (class 0 OID 0)
-- Dependencies: 433
-- Name: TABLE tenant_tax_config; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tenant_tax_config TO anon;
GRANT ALL ON TABLE public.tenant_tax_config TO authenticated;
GRANT ALL ON TABLE public.tenant_tax_config TO service_role;


--
-- TOC entry 5917 (class 0 OID 0)
-- Dependencies: 384
-- Name: TABLE tenants; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tenants TO anon;
GRANT ALL ON TABLE public.tenants TO authenticated;
GRANT ALL ON TABLE public.tenants TO service_role;


--
-- TOC entry 5918 (class 0 OID 0)
-- Dependencies: 430
-- Name: TABLE tm_settings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tm_settings TO anon;
GRANT ALL ON TABLE public.tm_settings TO authenticated;
GRANT ALL ON TABLE public.tm_settings TO service_role;


--
-- TOC entry 5919 (class 0 OID 0)
-- Dependencies: 385
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;


--
-- TOC entry 5920 (class 0 OID 0)
-- Dependencies: 425
-- Name: TABLE v_analytics_daily_secure; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.v_analytics_daily_secure TO anon;
GRANT ALL ON TABLE public.v_analytics_daily_secure TO authenticated;
GRANT ALL ON TABLE public.v_analytics_daily_secure TO service_role;


--
-- TOC entry 5921 (class 0 OID 0)
-- Dependencies: 407
-- Name: TABLE v_current_staff; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.v_current_staff TO anon;
GRANT ALL ON TABLE public.v_current_staff TO authenticated;
GRANT ALL ON TABLE public.v_current_staff TO service_role;


--
-- TOC entry 5922 (class 0 OID 0)
-- Dependencies: 422
-- Name: TABLE v_orders_latest_status; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.v_orders_latest_status TO anon;
GRANT ALL ON TABLE public.v_orders_latest_status TO authenticated;
GRANT ALL ON TABLE public.v_orders_latest_status TO service_role;


--
-- TOC entry 5923 (class 0 OID 0)
-- Dependencies: 423
-- Name: TABLE v_kds_lane_counts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.v_kds_lane_counts TO anon;
GRANT ALL ON TABLE public.v_kds_lane_counts TO authenticated;
GRANT ALL ON TABLE public.v_kds_lane_counts TO service_role;


--
-- TOC entry 5924 (class 0 OID 0)
-- Dependencies: 426
-- Name: TABLE v_payment_events_amounts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.v_payment_events_amounts TO anon;
GRANT ALL ON TABLE public.v_payment_events_amounts TO authenticated;
GRANT ALL ON TABLE public.v_payment_events_amounts TO service_role;


--
-- TOC entry 5925 (class 0 OID 0)
-- Dependencies: 436
-- Name: TABLE v_tenant_tax_effective; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.v_tenant_tax_effective TO anon;
GRANT ALL ON TABLE public.v_tenant_tax_effective TO authenticated;
GRANT ALL ON TABLE public.v_tenant_tax_effective TO service_role;


--
-- TOC entry 5926 (class 0 OID 0)
-- Dependencies: 452
-- Name: TABLE zones; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.zones TO anon;
GRANT ALL ON TABLE public.zones TO authenticated;
GRANT ALL ON TABLE public.zones TO service_role;


--
-- TOC entry 5927 (class 0 OID 0)
-- Dependencies: 382
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- TOC entry 5928 (class 0 OID 0)
-- Dependencies: 444
-- Name: TABLE messages_2025_09_28; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_09_28 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_09_28 TO dashboard_user;


--
-- TOC entry 5929 (class 0 OID 0)
-- Dependencies: 445
-- Name: TABLE messages_2025_09_29; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_09_29 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_09_29 TO dashboard_user;


--
-- TOC entry 5930 (class 0 OID 0)
-- Dependencies: 446
-- Name: TABLE messages_2025_09_30; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_09_30 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_09_30 TO dashboard_user;


--
-- TOC entry 5931 (class 0 OID 0)
-- Dependencies: 447
-- Name: TABLE messages_2025_10_01; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_10_01 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_10_01 TO dashboard_user;


--
-- TOC entry 5932 (class 0 OID 0)
-- Dependencies: 448
-- Name: TABLE messages_2025_10_02; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_10_02 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_10_02 TO dashboard_user;


--
-- TOC entry 5933 (class 0 OID 0)
-- Dependencies: 449
-- Name: TABLE messages_2025_10_03; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_10_03 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_10_03 TO dashboard_user;


--
-- TOC entry 5934 (class 0 OID 0)
-- Dependencies: 451
-- Name: TABLE messages_2025_10_04; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_10_04 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_10_04 TO dashboard_user;


--
-- TOC entry 5935 (class 0 OID 0)
-- Dependencies: 453
-- Name: TABLE messages_2025_10_05; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_10_05 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_10_05 TO dashboard_user;


--
-- TOC entry 5936 (class 0 OID 0)
-- Dependencies: 376
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
GRANT SELECT ON TABLE realtime.schema_migrations TO anon;
GRANT SELECT ON TABLE realtime.schema_migrations TO authenticated;
GRANT SELECT ON TABLE realtime.schema_migrations TO service_role;
GRANT ALL ON TABLE realtime.schema_migrations TO supabase_realtime_admin;


--
-- TOC entry 5937 (class 0 OID 0)
-- Dependencies: 379
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;
GRANT ALL ON TABLE realtime.subscription TO supabase_realtime_admin;


--
-- TOC entry 5938 (class 0 OID 0)
-- Dependencies: 378
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO supabase_realtime_admin;


--
-- TOC entry 5940 (class 0 OID 0)
-- Dependencies: 358
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;


--
-- TOC entry 5941 (class 0 OID 0)
-- Dependencies: 398
-- Name: TABLE buckets_analytics; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets_analytics TO service_role;
GRANT ALL ON TABLE storage.buckets_analytics TO authenticated;
GRANT ALL ON TABLE storage.buckets_analytics TO anon;


--
-- TOC entry 5943 (class 0 OID 0)
-- Dependencies: 359
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;


--
-- TOC entry 5944 (class 0 OID 0)
-- Dependencies: 397
-- Name: TABLE prefixes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.prefixes TO service_role;
GRANT ALL ON TABLE storage.prefixes TO authenticated;
GRANT ALL ON TABLE storage.prefixes TO anon;


--
-- TOC entry 5945 (class 0 OID 0)
-- Dependencies: 374
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- TOC entry 5946 (class 0 OID 0)
-- Dependencies: 375
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- TOC entry 5947 (class 0 OID 0)
-- Dependencies: 361
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- TOC entry 5948 (class 0 OID 0)
-- Dependencies: 362
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- TOC entry 2943 (class 826 OID 17835)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- TOC entry 2944 (class 826 OID 17836)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- TOC entry 2945 (class 826 OID 17837)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- TOC entry 2946 (class 826 OID 17838)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- TOC entry 2947 (class 826 OID 17839)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- TOC entry 2948 (class 826 OID 17840)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- TOC entry 2951 (class 826 OID 17841)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2950 (class 826 OID 17842)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2949 (class 826 OID 17843)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 2952 (class 826 OID 17844)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2953 (class 826 OID 17845)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2954 (class 826 OID 17846)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 2955 (class 826 OID 17847)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2956 (class 826 OID 17848)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2957 (class 826 OID 17849)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2958 (class 826 OID 17850)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2959 (class 826 OID 17851)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 2960 (class 826 OID 17852)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 2961 (class 826 OID 17853)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- TOC entry 2962 (class 826 OID 17854)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- TOC entry 2963 (class 826 OID 17855)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- TOC entry 2964 (class 826 OID 17856)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2965 (class 826 OID 17857)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2966 (class 826 OID 17858)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 4141 (class 3466 OID 17859)
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- TOC entry 4142 (class 3466 OID 17860)
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- TOC entry 4143 (class 3466 OID 17861)
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- TOC entry 4144 (class 3466 OID 17862)
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- TOC entry 4145 (class 3466 OID 17863)
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- TOC entry 4146 (class 3466 OID 17864)
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

-- Completed on 2025-10-02 16:19:30 AEST

--
-- PostgreSQL database dump complete
--

