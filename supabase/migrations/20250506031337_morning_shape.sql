/*
  # Corregir políticas de seguridad para health_questions

  1. Cambios
    - Deshabilitar y volver a habilitar RLS para health_questions
    - Eliminar políticas existentes si existen
    - Crear nuevas políticas para operaciones CRUD para usuarios autenticados
  
  2. Seguridad
    - Asegurar que los usuarios autenticados puedan realizar todas las operaciones necesarias
*/

-- Primero deshabilitamos y volvemos a habilitar RLS para la tabla
ALTER TABLE health_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE health_questions ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DO $$ 
BEGIN
  -- Eliminar política de SELECT si existe
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'health_questions' 
    AND policyname = 'Allow authenticated users to select health_questions'
  ) THEN
    DROP POLICY "Allow authenticated users to select health_questions" ON health_questions;
  END IF;

  -- Eliminar política de INSERT si existe
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'health_questions' 
    AND policyname = 'Allow authenticated users to insert health_questions'
  ) THEN
    DROP POLICY "Allow authenticated users to insert health_questions" ON health_questions;
  END IF;

  -- Eliminar política de UPDATE si existe
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'health_questions' 
    AND policyname = 'Allow authenticated users to update health_questions'
  ) THEN
    DROP POLICY "Allow authenticated users to update health_questions" ON health_questions;
  END IF;

  -- Eliminar política de DELETE si existe
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'health_questions' 
    AND policyname = 'Allow authenticated users to delete health_questions'
  ) THEN
    DROP POLICY "Allow authenticated users to delete health_questions" ON health_questions;
  END IF;
END $$;

-- Crear nuevas políticas para usuarios autenticados
CREATE POLICY "Allow authenticated users to select health_questions"
  ON health_questions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert health_questions"
  ON health_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update health_questions"
  ON health_questions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete health_questions"
  ON health_questions
  FOR DELETE
  TO authenticated
  USING (true);

-- Crear una política para permitir a usuarios anónimos leer las preguntas
CREATE POLICY "Allow public read health_questions"
  ON health_questions
  FOR SELECT
  TO anon
  USING (true);