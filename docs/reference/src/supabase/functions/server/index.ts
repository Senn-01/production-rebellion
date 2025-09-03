import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js'

const app = new Hono()

// Enable CORS and logging
app.use('*', cors())
app.use('*', logger(console.log))

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// Sign up route
app.post('/make-server-f328b38c/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json()
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      user_metadata: { name: name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })

    if (error) {
      console.log('Signup error:', error)
      return c.json({ error: error.message }, 400)
    }

    return c.json({ user: data.user })
  } catch (error) {
    console.log('Server error during signup:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Health check route
app.get('/make-server-f328b38c/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Start the server
Deno.serve(app.fetch)