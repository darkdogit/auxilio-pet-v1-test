/*
  # Cleanup Duplicates and Add Unique Constraints

  1. Data Cleanup
    - Remove duplicate email entries, keeping only the earliest registration

  2. Constraints
    - Add unique constraint on `registrations.email` to prevent future duplicate registrations
    - Add foreign key constraint with ON DELETE CASCADE for data integrity

  3. Notes
    - Ensures data integrity moving forward
    - Preserves earliest registration for each email
*/

DELETE FROM registrations
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at ASC) AS rn
    FROM registrations
  ) t
  WHERE t.rn > 1
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'registrations_email_key'
  ) THEN
    ALTER TABLE registrations ADD CONSTRAINT registrations_email_key UNIQUE (email);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'pet_questionnaire_registration_id_fkey'
  ) THEN
    ALTER TABLE pet_questionnaire
    DROP CONSTRAINT pet_questionnaire_registration_id_fkey;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'pet_questionnaire_registration_id_fkey_cascade'
  ) THEN
    ALTER TABLE pet_questionnaire
    ADD CONSTRAINT pet_questionnaire_registration_id_fkey_cascade
    FOREIGN KEY (registration_id)
    REFERENCES registrations(id)
    ON DELETE CASCADE;
  END IF;
END $$;
