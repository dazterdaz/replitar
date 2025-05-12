/*
  # Eliminar todos los registros existentes
  
  1. Cambios
     - Elimina todos los registros de consentimientos (consents)
     - Elimina todos los registros de artistas (artists)
  
  2. Beneficios
     - Permite comenzar a usar el sistema con datos limpios
     - Evita problemas con datos de prueba o antiguos
*/

-- Usar una transacción para asegurar que todo se ejecuta correctamente
BEGIN;

-- Primero eliminamos todos los registros de consentimientos
-- porque tienen una restricción de clave foránea a la tabla de artistas
DELETE FROM public.consent_health_answers;
DELETE FROM public.consents;

-- Luego eliminamos todos los registros de artistas
DELETE FROM public.artists;

-- Confirmar la transacción
COMMIT;