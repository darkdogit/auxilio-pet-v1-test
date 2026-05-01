/*
  # Add IP Address field to registrations table

  1. Changes
    - Add `ip_address` column to `registrations` table
    - This will store the visitor's IP address for analytics and security purposes

  2. Important Notes
    - The IP address is captured when users submit registration forms
    - This is useful for preventing fraud and analyzing geographic data
*/

-- Add ip_address column to registrations table
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS ip_address text;