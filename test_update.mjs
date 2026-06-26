import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function test() {
  const { data: users } = await supabase.auth.admin.listUsers()
  // White is the super admin
  const white = users.users.find(u => u.email === 'contacto@whiteweb.cl')
  // Maverick is the pilot
  const maverick = users.users.find(u => u.email === 'test@correo.cl')

  // Create a client authenticated as White (super admin) to test RLS
  // We can't easily impersonate using supabase-js without knowing the password, but we can just run the query using adminClient to see if the column exists and is updatable.
  
  console.log("Maverick Profile before update:")
  const { data: m1 } = await supabase.from('profiles').select('*').eq('id', maverick.id).single()
  console.log(m1)
  
  // Try to update using admin client just to see if the schema allows it
  const { error } = await supabase.from('profiles').update({ is_active: false }).eq('id', maverick.id)
  if (error) {
    console.error("Update error:", error)
  } else {
    console.log("Update successful via service role")
  }
  
  const { data: m2 } = await supabase.from('profiles').select('*').eq('id', maverick.id).single()
  console.log("Maverick Profile after update:")
  console.log(m2)

  // Revert
  await supabase.from('profiles').update({ is_active: true }).eq('id', maverick.id)
}

test()
