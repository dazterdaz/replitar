/*
  # Fix RLS policies for consents table

  1. Policy Changes
    - Modify the anonymous user insert policy for the consents table
    - Ensure that proper permissions are set for inserting new consent records
  
  The error "new row violates row-level security policy for table "consents"" indicates
  that the current policies are preventing anonymous users from inserting records
  despite having a policy that should allow it.
*/

-- First, let's drop the existing anon insert policy
DROP POLICY IF EXISTS "Allow public insert consents" ON public.consents;

-- Create a new, more explicitly defined policy for anonymous inserts
CREATE POLICY "Allow anon insert consents" 
ON public.consents
FOR INSERT 
TO anon
WITH CHECK (true);

-- Ensure the authenticated policy is properly set
DROP POLICY IF EXISTS "Allow authenticated CRUD consents" ON public.consents;

CREATE POLICY "Allow authenticated CRUD consents"
ON public.consents
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);