/*
  # Fix consents table RLS policies
  
  1. Changes
     - Drop and recreate RLS policies for the consents table to fix insertion issues
     - Ensure anonymous users can properly insert new consents 
     - Maintain existing policies for authenticated users
  
  2. Security
     - Maintain RLS enabled on the consents table
     - Ensure proper permissions for both anonymous and authenticated users
*/

-- Remove existing policies that might be causing the issue
DROP POLICY IF EXISTS "Allow public insert consents" ON public.consents;
DROP POLICY IF EXISTS "Allow authenticated CRUD consents" ON public.consents;

-- Recreate policies with proper security rules
-- Policy for anonymous users to insert new consents
CREATE POLICY "Allow public insert consents" 
ON public.consents 
FOR INSERT 
TO anon
WITH CHECK (true);

-- Policy for authenticated users to perform all operations
CREATE POLICY "Allow authenticated CRUD consents" 
ON public.consents 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;