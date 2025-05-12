/*
  # Añadir instrucciones de cuidado a la tabla de configuración
  
  1. Cambios
     - Agregar columnas para almacenar instrucciones de cuidado con crema y con parche
     - Actualizar registros existentes con textos predeterminados
  
  2. Beneficios
     - Permite personalizar las instrucciones de cuidado desde el panel de administración
     - Facilita la descarga de instrucciones específicas para cada tipo de tatuaje
*/

-- Primero, verificamos si las columnas ya existen
DO $$ 
BEGIN
  -- Agregar columna para cuidados con crema si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'config' AND column_name = 'cream_aftercare'
  ) THEN
    ALTER TABLE config ADD COLUMN cream_aftercare text NOT NULL DEFAULT 
    'CUIDADOS POST-TATUAJE CON CREMA

1. Durante las primeras 2-3 horas:
   - Mantén el vendaje original colocado por el artista.
   - El tatuaje podría sangrar ligeramente, esto es normal.

2. Después de 2-3 horas:
   - Retira suavemente el vendaje.
   - Lava el área con agua tibia y jabón neutro, sin frotar.
   - Seca dando pequeños toques con una toalla limpia.

3. Durante los siguientes 7-14 días:
   - Aplica una capa fina de crema recomendada por tu artista 2-3 veces al día.
   - No cubras el tatuaje con vendajes adicionales.
   - Evita rascarte, despegar costras o piel descamada.
   - Evita la exposición directa al sol.
   - Evita nadar en piscinas, mar o bañeras.
   - Evita actividades que provoquen sudoración excesiva.

4. Después de la cicatrización (2-3 semanas):
   - Usa siempre protector solar SPF 50+ en el tatuaje si se expone al sol.
   - Mantén la piel hidratada.

¡Si tienes dudas o preocupaciones durante el proceso de cicatrización, no dudes en contactarnos!';
  END IF;
  
  -- Agregar columna para cuidados con parche si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'config' AND column_name = 'patch_aftercare'
  ) THEN
    ALTER TABLE config ADD COLUMN patch_aftercare text NOT NULL DEFAULT 
    'CUIDADOS POST-TATUAJE CON PARCHE (SECOND SKIN)

1. Parche inicial:
   - Mantén el parche Second Skin colocado por el artista durante 24 horas (mínimo) a 5 días (máximo).
   - Es normal ver fluidos acumulados debajo del parche, esto ayuda a la cicatrización.

2. Removiendo el parche:
   - Retíralo en la ducha con agua tibia para facilitar su desprendimiento.
   - No lo arranques en seco para evitar dañar la piel.
   - Lava suavemente el tatuaje con jabón neutro y agua tibia.

3. Después de remover el parche:
   - Aplica una capa fina de crema recomendada por tu artista 2-3 veces al día durante 7-10 días.
   - No apliques un nuevo parche a menos que el artista lo recomiende.
   - Evita la exposición directa al sol.
   - Evita nadar en piscinas, mar o bañeras hasta que el tatuaje esté completamente cicatrizado.

4. Después de la cicatrización (2-3 semanas):
   - Usa siempre protector solar SPF 50+ en el tatuaje si se expone al sol.
   - Mantén la piel hidratada.

¡Si tienes dudas o preocupaciones durante el proceso de cicatrización, no dudes en contactarnos!';
  END IF;

  -- Actualizar registros existentes si las columnas se acaban de añadir
  UPDATE config
  SET cream_aftercare = 'CUIDADOS POST-TATUAJE CON CREMA

1. Durante las primeras 2-3 horas:
   - Mantén el vendaje original colocado por el artista.
   - El tatuaje podría sangrar ligeramente, esto es normal.

2. Después de 2-3 horas:
   - Retira suavemente el vendaje.
   - Lava el área con agua tibia y jabón neutro, sin frotar.
   - Seca dando pequeños toques con una toalla limpia.

3. Durante los siguientes 7-14 días:
   - Aplica una capa fina de crema recomendada por tu artista 2-3 veces al día.
   - No cubras el tatuaje con vendajes adicionales.
   - Evita rascarte, despegar costras o piel descamada.
   - Evita la exposición directa al sol.
   - Evita nadar en piscinas, mar o bañeras.
   - Evita actividades que provoquen sudoración excesiva.

4. Después de la cicatrización (2-3 semanas):
   - Usa siempre protector solar SPF 50+ en el tatuaje si se expone al sol.
   - Mantén la piel hidratada.

¡Si tienes dudas o preocupaciones durante el proceso de cicatrización, no dudes en contactarnos!',
      patch_aftercare = 'CUIDADOS POST-TATUAJE CON PARCHE (SECOND SKIN)

1. Parche inicial:
   - Mantén el parche Second Skin colocado por el artista durante 24 horas (mínimo) a 5 días (máximo).
   - Es normal ver fluidos acumulados debajo del parche, esto ayuda a la cicatrización.

2. Removiendo el parche:
   - Retíralo en la ducha con agua tibia para facilitar su desprendimiento.
   - No lo arranques en seco para evitar dañar la piel.
   - Lava suavemente el tatuaje con jabón neutro y agua tibia.

3. Después de remover el parche:
   - Aplica una capa fina de crema recomendada por tu artista 2-3 veces al día durante 7-10 días.
   - No apliques un nuevo parche a menos que el artista lo recomiende.
   - Evita la exposición directa al sol.
   - Evita nadar en piscinas, mar o bañeras hasta que el tatuaje esté completamente cicatrizado.

4. Después de la cicatrización (2-3 semanas):
   - Usa siempre protector solar SPF 50+ en el tatuaje si se expone al sol.
   - Mantén la piel hidratada.

¡Si tienes dudas o preocupaciones durante el proceso de cicatrización, no dudes en contactarnos!'
  WHERE cream_aftercare IS NULL OR patch_aftercare IS NULL;
END $$;