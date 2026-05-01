/*
  # Sistema de Analytics e Tracking de Eventos

  ## 1. Nova Tabela: user_events
  
  Rastreia todos os eventos e interações dos usuários no sistema
  
  - `id` (uuid, PK) - Identificador único do evento
  - `session_id` (uuid) - ID da sessão do usuário
  - `registration_id` (uuid, FK nullable) - Referência para registrations (quando disponível)
  - `event_type` (text, NOT NULL) - Tipo do evento (page_view, button_click, form_submit, etc)
  - `event_name` (text, NOT NULL) - Nome específico do evento
  - `page_path` (text) - Caminho da página onde ocorreu
  - `event_data` (jsonb) - Dados adicionais do evento
  - `ip_address` (text) - IP do usuário
  - `user_agent` (text) - User agent do navegador
  - `created_at` (timestamptz) - Timestamp do evento

  ## 2. Tipos de Eventos Rastreados
  
  - page_view: Visualização de páginas
  - button_click: Cliques em botões
  - form_start: Início de preenchimento de formulário
  - form_submit: Envio de formulário
  - form_error: Erros em formulário
  - navigation: Navegação entre páginas
  
  ## 3. Segurança (RLS)
  
  - INSERT público para permitir tracking anônimo
  - SELECT apenas para usuários autenticados (admin)
  
  ## 4. Performance
  
  - Índices em campos críticos para queries rápidas
  - JSONB para dados flexíveis de eventos
*/

-- ============================================================================
-- CRIAR TABELA: user_events
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  registration_id uuid REFERENCES registrations(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  event_name text NOT NULL,
  page_path text,
  event_data jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Allow public insert on events"
  ON user_events
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated select on events"
  ON user_events
  FOR SELECT
  TO authenticated
  USING (true);

-- Índices de performance
CREATE INDEX idx_user_events_session_id ON user_events(session_id);
CREATE INDEX idx_user_events_registration_id ON user_events(registration_id);
CREATE INDEX idx_user_events_event_type ON user_events(event_type);
CREATE INDEX idx_user_events_created_at ON user_events(created_at DESC);
CREATE INDEX idx_user_events_event_data ON user_events USING gin(event_data);

-- ============================================================================
-- ADICIONAR CAMPOS DE TRACKING À TABELA registrations
-- ============================================================================

DO $$
BEGIN
  -- Adicionar session_id se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE registrations ADD COLUMN session_id uuid;
    CREATE INDEX idx_registrations_session_id ON registrations(session_id);
  END IF;

  -- Adicionar user_agent se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'user_agent'
  ) THEN
    ALTER TABLE registrations ADD COLUMN user_agent text;
  END IF;

  -- Adicionar referrer se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'referrer'
  ) THEN
    ALTER TABLE registrations ADD COLUMN referrer text;
  END IF;

  -- Adicionar utm_source se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'utm_source'
  ) THEN
    ALTER TABLE registrations ADD COLUMN utm_source text;
  END IF;

  -- Adicionar utm_medium se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'utm_medium'
  ) THEN
    ALTER TABLE registrations ADD COLUMN utm_medium text;
  END IF;

  -- Adicionar utm_campaign se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'utm_campaign'
  ) THEN
    ALTER TABLE registrations ADD COLUMN utm_campaign text;
  END IF;
END $$;
