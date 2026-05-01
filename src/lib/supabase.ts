import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Acessar variáveis de ambiente via import.meta.env (Vite)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificação de segurança para desenvolvimento
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERRO CRÍTICO: Variáveis de ambiente do Supabase não encontradas. Verifique o ficheiro .env');
}

export const supabase = createClient<Database>(
  supabaseUrl || '', 
  supabaseAnonKey || '', 
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    db: {
      schema: 'public'
    }
  }
);