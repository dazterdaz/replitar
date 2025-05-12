/*
  # Insertar preguntas de salud predeterminadas

  1. Cambios
    - Crear lista fija de preguntas de salud para todos los formularios
    - Todas las preguntas tienen valores predeterminados configurados
  
  2. Seguridad
    - Mantenemos las políticas RLS existentes
*/

-- Asegurarnos de que la tabla health_questions está vacía
DELETE FROM health_questions;

-- Obtener el ID de la configuración
DO $$
DECLARE
  config_id uuid;
BEGIN
  -- Obtener el ID de configuración
  SELECT id INTO config_id FROM config LIMIT 1;
  
  -- Insertar las preguntas fijas de salud
  INSERT INTO health_questions (question, default_answer, show_additional_field, additional_field_only_if_yes, config_id) VALUES
    ('¿Comiste en las últimas 4 horas?', true, false, false, config_id),
    ('¿Tienes alergias?', false, true, true, config_id),
    ('¿Tienes hemofilia?', false, false, false, config_id),
    ('¿Has tomado aspirina en los últimos 5 días?', false, false, false, config_id),
    ('¿Tienes hepatitis?', false, false, false, config_id),
    ('¿Tienes mala cicatrización?', false, false, false, config_id),
    ('¿Vives con VIH?', false, false, false, config_id),
    ('¿Tienes problemas de salud?', false, true, true, config_id),
    ('¿Estás en tratamiento médico?', false, true, true, config_id),
    ('¿Tienes tendencia a desmayarte?', false, false, false, config_id),
    ('¿Fumas?', false, false, false, config_id),
    ('¿Bebes alcohol?', false, false, false, config_id),
    ('¿Bebiste en las últimas 3 horas?', false, false, false, config_id),
    ('¿Consumes drogas?', false, false, false, config_id),
    ('¿Tienes problemas dermatológicos?', false, true, true, config_id),
    ('¿Tu piel produce queloides?', false, false, false, config_id),
    ('¿Es tu primer tatuaje?', false, false, false, config_id);
END $$;