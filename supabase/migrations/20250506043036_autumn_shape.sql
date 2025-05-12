/*
  # Actualizar políticas RLS para permitir inserción por usuarios anónimos
  
  1. Cambios
     - Recrear políticas para la tabla consents asegurando que los usuarios anónimos puedan insertar
     - Recrear políticas para la tabla consent_health_answers para permitir operaciones relacionadas
  
  2. Seguridad
     - Mantener RLS habilitado en todas las tablas afectadas
     - Permitir a usuarios anónimos insertar registros
     - Permitir a usuarios autenticados realizar todas las operaciones
*/

-- Asegurarse que RLS está habilitado para consents
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Allow anon insert consents" ON consents;
DROP POLICY IF EXISTS "Allow authenticated CRUD consents" ON consents;

-- Política para permitir a usuarios anónimos insertar registros
CREATE POLICY "Allow anon insert consents"
ON consents
FOR INSERT
TO anon
WITH CHECK (true);

-- Política para permitir a usuarios autenticados realizar todas las operaciones
CREATE POLICY "Allow authenticated CRUD consents"
ON consents
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- También permitir a usuarios anónimos leer la tabla para verificar códigos
CREATE POLICY "Allow anon read consents"
ON consents
FOR SELECT
TO anon
USING (true);

-- Asegurar que consent_health_answers también tiene las políticas correctas
ALTER TABLE consent_health_answers ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas existentes
DROP POLICY IF EXISTS "Allow authenticated CRUD consent_health_answers" ON consent_health_answers;
DROP POLICY IF EXISTS "Allow anon insert consent_health_answers" ON consent_health_answers;

-- Permitir a usuarios autenticados realizar CRUD en consent_health_answers
CREATE POLICY "Allow authenticated CRUD consent_health_answers"
ON consent_health_answers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Permitir a usuarios anónimos insertar en consent_health_answers
CREATE POLICY "Allow anon insert consent_health_answers"
ON consent_health_answers
FOR INSERT
TO anon
WITH CHECK (true);