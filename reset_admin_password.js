require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function main() {
  const newPassword = 'admin123'
  
  // Sign in with current password first
  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email: 'admin@example.com',
    password: 'Admin@12345'
  })

  if (signInErr) {
    console.error('Gagal sign in:', signInErr.message)
    return
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) console.error('Gagal update:', error.message)
  else console.log('✅ Password berhasil di-reset ke:', newPassword)
}

main().catch(console.error)
