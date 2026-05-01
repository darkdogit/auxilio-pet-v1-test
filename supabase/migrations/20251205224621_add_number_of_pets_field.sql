/*
  # Adicionar campo de quantidade de pets

  1. Mudanças
    - Adiciona coluna `quantidade_pets` na tabela `pet_questionnaire`
    - Campo do tipo integer para armazenar quantos pets a pessoa tem
    - Define valor padrão como 1
  
  2. Notas
    - Campo obrigatório para entender melhor o perfil do tutor
    - Facilita análise de dados e planejamento do programa
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pet_questionnaire' AND column_name = 'quantidade_pets'
  ) THEN
    ALTER TABLE pet_questionnaire ADD COLUMN quantidade_pets integer DEFAULT 1;
  END IF;
END $$;