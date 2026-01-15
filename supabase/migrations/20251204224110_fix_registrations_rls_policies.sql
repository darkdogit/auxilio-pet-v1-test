/*
  # Fix RLS Policies for Registrations Table

  1. Changes
    - Drop all existing INSERT policies to avoid conflicts
    - Create single clear INSERT policy for anon role
    - Clean up duplicate SELECT policies
    - Ensure public form submissions work correctly

  2. Security
    - Allow anonymous users to insert registrations
    - Authenticated users can view all registrations
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can insert registrations" ON registrations;
DROP POLICY IF EXISTS "Public can insert registrations" ON registrations;
DROP POLICY IF EXISTS "Permitir cadastros públicos" ON registrations;
DROP POLICY IF EXISTS "Authenticated users can view registrations" ON registrations;
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON registrations;

-- Create clean INSERT policy for anonymous users
CREATE POLICY "Allow anonymous insertions"
  ON registrations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create SELECT policy for authenticated users
CREATE POLICY "Allow authenticated to read all"
  ON registrations
  FOR SELECT
  TO authenticated
  USING (true);