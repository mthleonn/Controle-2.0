import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug para verificar se as chaves estão sendo carregadas
console.log('Supabase Config:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length || 0,
  keyStart: supabaseAnonKey?.substring(0, 10)
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL ou Key não encontrados. Verifique o arquivo .env');
}

export const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://setup-your-env-vars.supabase.co';

export const supabase = createClient(
  supabaseUrl || 'https://setup-your-env-vars.supabase.co',
  supabaseAnonKey || 'setup-your-env-vars'
);
