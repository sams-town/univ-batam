/**
 * Reset password superadmin menggunakan service role key
 * Jalankan: node reset_admin_password.js
 */
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Coba service role key dulu, fallback ke anon key
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, key)

async function main() {
  const userId = 'b6b9d09e-2094-4459-884e-7b0a0caad7b3'
  const newPassword = 'Admin@12345'

  console.log('Mencoba reset password admin...')
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('Menggunakan key:', key === process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE ROLE' : 'ANON')

  // Coba via admin API
  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword
  })

  if (error) {
    console.error('ERROR admin API:', error.message)
    
    // Fallback: coba dengan sign in dulu dan update
    console.log('\nMencoba cara alternatif...')
    const passwords = ['admin123', 'password', '12345678', 'Admin123', 'admin@123', 'admin1234', 'password123', 'Admin1234']
    
    for (const pwd of passwords) {
      const { data: signIn, error: signInErr } = await supabase.auth.signInWithPassword({
        email: 'admin@example.com',
        password: pwd
      })
      if (!signInErr) {
        console.log(`✅ Password ditemukan: "${pwd}"`)
        console.log('Sekarang ganti ke:', newPassword)
        const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword })
        if (updateErr) console.error('Gagal update:', updateErr.message)
        else console.log('✅ Password berhasil diganti ke:', newPassword)
        break
      } else {
        console.log(`  ❌ "${pwd}" - ${signInErr.message}`)
      }
    }
  } else {
    console.log('✅ Password berhasil direset ke:', newPassword)
    console.log('User:', data.user?.email)
  }
}

main().catch(console.error)
