import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

// Create Supabase clients
export const supabaseClient: SupabaseClient = createClient(
  requiredEnvVars.SUPABASE_URL!,
  requiredEnvVars.SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false, // Server-side, no session persistence needed
    },
  }
);

// Admin client with service role key for server-side operations
export const supabaseAdmin: SupabaseClient = createClient(
  requiredEnvVars.SUPABASE_URL!,
  requiredEnvVars.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Database configuration
export const dbConfig = {
  url: requiredEnvVars.SUPABASE_URL!,
  anonKey: requiredEnvVars.SUPABASE_ANON_KEY!,
  serviceRoleKey: requiredEnvVars.SUPABASE_SERVICE_ROLE_KEY!,
};

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabaseClient
      .from('personality')
      .select('personality_id')
      .limit(1);
    
    if (error) {
      console.error('Database connection test failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};

export default supabaseClient; 