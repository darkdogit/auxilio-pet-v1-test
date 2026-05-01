/*
  # Criar Esquema Completo do Banco de Dados AUXILIO PET

  ## 1. Tabelas Principais

  ### registrations
  Armazena os cadastros dos usuários do programa
  - `id` (uuid, PK) - Identificador único
  - `full_name` (text, NOT NULL) - Nome completo
  - `email` (text, NOT NULL, UNIQUE) - Email único
  - `whatsapp` (text, NOT NULL) - Número WhatsApp
  - `ip_address` (text) - IP do cliente para analytics
  - `selfie_url` (text) - URL da foto selfie com documento
  - `pet_photos` (text[]) - Array de URLs das fotos dos pets
  - `created_at` (timestamptz) - Data de criação

  ### pets
  Armazena informações individuais dos pets
  - `id` (uuid, PK) - Identificador único
  - `registration_id` (uuid, FK) - Referência para registrations
  - `pet_type` (text, NOT NULL) - Tipo (gato/cachorro)
  - `breed` (text, NOT NULL) - Raça
  - `age` (text, NOT NULL) - Idade
  - `name` (text, NOT NULL) - Nome
  - `created_at` (timestamptz) - Data de criação

  ### pet_questionnaire
  Armazena as respostas do questionário sobre os pets
  - `id` (uuid, PK) - Identificador único
  - `registration_id` (uuid, FK) - Referência para registrations
  - `quantidade_pets` (integer) - Quantidade de pets
  - `alimentacao` (text) - Tipo de alimentação
  - `frequencia_alimentacao` (text) - Frequência de alimentação
  - `origem` (text) - Origem do pet
  - `emergencia_financeira` (text) - Situação financeira emergencial
  - `vacinas` (text) - Status de vacinação
  - `castrado` (text) - Status de castração
  - `controle_parasitas` (text) - Controle de parasitas
  - `dificuldade_financeira` (text) - Histórico de dificuldades
  - `created_at` (timestamptz) - Data de criação

  ## 2. Segurança (RLS)

  - registrations: RLS desabilitado para permitir cadastros públicos
  - pets: RLS habilitado com políticas para INSERT público e SELECT autenticado
  - pet_questionnaire: RLS habilitado com políticas para INSERT público e SELECT autenticado

  ## 3. Performance

  - Índices em campos críticos para otimização de queries
  - Foreign keys com CASCADE para integridade de dados
  - Constraint UNIQUE no email

  ## 4. Notas Importantes

  - Esquema otimizado para o fluxo do programa AUXILIO PET
  - Todas as tabelas têm timestamps automáticos
  - Relações em cascata garantem consistência dos dados
*/

-- ============================================================================
-- CRIAR TABELA: registrations
-- ============================================================================

CREATE TABLE registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  whatsapp text NOT NULL,
  ip_address text,
  selfie_url text,
  pet_photos text[],
  created_at timestamptz DEFAULT now()
);

-- Desabilitar RLS para permitir cadastros públicos
ALTER TABLE registrations DISABLE ROW LEVEL SECURITY;

-- Criar índices de performance
CREATE INDEX idx_registrations_email ON registrations(email);
CREATE INDEX idx_registrations_created_at ON registrations(created_at DESC);

-- ============================================================================
-- CRIAR TABELA: pets
-- ============================================================================

CREATE TABLE pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  pet_type text NOT NULL,
  breed text NOT NULL,
  age text NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Allow public insert on pets"
  ON pets
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated select on pets"
  ON pets
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow public delete on pets"
  ON pets
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Índice de performance
CREATE INDEX idx_pets_registration_id ON pets(registration_id);

-- ============================================================================
-- CRIAR TABELA: pet_questionnaire
-- ============================================================================

CREATE TABLE pet_questionnaire (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  quantidade_pets integer DEFAULT 1,
  alimentacao text,
  frequencia_alimentacao text,
  origem text,
  emergencia_financeira text,
  vacinas text,
  castrado text,
  controle_parasitas text,
  dificuldade_financeira text,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE pet_questionnaire ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Allow public insert on questionnaire"
  ON pet_questionnaire
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated select on questionnaire"
  ON pet_questionnaire
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow public delete on questionnaire"
  ON pet_questionnaire
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Índices de performance
CREATE INDEX idx_pet_questionnaire_registration_id ON pet_questionnaire(registration_id);
CREATE INDEX idx_pet_questionnaire_created_at ON pet_questionnaire(created_at DESC);
