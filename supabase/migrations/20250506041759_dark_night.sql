/*
  # Fix RLS policies for consents table
  
  1. Changes
     - Drop existing RLS policies for consents table
     - Create new policies for anonymous and authenticated users
     - Ensure proper security settings while allowing form submissions
  
  2. Security
     - Allow anonymous users to insert new consent records
     - Allow authenticated users full CRUD access to consent records
*/

-- First, ensure RLS is enabled on the consents table
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow anon insert consents" ON public.consents;
DROP POLICY IF EXISTS "Allow authenticated CRUD consents" ON public.consents;

-- Create policy for anonymous users to insert new consents
CREATE POLICY "Allow anon insert consents"
ON public.consents
FOR INSERT
TO anon
WITH CHECK (true);

-- Create policy for authenticated users to perform all operations
CREATE POLICY "Allow authenticated CRUD consents"
ON public.consents
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);