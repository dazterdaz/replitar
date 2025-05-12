/*
  # Actualizar textos de consentimiento con todas las variables necesarias
  
  1. Cambios
     - Asegurar que los textos de consentimiento incluyan todas las variables necesarias
     - Formatear correctamente los textos para reemplazar variables como {Rut Cliente}, etc.
  
  2. Beneficios
     - Mejor experiencia para el usuario al visualizar sus datos correctamente formateados
     - Mayor claridad en los documentos legales
*/

-- Actualizar los textos con todas las variables necesarias
UPDATE config
SET 
  consent_text = 'Yo, {Nombre Cliente}, con RUT {Rut Cliente}, de {Edad Cliente} años de edad, declaro ser la persona descrita como "CLIENTE" en este documento y autorizo al artista {Nombre Artista} de {Nombre Estudio} ubicado en {Direccion Estudio} para realizar el procedimiento de tatuaje en mi cuerpo.

Entiendo y acepto que:

1. He sido informado de los riesgos inherentes al procedimiento de tatuaje, incluyendo posibles infecciones, reacciones alérgicas, cicatrización indebida y otros riesgos asociados.

2. Certifico que no me encuentro bajo la influencia de drogas o alcohol.

3. Comprendo que el resultado final del tatuaje puede variar ligeramente del diseño original debido a las características de mi piel y la ubicación del mismo.

4. Me comprometo a seguir todas las instrucciones de cuidado posteriores al procedimiento proporcionadas por {Nombre Estudio}.

5. Libero a {Nombre Estudio}, sus empleados y al artista {Nombre Artista} de cualquier responsabilidad relacionada con reacciones alérgicas, complicaciones médicas o insatisfacción con el resultado final si se debe a circunstancias fuera del control del artista.

6. Autorizo a {Nombre Estudio} para registrar este procedimiento en su base de datos de clientes y contactarme para seguimiento si fuera necesario.

7. Entiendo que este procedimiento es permanente y que la eliminación, en caso de ser posible, es costosa y puede dejar marcas.

8. Confirmo que he proporcionado información veraz y completa sobre mi historial médico y condiciones de salud que podrían afectar este procedimiento.',

  tutor_consent_text = 'Yo, {Nombre Tutor} con cédula de identidad {Rut Tutor}, en mi calidad de {Parentesco Tutor} de {Nombre Cliente} {Apellidos Cliente} con RUT {Rut Cliente}, menor de edad ({Edad Cliente} años), autorizo que se le realice un tatuaje en {Nombre Estudio} ubicado en {Direccion Estudio}.

Declaro que:

1. Soy el tutor legal y responsable del menor mencionado y tengo plena facultad legal para autorizar este procedimiento.

2. He revisado, entiendo y acepto todos los términos y condiciones presentes en el Formulario de Consentimiento para Tatuaje.

3. He sido informado de los riesgos inherentes al procedimiento de tatuaje, incluyendo posibles infecciones, reacciones alérgicas, cicatrización indebida y otros riesgos asociados.

4. Me comprometo a que el menor siga todas las instrucciones de cuidado posteriores proporcionadas por {Nombre Estudio}.

5. Libero a {Nombre Estudio}, sus empleados y artistas de cualquier responsabilidad relacionada con reacciones alérgicas, complicaciones médicas o insatisfacción con el resultado final si se debe a circunstancias fuera del control del artista.

6. Estaré presente durante todo el procedimiento de tatuaje supervisando al menor.

Esta autorización es válida únicamente para el procedimiento especificado en este documento.'

WHERE id IS NOT NULL;