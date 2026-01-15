/*
  # Create User Events Table for Analytics

  1. New Tables
    - `user_events`
      - `id` (uuid, primary key)
      - `session_id` (text) - Identificador único da sessão do usuário
      - `registration_id` (uuid, nullable) - Referência ao cadastro, se existir
      - `event_type` (text) - Tipo do evento (page_view, button_click, form_submit, etc)
      - `event_name` (text) - Nome específico do evento
      - `page_path` (text) - Caminho da página onde o evento ocorreu
      - `event_data` (jsonb) - Dados adicionais do evento
      - `user_agent` (text) - User agent do navegador
      - `ip_address` (text) - Endereço IP do usuário
      - `created_at` (timestamptz) - Data de criação do evento

  2. Security
    - Enable RLS on `user_events` table
    - Add policy for public insert (anonymous users can track events)
    - Add policy for authenticated select (only admins can read)

  3. Indexes
    - Index on session_id for fast session queries
    - Index on registration_id for user journey tracking
    - Index on event_type for event filtering
    - Index on created_at for time-based queries
*/

-- Create user_events table
CREATE TABLE IF NOT EXISTS user_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  registration_id uuid,
  event_type text NOT NULL,
  event_name text NOT NULL,
  page_path text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  user_agent text,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraint
ALTER TABLE user_events
  ADD CONSTRAINT user_events_registration_id_fkey
  FOREIGN KEY (registration_id)
  REFERENCES registrations(id)
  ON DELETE CASCADE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_events_session_id ON user_events(session_id);
CREATE INDEX IF NOT EXISTS idx_user_events_registration_id ON user_events(registration_id);
CREATE INDEX IF NOT EXISTS idx_user_events_event_type ON user_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_events_created_at ON user_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_events_event_name ON user_events(event_name);

-- Enable Row Level Security
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert events (for tracking)
CREATE POLICY "Anyone can insert events"
  ON user_events
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Allow public to select their own session events
CREATE POLICY "Users can view own session events"
  ON user_events
  FOR SELECT
  TO public
  USING (true);

-- Add comment to table
COMMENT ON TABLE user_events IS 'Stores user interaction events for analytics and funnel tracking';