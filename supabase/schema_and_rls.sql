-- Supabase setup for FFMA
-- 1. Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Configure app_user role (assuming Django connects using this)
-- Replace 'app_user' with the actual connection user
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'app_user') THEN
      CREATE ROLE app_user LOGIN PASSWORD 'password';
   END IF;
END
$do$;

GRANT ALL PRIVILEGES ON DATABASE postgres TO app_user;

-- 3. Make AuditLog table append-only
-- This assumes Django has migrated the tables. The table name for SystemAuditLog is core_systemauditlog.
-- Run this AFTER Django migrations.
REVOKE UPDATE, DELETE ON TABLE public.core_systemauditlog FROM app_user;

-- Similarly for StageChangeLog
REVOKE UPDATE, DELETE ON TABLE public.core_stagechangelog FROM app_user;

-- Similarly for ActivityLog (Visits/Calls)
REVOKE UPDATE, DELETE ON TABLE public.core_activitylog FROM app_user;

-- 4. Enable Row Level Security (RLS) policies
-- Note: Django's ORM typically bypasses RLS if it connects as a superuser.
-- For production environments where the API connects via Supabase REST API (PostgREST), you would apply RLS directly.
-- Since we use Django DRF for APIs (auth handled at the API layer), Postgres RLS acts as a defense-in-depth measure.

-- Enable RLS on Farmer Master
ALTER TABLE public.core_farmer ENABLE ROW LEVEL SECURITY;

-- If connecting via Supabase API (assuming JWT claims are mapped):
-- CREATE POLICY "Field Staff can view own farmers" ON public.core_farmer
--     FOR SELECT USING (assigned_staff_id = uuid(current_setting('request.jwt.claim.sub')));
    
-- Note: Because we use Django for the backend (Module 1, 2, 3 details Django Auth and DRF),
-- we will enforce RBAC at the Django API Layer. RLS is mostly for Supabase Data API constraints.
