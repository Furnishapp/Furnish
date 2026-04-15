import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { password } = await req.json()
    const adminPassword = Deno.env.get('ADMIN_PASSWORD')

    // Fail-closed: if the secret is not configured, deny all requests
    if (!adminPassword || !password || password !== adminPassword) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are auto-injected by Supabase —
    // they never reach the client and bypass Row-Level Security entirely.
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const [
      { data: users, error: userErr },
      { data: projects, error: projErr },
    ] = await Promise.all([
      supabase.rpc('get_admin_stats'),
      supabase.rpc('get_admin_projects'),
    ])

    if (userErr || projErr) {
      return new Response(
        JSON.stringify({ error: (userErr ?? projErr)!.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(JSON.stringify({ users, projects }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
