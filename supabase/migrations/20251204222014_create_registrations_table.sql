/*
  # Create registrations table

  1. New Tables
    - `registrations`
      - `id` (uuid, primary key) - Unique identifier
      - `nome_completo` (text) - Full name of the user
      - `email` (text) - Email address
      - `whatsapp` (text) - WhatsApp phone number
      - `created_at` (timestamptz) - Registration timestamp

  2. Security
    - Enable RLS on `registrations` table
    - Add policy for inserting new registrations (public access for form submission)
    - Add policy for viewing registrations (authenticated users only)
*/

CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert registrations"
  ON registrations
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view registrations"
  ON registrations
  FOR SELECT
  TO authenticated
  USING (true);