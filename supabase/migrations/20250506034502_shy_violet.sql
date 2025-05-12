/*
  # Fix RLS policies for consents table

  1. Security Changes
     - Drop the existing RLS policy for anonymous inserts
     - Create a new policy that allows anonymous users to insert into consents table without restrictions
     - Ensure authenticated users retain full CRUD access

  This migration addresses the 401 error when submitting consent forms by fixing
  the row-level security policy that was preventing anonymous users from inserting
  new records into the consents table.
*/

-- First, drop the existing policy that might be causing issues
DROP POLICY IF EXISTS "Allow public insert consents" ON public.consents;

-- Create a new policy that allows anonymous users to insert without restrictions
CREATE POLICY "Allow public insert consents" 
ON public.consents
FOR INSERT
TO anon
WITH CHECK (true);

-- Verify that the authenticated users policy exists and is correct
DROP POLICY IF EXISTS "Allow authenticated CRUD consents" ON public.consents;
CREATE POLICY "Allow authenticated CRUD consents" 
ON public.consents
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);