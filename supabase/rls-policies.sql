-- Run this in Supabase SQL Editor

-- 1) Enable RLS on the relevant tables if it is not already enabled
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

-- 2) Allow anonymous users to read active plans and related public data
DROP POLICY IF EXISTS "public_read_active_subscription_plans" ON public.subscription_plans;
CREATE POLICY "public_read_active_subscription_plans"
ON public.subscription_plans
FOR SELECT
TO anon, authenticated
USING (is_active = true);

DROP POLICY IF EXISTS "public_read_plan_units" ON public.plan_units;
CREATE POLICY "public_read_plan_units"
ON public.plan_units
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "public_read_units" ON public.units;
CREATE POLICY "public_read_units"
ON public.units
FOR SELECT
TO anon, authenticated
USING (true);

-- 3) Allow admins to manage plans and their units
DROP POLICY IF EXISTS "admins_manage_subscription_plans" ON public.subscription_plans;
CREATE POLICY "admins_manage_subscription_plans"
ON public.subscription_plans
FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

DROP POLICY IF EXISTS "admins_manage_plan_units" ON public.plan_units;
CREATE POLICY "admins_manage_plan_units"
ON public.plan_units
FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- 4) Optional: allow admins to manage units too if you add/edit units from admin panel
DROP POLICY IF EXISTS "admins_manage_units" ON public.units;
CREATE POLICY "admins_manage_units"
ON public.units
FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);
