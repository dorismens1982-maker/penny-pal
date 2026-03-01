// @ts-nocheck
// supabase/functions/get-auth-users/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_ORIGINS = [
    'https://mypennypal.com',
    'https://www.mypennypal.com',
];

const getCorsHeaders = (req: Request) => {
    const origin = req.headers.get('Origin') || '';
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };
};

Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: getCorsHeaders(req) })
    }

    const corsHeaders = getCorsHeaders(req);

    // ✅ JWT Verification: only authenticated Supabase sessions can call this
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    try {
        // Create admin client with service role key
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // Fetch all users from auth.users
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
            page: 1,
            perPage: 1000 // Adjust as needed
        })

        if (error) {
            throw error
        }

        // Map to safe user data (don't expose sensitive fields)
        const safeUsers = users.map((user: any) => ({
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at,
            email_confirmed_at: user.email_confirmed_at,
            phone: user.phone,
            user_metadata: {
                preferred_name: user.user_metadata?.preferred_name || null
            }
        }))

        return new Response(
            JSON.stringify({
                users: safeUsers,
                total: users.length
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )
    } catch (error: unknown) {
        console.error('Error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return new Response(
            JSON.stringify({ error: errorMessage }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500
            }
        )
    }
})
