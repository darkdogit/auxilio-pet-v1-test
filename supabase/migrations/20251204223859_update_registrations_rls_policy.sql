/*
  # Update RLS Policy for Registrations

  1. Changes
    - Drop existing restrictive INSERT policy
    - Create new permissive INSERT policy for public access
    - Allow anyone to insert into registrations table without authentication

  2. Security
    - Public INSERT access for form submissions
    - Maintains existing SELECT policy for authenticated users
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Anyone can insert registrations" ON registrations;

-- Create a new public INSERT policy
CREATE POLICY "Public can insert registrations"
  ON registrations
  FOR INSERT
  TO public
  WITH CHECK (true);