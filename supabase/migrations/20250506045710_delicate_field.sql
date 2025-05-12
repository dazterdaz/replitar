/*
  # Habilitar Realtime y asegurar triggers para updated_at
  
  1. Cambios
     - Habilitar Realtime para las tablas principales (consents, artists, config)
     - Crear función update_updated_at_column si no existe
     - Asegurar que los triggers para updated_at existen en todas las tablas
  
  2. Beneficios
     - Permite sincronización en tiempo real entre dispositivos
     - Asegura que los timestamps se actualicen correctamente
*/

-- Habilitar Realtime para las tablas principales
ALTER PUBLICATION supabase_realtime ADD TABLE consents;
ALTER PUBLICATION supabase_realtime ADD TABLE artists;
ALTER PUBLICATION supabase_realtime ADD TABLE config;

-- Crear función para actualizar el campo updated_at si no existe
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para consents si no existe
DROP TRIGGER IF EXISTS update_consents_updated_at ON consents;
CREATE TRIGGER update_consents_updated_at
BEFORE UPDATE ON consents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Crear trigger para artists si no existe
DROP TRIGGER IF EXISTS update_artists_updated_at ON artists;
CREATE TRIGGER update_artists_updated_at
BEFORE UPDATE ON artists
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Crear trigger para config si no existe
DROP TRIGGER IF EXISTS update_config_updated_at ON config;
CREATE TRIGGER update_config_updated_at
BEFORE UPDATE ON config
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();