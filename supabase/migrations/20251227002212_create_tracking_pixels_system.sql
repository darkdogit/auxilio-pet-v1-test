/*
  # Sistema de Gerenciamento de Pixels de Rastreamento

  ## 1. Nova Tabela: tracking_pixels
  
  Armazena códigos de pixels de rastreamento (Facebook Pixel, Google Analytics, etc.)
  
  - `id` (uuid, PK) - Identificador único do pixel
  - `name` (text, NOT NULL) - Nome do pixel (ex: "Facebook Pixel", "Google Analytics")
  - `pixel_type` (text, NOT NULL) - Tipo do pixel (facebook, google_analytics, tiktok, etc)
  - `pixel_code` (text, NOT NULL) - Código completo do pixel (script)
  - `is_active` (boolean) - Se o pixel está ativo ou não
  - `created_at` (timestamptz) - Data de criação
  - `updated_at` (timestamptz) - Data de atualização
  
  ## 2. Segurança (RLS)
  
  - SELECT público para permitir que o site carregue os pixels
  - INSERT/UPDATE/DELETE apenas para usuários autenticados (admin)
  
  ## 3. Performance
  
  - Índice em is_active para queries rápidas
*/

-- ============================================================================
-- CRIAR TABELA: tracking_pixels
-- ============================================================================

CREATE TABLE IF NOT EXISTS tracking_pixels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  pixel_type text NOT NULL,
  pixel_code text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE tracking_pixels ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Allow public select on active pixels"
  ON tracking_pixels
  FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Allow authenticated select all pixels"
  ON tracking_pixels
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert pixels"
  ON tracking_pixels
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update pixels"
  ON tracking_pixels
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete pixels"
  ON tracking_pixels
  FOR DELETE
  TO authenticated
  USING (true);

-- Índices de performance
CREATE INDEX idx_tracking_pixels_is_active ON tracking_pixels(is_active);
CREATE INDEX idx_tracking_pixels_pixel_type ON tracking_pixels(pixel_type);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_tracking_pixels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS tracking_pixels_updated_at ON tracking_pixels;
CREATE TRIGGER tracking_pixels_updated_at
  BEFORE UPDATE ON tracking_pixels
  FOR EACH ROW
  EXECUTE FUNCTION update_tracking_pixels_updated_at();
