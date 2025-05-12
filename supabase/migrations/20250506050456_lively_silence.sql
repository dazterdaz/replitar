/*
  # Configuración de Realtime y triggers de updated_at
  
  1. Cambios
     - Verificar si las tablas ya están en la publicación supabase_realtime antes de añadirlas
     - Actualizar la función update_updated_at_column
     - Recrear los triggers para updated_at en todas las tablas
     
  2. Mejoras
     - Previene errores cuando las tablas ya están en la publicación
     - Asegura que todos los triggers para updated_at estén correctamente configurados
*/

-- Habilitar Realtime para las tablas principales solo si aún no están en la publicación
DO $$
DECLARE
  table_exists_in_publication BOOLEAN;
BEGIN
  -- Verificar si consents ya está en la publicación
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'consents'
  ) INTO table_exists_in_publication;
  
  IF NOT table_exists_in_publication THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE consents';
  END IF;

  -- Verificar si artists ya está en la publicación
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'artists'
  ) INTO table_exists_in_publication;
  
  IF NOT table_exists_in_publication THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE artists';
  END IF;

  -- Verificar si config ya está en la publicación
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'config'
  ) INTO table_exists_in_publication;
  
  IF NOT table_exists_in_publication THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE config';
  END IF;
END
$$;

-- Crear o reemplazar la función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Eliminar triggers existentes si existen para evitar errores
DROP TRIGGER IF EXISTS update_consents_updated_at ON consents;
DROP TRIGGER IF EXISTS update_artists_updated_at ON artists;
DROP TRIGGER IF EXISTS update_config_updated_at ON config;

-- Crear triggers para actualizar updated_at
CREATE TRIGGER update_consents_updated_at
BEFORE UPDATE ON consents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artists_updated_at
BEFORE UPDATE ON artists
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_config_updated_at
BEFORE UPDATE ON config
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();