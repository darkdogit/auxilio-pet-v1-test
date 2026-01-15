/*
  # Sistema de Fluxo WhatsApp - Auxílio Pet

  ## 1. Nova Tabela: whatsapp_conversations
  
  Armazena as conversações ativas do WhatsApp
  
  - `id` (uuid, PK) - Identificador único da conversa
  - `phone_number` (text, NOT NULL) - Número de telefone do usuário
  - `current_step` (text, NOT NULL) - Etapa atual do fluxo (ex: "welcome", "pergunta_1", etc)
  - `started_at` (timestamptz) - Início da conversa
  - `last_interaction_at` (timestamptz) - Última interação
  - `is_active` (boolean) - Se a conversa está ativa
  - `session_data` (jsonb) - Dados temporários da sessão
  
  ## 2. Nova Tabela: whatsapp_responses
  
  Armazena todas as respostas coletadas do usuário
  
  - `id` (uuid, PK) - Identificador único
  - `conversation_id` (uuid, FK) - Referência para a conversa
  - `phone_number` (text, NOT NULL) - Número do usuário
  - `nome` (text) - Nome do usuário
  - `estado` (text) - Estado onde mora
  - `pix_ativo` (text) - Possui conta e Pix
  - `cpf_final` (text) - 4 últimos dígitos do CPF
  - `confirmacao_responsabilidade` (text) - Confirmação de responsabilidade
  - `chave_pix` (text) - Chave Pix para depósito
  - `pix_titular` (text) - Pix está no nome do usuário
  - `documento_ok` (text) - Documento atualizado
  - `confirmacao_dados` (text) - Confirmação de veracidade dos dados
  - `celular_confirmado` (text) - Celular é o mesmo da conversa
  - `alimentacao_pet` (text) - Alimentação do pet
  - `frequencia_alimentacao` (text) - Frequência de alimentação
  - `origem_pet` (text) - Origem do pet
  - `emergencia_vet` (text) - Condições de emergência veterinária
  - `vacinas` (text) - Vacinas atualizadas
  - `castracao` (text) - Pet castrado
  - `renda` (text) - Renda familiar
  - `dependentes` (text) - Quantidade de dependentes
  - `completed_at` (timestamptz) - Data de conclusão
  - `created_at` (timestamptz) - Data de criação
  - `updated_at` (timestamptz) - Data de atualização
  
  ## 3. Segurança (RLS)
  
  - SELECT apenas para usuários autenticados (admin)
  - INSERT/UPDATE/DELETE apenas para usuários autenticados
  
  ## 4. Performance
  
  - Índices em phone_number, conversation_id, is_active
*/

-- ============================================================================
-- CRIAR TABELA: whatsapp_conversations
-- ============================================================================

CREATE TABLE IF NOT EXISTS whatsapp_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  current_step text NOT NULL DEFAULT 'welcome',
  started_at timestamptz DEFAULT now(),
  last_interaction_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  session_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_phone ON whatsapp_conversations(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_active ON whatsapp_conversations(is_active);
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_step ON whatsapp_conversations(current_step);

-- Habilitar RLS
ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Allow authenticated select conversations"
  ON whatsapp_conversations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert conversations"
  ON whatsapp_conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update conversations"
  ON whatsapp_conversations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete conversations"
  ON whatsapp_conversations
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- CRIAR TABELA: whatsapp_responses
-- ============================================================================

CREATE TABLE IF NOT EXISTS whatsapp_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
  phone_number text NOT NULL,
  nome text,
  estado text,
  pix_ativo text,
  cpf_final text,
  confirmacao_responsabilidade text,
  chave_pix text,
  pix_titular text,
  documento_ok text,
  confirmacao_dados text,
  celular_confirmado text,
  alimentacao_pet text,
  frequencia_alimentacao text,
  origem_pet text,
  emergencia_vet text,
  vacinas text,
  castracao text,
  renda text,
  dependentes text,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_responses_conversation ON whatsapp_responses(conversation_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_responses_phone ON whatsapp_responses(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_responses_completed ON whatsapp_responses(completed_at);

-- Habilitar RLS
ALTER TABLE whatsapp_responses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Allow authenticated select responses"
  ON whatsapp_responses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert responses"
  ON whatsapp_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update responses"
  ON whatsapp_responses
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete responses"
  ON whatsapp_responses
  FOR DELETE
  TO authenticated
  USING (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_whatsapp_responses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS whatsapp_responses_updated_at ON whatsapp_responses;
CREATE TRIGGER whatsapp_responses_updated_at
  BEFORE UPDATE ON whatsapp_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_responses_updated_at();
