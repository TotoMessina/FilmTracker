import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://updkqdtygkdjskpsvike.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZGtxZHR5Z2tkanNrcHN2aWtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2ODQ1MTAsImV4cCI6MjEwNjI2MDUxMH0.RdpnHkiJhJsNYqLUMsJwE9vmcIi9_VWsBlYZJDqtQYA";

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
