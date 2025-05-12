-- Para evitar errores de "relación ya es miembro de la publicación"
DO $$
DECLARE
  consents_in_realtime BOOLEAN;
  artists_in_realtime BOOLEAN;
  config_in_realtime BOOLEAN;
BEGIN
  -- Verificar si las tablas ya están en la publicación
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'consents'
  ) INTO consents_in_realtime;
  
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'artists'
  ) INTO artists_in_realtime;
  
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'config'
  ) INTO config_in_realtime;

  -- Agregar tablas a la publicación solo si no están ya incluidas
  IF NOT consents_in_realtime THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.consents';
  END IF;
  
  IF NOT artists_in_realtime THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.artists';
  END IF;
  
  IF NOT config_in_realtime THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.config';
  END IF;
END $$;

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