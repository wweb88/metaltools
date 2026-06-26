import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function check() {
  const { data: users, error: authError } = await supabase.auth.admin.listUsers()
  console.log('--- AUTH USERS ---')
  console.log(users.users.map(u => ({ id: u.id, email: u.email })))

  const { data: profiles, error: profError } = await supabase.from('profiles').select('*')
  console.log('\n--- PROFILES ---')
  console.log(profiles)
}

check()
