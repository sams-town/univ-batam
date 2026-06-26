/**
 * DEBUG: Cek kondisi profile dan role superadmin
 * Jalankan: node debug_admin.js
 */
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function main() {
  console.log('=== DEBUG SUPERADMIN LOGIN ===\n')

  // 1. Cek roles
  const { data: roles, error: rolesErr } = await supabase.from('roles').select('*')
  console.log('1. Roles tersedia:')
  if (rolesErr) console.error('  ERROR:', rolesErr.message)
  else roles?.forEach(r => console.log(`  - ${r.name} (id: ${r.id})`))

  // 2. Coba sign in
  console.log('\n2. Mencoba login admin@example.com...')
  const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'admin@example.com',
    password: 'admin123'
  })
  if (signInError) {
    console.error('  ERROR signIn:', signInError.message)
    return
  }
  console.log('  ✅ Login berhasil! User ID:', session.user.id)

  // 3. Cek profile
  console.log('\n3. Cek profiles row...')
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle()

  if (profileErr) console.error('  ERROR:', profileErr.message)
  else if (!profile) console.log('  ⚠️  Profile TIDAK ADA di tabel profiles!')
  else {
    console.log('  ✅ Profile ditemukan:')
    console.log('    - id:', profile.id)
    console.log('    - role_id:', profile.role_id)
    console.log('    - role (varchar):', profile.role)
    console.log('    - first_name:', profile.first_name)
    console.log('    - email:', profile.email)
  }

  // 4. Cek RLS: apakah profile.role bisa dibaca
  console.log('\n4. Cek query dengan kolom role...')
  const { data: profileWithRole, error: profileRoleErr } = await supabase
    .from('profiles')
    .select('id, role, role_id')
    .eq('id', session.user.id)
    .maybeSingle()

  if (profileRoleErr) console.error('  ERROR:', profileRoleErr.message)
  else console.log('  Result:', profileWithRole)

  // 5. Jika profile tidak punya role, coba perbaiki
  if (profile && !profile.role) {
    console.log('\n5. Profile tidak punya role! Mencoba auto-fix...')
    const { data: superAdminRole } = await supabase
      .from('roles')
      .select('id, name')
      .eq('name', 'super_admin')
      .maybeSingle()
    
    if (superAdminRole) {
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ role_id: superAdminRole.id, role: 'super_admin' })
        .eq('id', session.user.id)
      if (updateErr) console.error('  ERROR update:', updateErr.message)
      else console.log('  ✅ Role berhasil di-set ke super_admin!')
    }
  }

  console.log('\n=== SELESAI ===')
}

main().catch(console.error)
