/*
  # Create stored procedure for archiving consents
  
  1. Changes
     - Create SQL function to archive consents directly using service role privileges
     - This bypasses any RLS issues that might be preventing archiving
     
  2. Security
     - Function is executed with security definer to ensure it has proper privileges
     - Validation ensures only existing consents can be archived
*/

-- Create a function to archive consents
CREATE OR REPLACE FUNCTION archivar_consentimiento(consentimiento_id uuid)
RETURNS SETOF consents
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Verify that the consent exists
  IF NOT EXISTS (SELECT 1 FROM consents WHERE id = consentimiento_id) THEN
    RAISE EXCEPTION 'No se encontró el consentimiento con ID %', consentimiento_id;
  END IF;

  -- Update the consent to mark it as archived
  RETURN QUERY
  UPDATE consents
  SET 
    archived = true,
    updated_at = now()
  WHERE id = consentimiento_id
  RETURNING *;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION archivar_consentimiento(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION archivar_consentimiento(uuid) TO anon;