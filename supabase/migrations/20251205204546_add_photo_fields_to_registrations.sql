/*
  # Adicionar campos de fotos na tabela registrations

  1. Mudanças
    - Adiciona coluna `selfie_url` para armazenar URL da selfie com documento
    - Adiciona coluna `pet_photos` para armazenar array de URLs das fotos dos pets
  
  2. Detalhes
    - `selfie_url` (text, nullable) - URL da foto selfie com documento
    - `pet_photos` (text[], nullable) - Array de URLs das fotos dos pets
  
  3. Notas
    - Campos são opcionais inicialmente para não quebrar cadastros existentes
    - As fotos serão armazenadas no Supabase Storage
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'selfie_url'
  ) THEN
    ALTER TABLE registrations ADD COLUMN selfie_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'pet_photos'
  ) THEN
    ALTER TABLE registrations ADD COLUMN pet_photos text[];
  END IF;
END $$;