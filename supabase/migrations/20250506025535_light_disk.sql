/*
  # Fix health_questions table RLS policies

  1. Security Changes
    - Drop existing policies on the health_questions table
    - Recreate policies to ensure authenticated users can perform all operations
    - These policies will allow authenticated users to insert, select, update, and delete records
*/

-- Drop existing policies to recreate them with proper permissions
DROP POLICY IF EXISTS "Allow authenticated users to delete health_questions" ON public.health_questions;
DROP POLICY IF EXISTS "Allow authenticated users to insert health_questions" ON public.health_questions;
DROP POLICY IF EXISTS "Allow authenticated users to select health_questions" ON public.health_questions;
DROP POLICY IF EXISTS "Allow authenticated users to update health_questions" ON public.health_questions;

-- Recreate policies with properly defined conditions
CREATE POLICY "Allow authenticated users to select health_questions"
ON public.health_questions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert health_questions"
ON public.health_questions
FOR INSERT
TO authenticated
WITH CHECK (true);

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