// utils/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY as string;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
}

// Create admin client (for server-side operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

// Create a client with a specific user's JWT (for authenticated requests)
export const createServerSupabaseClient = (accessToken?: string) => {
    const options = accessToken
        ? {
              global: {
                  headers: {
                      Authorization: `Bearer ${accessToken}`,
                  },
              },
              auth: {
                  autoRefreshToken: false,
                  persistSession: false,
              },
          }
        : {
              auth: {
                  autoRefreshToken: false,
                  persistSession: false,
              },
          };

    return createClient(supabaseUrl, supabaseServiceKey, options);
};

// For testing purposes or if needed on the server
export const createAnonSupabaseClient = () => {
    return createClient(supabaseUrl, supabaseAnonKey);
};
