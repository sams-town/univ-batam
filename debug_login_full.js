/**
 * Test login step-by-step, print exact errors
 * Run: node debug_login_full.js
 */
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL

console.log('Supabase URL:', URL)
console.log('Anon Key (partial):', ANON_KEY?.slice(0, 30) + '...')

const supabase = createClient(URL, ANON_KEY)

async function testLogin(email, password) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`Testing login: ${email} / ${password}`)
  console.log('='.repeat(60))

  // Step 1: Sign in
  console.log('\n[1] supabase.auth.signInWithPassword...')
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
  
  if (signInError) {
    console.error('❌ SIGN IN ERROR:')
    console.error('  code:', signInError.status)
    console.error('  message:', signInError.message)
    console.error('  name:', signInError.name)
    return
  }

  const session = signInData.session
  if (!session) {
    console.error('❌ Session is NULL despite no error!')
    return
  }
  console.log('✅ Sign in OK')
  console.log('  user.id:', session.user.id)
  console.log('  user.email:', session.user.email)

  // Step 2: Query profile with role column
  console.log('\n[2] Query profiles with "role" column...')
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*, role')
    .eq('id', session.user.id)
    .maybeSingle()

  if (profileError) {
    console.error('❌ PROFILE QUERY ERROR:')
    console.error('  code:', profileError.code)
    console.error('  message:', profileError.message)
    console.error('  hint:', profileError.hint)
    console.error('  details:', profileError.details)
    return
  }
  if (!profile) {
    console.error('❌ Profile returned NULL (no row found)')
    return
  }
  console.log('✅ Profile OK')
  console.log('  profile.id:', profile.id)
  console.log('  profile.role:', profile.role)
  console.log('  typeof profile.role:', typeof profile.role)
  console.log('  profile.role_id:', profile.role_id)

  // Step 3: Role resolution
  console.log('\n[3] Role resolution...')
  const role = (typeof profile.role === 'string' ? profile.role : profile?.role?.name) || 'mahasiswa'
  console.log('  Final role:', role)

  // Step 4: Redirect target
  const redirectMap = {
    super_admin: '/dashboard/admin',
    admin: '/dashboard/admin',
    admin_akademik: '/dashboard/admin',
    dosen: '/dashboard/lecturer',
    employee: '/dashboard/employee',
    karyawan: '/dashboard/employee',
    pegawai: '/dashboard/employee',
    mahasiswa: '/dashboard/student',
  }
  const redirect = redirectMap[role] || '/dashboard/student'
  console.log('  Would redirect to:', redirect)

  // Step 5: Check academic year
  console.log('\n[4] Check academic_years...')
  const { data: ay, error: ayErr } = await supabase
    .from('academic_years')
    .select('*')
    .eq('is_active', true)
    .maybeSingle()
  if (ayErr) console.error('  ❌ academic_years error:', ayErr.message)
  else if (!ay) console.log('  ⚠️  No active academic year found')
  else console.log('  ✅ Active academic year:', ay.name)

  console.log('\n✅ LOGIN FLOW COMPLETE - no errors found in backend')
  console.log('  Issue is likely in the frontend/browser/middleware layer')
}

testLogin('admin@example.com', 'admin123').catch(console.error)
