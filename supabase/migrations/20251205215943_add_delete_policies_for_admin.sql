/*
  # Add DELETE policies for admin functionality

  1. Changes
    - Add DELETE policies to `pet_questionnaire` table to allow unrestricted deletion
    - Add DELETE policies to `pets` table to allow unrestricted deletion
    - These policies enable the admin panel to clear the database

  2. Security Note
    - These policies allow anyone to delete data
    - In production, you should restrict this to authenticated admin users only
    - For this demo application, we're allowing unrestricted access
*/

-- Add DELETE policy for pet_questionnaire table
CREATE POLICY "Allow all to delete questionnaire data"
  ON pet_questionnaire
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Add DELETE policy for pets table
CREATE POLICY "Allow all to delete pet data"
  ON pets
  FOR DELETE
  TO anon, authenticated
  USING (true);