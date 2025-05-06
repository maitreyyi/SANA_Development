"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAnonSupabaseClient = exports.createServerSupabaseClient = exports.supabaseAdmin = void 0;
// utils/supabase.ts
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
}
// Create admin client (for server-side operations)
exports.supabaseAdmin = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});
// Create a client with a specific user's JWT (for authenticated requests)
const createServerSupabaseClient = (accessToken) => {
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
    return (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, options);
};
exports.createServerSupabaseClient = createServerSupabaseClient;
// For testing purposes or if needed on the server
const createAnonSupabaseClient = () => {
    return (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey);
};
exports.createAnonSupabaseClient = createAnonSupabaseClient;
//# sourceMappingURL=supabase.js.map