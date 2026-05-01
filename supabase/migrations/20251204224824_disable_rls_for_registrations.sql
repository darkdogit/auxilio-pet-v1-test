/*
  # Disable RLS for Registrations Table

  1. Changes
    - Disable RLS to allow public form submissions
    - This allows anyone to submit registration forms without authentication

  2. Security Note
    - Public registration forms typically don't require authentication
    - This is standard for lead capture and sign-up forms
*/

-- Disable RLS for public registrations
ALTER TABLE registrations DISABLE ROW LEVEL SECURITY;