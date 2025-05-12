/*
  # Configuración de RLS para permitir inserción anónima en consents
  
  1. Cambios
     - Aseguramos que RLS esté habilitado en la tabla consents
     - Eliminamos cualquier política existente para evitar conflictos
     - Creamos una política que permite a usuarios anónimos insertar registros
     - Creamos una política que permite a usuarios autenticados realizar todas las operaciones
     
  2. Seguridad
     - Mantiene la seguridad mientras permite la funcionalidad requerida
     - Asegura que los usuarios anónimos solo puedan insertar, no leer ni modificar
     - Los usuarios autenticados mantienen control total
*/

-- Asegurarse que RLS está habilitado para consents
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Allow anon insert consents" ON consents;
DROP POLICY IF EXISTS "Allow authenticated CRUD consents" ON consents;
DROP POLICY IF EXISTS "Allow public insert consents" ON consents;

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

-- Asegurar que todas las tablas relacionadas tengan los permisos adecuados
ALTER TABLE consent_health_answers ENABLE ROW LEVEL SECURITY;

-- Configurar política para que usuarios autenticados puedan realizar CRUD en consent_health_answers
DROP POLICY IF EXISTS "Allow authenticated CRUD consent_health_answers" ON consent_health_answers;

CREATE POLICY "Allow authenticated CRUD consent_health_answers"
ON consent_health_answers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);