import { createClient } from '@supabase/supabase-js';

// Access environment variables using import.meta.env for Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; 
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase URL:", supabaseUrl);
  console.error("Supabase Anon Key:", supabaseKey);
  throw new Error("Supabase URL and Anon Key are required. Check your .env file and ensure they are prefixed with VITE_ and the dev server was restarted.");
}

// Kredensial stub (mis. saat kloning repo tanpa .env asli) tidak akan bisa
// dihubungi. Tandai agar fitur yang mahal, seperti koneksi Realtime yang
// terus mencoba ulang saat gagal, bisa dilewati alih-alih membanjiri
// console dengan error koneksi berulang.
export const isPlaceholderConfig = /placeholder/i.test(`${supabaseUrl} ${supabaseKey}`);

if (isPlaceholderConfig) {
  console.warn(
    "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY masih placeholder. " +
      "Data portfolio tidak akan dimuat dan fitur Realtime dimatikan. " +
      "Isi kredensial asli di .env.local lalu restart dev server."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);