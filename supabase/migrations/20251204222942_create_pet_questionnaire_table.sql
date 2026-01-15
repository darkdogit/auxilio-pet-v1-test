/*
  # Create pet questionnaire table

  1. New Tables
    - `pet_questionnaire`
      - `id` (uuid, primary key) - Unique identifier
      - `registration_id` (uuid) - Foreign key to registrations table
      - `alimentacao` (text) - Type of food for pet
      - `frequencia_alimentacao` (text) - Feeding frequency
      - `origem` (text) - Pet origin (adopted/bought)
      - `emergencia_financeira` (text) - Emergency financial capability
      - `vacinas` (text) - Vaccination status
      - `castrado` (text) - Neutered/spayed status
      - `controle_parasitas` (text) - Parasite control status
      - `created_at` (timestamptz) - Timestamp

  2. Security
    - Enable RLS on `pet_questionnaire` table
    - Add policy for inserting questionnaire responses (public access)
    - Add policy for viewing responses (authenticated users only)
*/

CREATE TABLE IF NOT EXISTS pet_questionnaire (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid REFERENCES registrations(id),
  alimentacao text,
  frequencia_alimentacao text,
  origem text,
  emergencia_financeira text,
  vacinas text,
  castrado text,
  controle_parasitas text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pet_questionnaire ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert questionnaire responses"
  ON pet_questionnaire
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view questionnaire responses"
  ON pet_questionnaire
  FOR SELECT
  TO authenticated
  USING (true);