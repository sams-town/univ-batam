/**
 * Simulasi exact flow login dari browser (menggunakan anon key seperti client)
 * Jalankan: node debug_client_login.js
 */
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Gunakan ANON key (sama seperti browser)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function main() {
  const email = 'admin@example.com'
  const password = 'admin123'

  console.log('=== SIMULASI LOGIN BROWSER (anon key) ===\n')
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

  // Step 1: signInWithPassword
  console.log('\n--- STEP 1: signInWithPassword ---')
  const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
  if (signInError) {
    console.error('❌ signInError:', JSON.stringify(signInError, null, 2))
    return
  }
  if (!session) {
    console.error('❌ session null!')
    return
  }
  console.log('✅ Session OK. user.id:', session.user.id)

  // Step 2: Query profiles
  console.log('\n--- STEP 2: Query profiles .select("*, role") ---')
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*, role')
    .eq('id', session.user.id)
    .maybeSingle()

  if (profileError) {
    console.error('❌ profileError:', JSON.stringify(profileError, null, 2))
    console.log('\n⚠️  KEMUNGKINAN MASALAH RLS!')
  } else if (!profile) {
    console.log('❌ Profile null! Baris tidak ada di tabel profiles.')
  } else {
    console.log('✅ Profile:', JSON.stringify(profile, null, 2))
    console.log('\nRAW profile.role:', profile.role)
    console.log('typeof profile.role:', typeof profile.role)
  }

  // Step 3: Check auto-heal condition
  const isAdminEmailOrId = session.user.id === 'b6b9d09e-2094-4459-884e-7b0a0caad7b3' || email.toLowerCase().includes('admin')
  const needsHeal = isAdminEmailOrId && (!profile || !profile.role)
  console.log('\n--- STEP 3: Perlu auto-heal?', needsHeal ? 'YA' : 'TIDAK')

  // Step 4: Final role extraction
  if (profile) {
    const role = (typeof profile.role === 'string' ? profile.role : profile?.role?.name) || 'mahasiswa'
    console.log('\n--- STEP 4: Role final:', role)
    
    const redirectMap = {
      super_admin: '/dashboard/admin',
      admin: '/dashboard/admin',
      admin_akademik: '/dashboard/admin',
      dosen: '/dashboard/lecturer',
      employee: '/dashboard/employee',
      karyawan: '/dashboard/employee',
      pegawai: '/dashboard/employee',
      mahasiswa: '/dashboard/student'
    }
    console.log('Redirect ke:', redirectMap[role] || '/dashboard/student')
  }

  console.log('\n=== SELESAI ===')
}

main().catch(console.error)
