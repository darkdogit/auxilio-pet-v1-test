/*
  # Create pets table

  1. New Tables
    - `pets`
      - `id` (uuid, primary key) - Unique identifier for each pet
      - `registration_id` (uuid, foreign key) - Links to registrations table
      - `pet_type` (text) - Type of pet (gato or cachorro)
      - `breed` (text) - Breed of the pet
      - `age` (text) - Age of the pet
      - `name` (text) - Name of the pet
      - `created_at` (timestamptz) - Timestamp

  2. Security
    - Enable RLS on `pets` table
    - Add policy for public insert (anyone can add pet data)
    - Add policy for authenticated select (admins can view pet data)

  3. Important Notes
    - Each registration can have multiple pets (up to 2)
    - This table stores individual pet information separate from the questionnaire
    - Uses foreign key constraint to maintain data integrity
*/

CREATE TABLE IF NOT EXISTS pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid REFERENCES registrations(id) ON DELETE CASCADE,
  pet_type text NOT NULL,
  breed text NOT NULL,
  age text NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert pet data"
  ON pets
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view pet data"
  ON pets
  FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_pets_registration_id ON pets(registration_id);
