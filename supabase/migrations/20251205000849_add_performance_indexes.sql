/*
  # Add Performance Indexes

  1. Indexes
    - Add index on `registrations.email` for faster lookups
    - Add index on `registrations.created_at` for sorting
    - Add index on `pet_questionnaire.registration_id` for faster joins
    - Add index on `pet_questionnaire.created_at` for sorting

  2. Notes
    - These indexes will significantly improve query performance
    - Especially useful for the admin panel when fetching and sorting data
*/

CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pet_questionnaire_registration_id ON pet_questionnaire(registration_id);
CREATE INDEX IF NOT EXISTS idx_pet_questionnaire_created_at ON pet_questionnaire(created_at DESC);
