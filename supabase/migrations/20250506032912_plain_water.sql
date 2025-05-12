/*
  # Actualizar textos de consentimiento y tutor legal

  1. Cambios
    - Actualiza el texto de consentimiento en la tabla `config`
    - Actualiza el texto de tutor legal en la tabla `config`
*/

-- Actualizar el texto de consentimiento y tutor legal en la tabla config
UPDATE config
SET 
  consent_text = 'Yo, {Nombre Cliente}, declaro ser la persona descrita como "CLIENTE" en este documento...',
  tutor_consent_text = 'Yo, {Nombre Tutor} con cédula de identidad {Rut Tutor}, en mi calidad de tutor legal...'
WHERE id IS NOT NULL;