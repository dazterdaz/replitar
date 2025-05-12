/*
  # Corregir políticas RLS para la tabla health_questions
  
  1. Asegura que RLS esté habilitado en la tabla
  2. Elimina y recrea las políticas existentes para la tabla health_questions
*/

-- Asegurar que RLS está habilitado para health_questions
ALTER TABLE health_questions ENABLE ROW LEVEL SECURITY;

-- Primero eliminar las políticas existentes
DO $$
BEGIN
    -- Eliminar la política de SELECT si existe
    IF EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Allow authenticated users to select health_questions' 
        AND polrelid = 'health_questions'::regclass
    ) THEN
        DROP POLICY "Allow authenticated users to select health_questions" ON health_questions;
    END IF;

    -- Eliminar la política de INSERT si existe
    IF EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Allow authenticated users to insert health_questions' 
        AND polrelid = 'health_questions'::regclass
    ) THEN
        DROP POLICY "Allow authenticated users to insert health_questions" ON health_questions;
    END IF;

    -- Eliminar la política de UPDATE si existe
    IF EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Allow authenticated users to update health_questions' 
        AND polrelid = 'health_questions'::regclass
    ) THEN
        DROP POLICY "Allow authenticated users to update health_questions" ON health_questions;
    END IF;

    -- Eliminar la política de DELETE si existe
    IF EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Allow authenticated users to delete health_questions' 
        AND polrelid = 'health_questions'::regclass
    ) THEN
        DROP POLICY "Allow authenticated users to delete health_questions" ON health_questions;
    END IF;
END $$;

-- Crear las políticas nuevamente
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
  USING (true);

CREATE POLICY "Allow authenticated users to delete health_questions"
  ON health_questions
  FOR DELETE
  TO authenticated
  USING (true);