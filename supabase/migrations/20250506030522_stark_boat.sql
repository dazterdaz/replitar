/*
  # Fix RLS policies for health_questions table
  
  1. Changes
     - Drop existing RLS policies for health_questions table
     - Recreate proper INSERT policy for authenticated users
     - Recreate proper SELECT, UPDATE, and DELETE policies for authenticated users
  
  2. Security
     - Ensures authenticated users can properly insert new health questions
     - Maintains consistent security across all operations on the health_questions table
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to insert health_questions" ON public.health_questions;
DROP POLICY IF EXISTS "Allow authenticated users to select health_questions" ON public.health_questions;
DROP POLICY IF EXISTS "Allow authenticated users to update health_questions" ON public.health_questions;
DROP POLICY IF EXISTS "Allow authenticated users to delete health_questions" ON public.health_questions;

-- Recreate policies with proper configuration
CREATE POLICY "Allow authenticated users to insert health_questions"
ON public.health_questions
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to select health_questions"
ON public.health_questions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to update health_questions"
ON public.health_questions
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete health_questions"
ON public.health_questions
FOR DELETE
TO authenticated
USING (true);