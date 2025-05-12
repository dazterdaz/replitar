/*
  # Corregir funcionalidad de archivado de consentimientos
  
  1. Cambios
    - Asegurar que la columna 'archived' en la tabla 'consents' tenga valor por defecto false
    - Añadir índice para búsquedas más rápidas por estado de archivo
    - Asegurar que RLS está configurado correctamente para operaciones de actualización

  2. Seguridad
    - Mantener políticas RLS existentes para autenticados y anónimos
    - Garantizar que los usuarios autenticados puedan actualizar registros
*/

-- Asegurarse de que la columna archived tiene valor por defecto false
ALTER TABLE public.consents 
  ALTER COLUMN archived SET DEFAULT false;

-- Añadir índice para búsquedas por estado de archivo
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'consents_archived_idx'
  ) THEN
    CREATE INDEX consents_archived_idx ON public.consents(archived);
  END IF;
END $$;

-- Asegurarse que RLS está habilitado
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;

-- Eliminar y recrear políticas de actualización para usuarios autenticados
DROP POLICY IF EXISTS "Allow authenticated CRUD consents" ON public.consents;

-- Crear política específica para cada operación para mayor claridad
CREATE POLICY "Allow authenticated select consents"
ON public.consents
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated insert consents"
ON public.consents
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update consents"
ON public.consents
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated delete consents"
ON public.consents
FOR DELETE
TO authenticated
USING (true);

-- Asegurar que la columna updated_at se actualiza correctamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Verificar si el trigger existe y recrearlo si es necesario
DROP TRIGGER IF EXISTS update_consents_updated_at ON public.consents;
CREATE TRIGGER update_consents_updated_at
BEFORE UPDATE ON public.consents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Otorgar permisos explícitos para mayor seguridad
GRANT ALL ON public.consents TO authenticated;
GRANT SELECT, INSERT ON public.consents TO anon;