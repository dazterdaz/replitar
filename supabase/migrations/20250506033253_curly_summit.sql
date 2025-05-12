/*
  # Add anonymous insert policy for consents table
  
  1. Security
     - Add policy to allow anonymous users to insert new records into the consents table
     - This allows public users to submit consent forms without authentication
*/

-- Add policy to allow anonymous users to insert records into the consents table
CREATE POLICY "Allow public insert consents" 
ON public.consents
FOR INSERT 
TO anon
WITH CHECK (true);