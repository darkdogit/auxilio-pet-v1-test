/*
  # Fix Column Naming Consistency

  1. Changes
    - Rename `nome_completo` to `full_name` in registrations table for consistency
    - This aligns the database schema with the application code

  2. Notes
    - Using snake_case naming convention throughout
    - Ensures consistency between database and TypeScript types
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'nome_completo'
  ) THEN
    ALTER TABLE registrations RENAME COLUMN nome_completo TO full_name;
  END IF;
END $$;
