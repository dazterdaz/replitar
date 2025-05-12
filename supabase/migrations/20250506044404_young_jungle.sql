/*
  # Actualizar políticas RLS para corregir problemas de inserción
  
  1. Cambios
     - Eliminar y recrear políticas RLS para las tablas principales del sistema
     - Asegurar que todos los usuarios tengan los permisos correctos para operaciones CRUD
  
  2. Seguridad
     - Mantener protección de datos mientras se permite la operación correcta del sistema
     - Habilitar política específica para lecturas anónimas en consents
*/

-- Asegurarse que RLS está habilitado para todas las tablas relevantes
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_health_answers ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas existentes 
DROP POLICY IF EXISTS "Allow anon insert consents" ON consents;
DROP POLICY IF EXISTS "Allow authenticated CRUD consents" ON consents;
DROP POLICY IF EXISTS "Allow anon read consents" ON consents;
DROP POLICY IF EXISTS "Allow anon insert consent_health_answers" ON consent_health_answers;
DROP POLICY IF EXISTS "Allow authenticated CRUD consent_health_answers" ON consent_health_answers;

-- Políticas para la tabla consents
-- Inserción para usuarios anónimos
CREATE POLICY "Allow anon insert consents"
ON consents
FOR INSERT
TO anon
WITH CHECK (true);

-- Lectura para usuarios anónimos
CREATE POLICY "Allow anon read consents"
ON consents
FOR SELECT
TO anon
USING (true);

-- CRUD completo para usuarios autenticados
CREATE POLICY "Allow authenticated CRUD consents"
ON consents
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Políticas para la tabla consent_health_answers
-- Inserción para usuarios anónimos
CREATE POLICY "Allow anon insert consent_health_answers"
ON consent_health_answers
FOR INSERT
TO anon
WITH CHECK (true);

-- CRUD completo para usuarios autenticados
CREATE POLICY "Allow authenticated CRUD consent_health_answers"
ON consent_health_answers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Otorgar permisos necesarios a roles
GRANT ALL ON consents TO anon, authenticated;
GRANT ALL ON consent_health_answers TO anon, authenticated;