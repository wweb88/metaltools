import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const adminClient = createClient(supabaseUrl, supabaseServiceKey)

async function test() {
  const { data: users } = await adminClient.auth.admin.listUsers()
  const white = users.users.find(u => u.email === 'contacto@whiteweb.cl')
  const maverick = users.users.find(u => u.email === 'test@correo.cl')

  // We need to login as White to test the authenticated client. Since we don't have the password, we can generate a magic link or use a special trick.
  // Actually, there's no way to easily login without a password.
  // BUT we can use the admin API to generate a session!
  
  const { data: linkData } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: 'contacto@whiteweb.cl'
  })
  
  console.log("We can't easily execute a query as the user without a session token.")
  // However, Supabase JS lets you set the session if we had an access token.
  // Let's just create a custom JWT or execute an RPC...
}

test()
