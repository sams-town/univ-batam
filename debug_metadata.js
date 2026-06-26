require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function main() {
  // Check what's in auth.users metadata for admin
  const { data, error } = await supabase.auth.admin.getUserById('b6b9d09e-2094-4459-884e-7b0a0caad7b3')
  if (error) { console.error('Error:', error.message); return }
  
  console.log('user_metadata:', JSON.stringify(data.user.user_metadata, null, 2))
  console.log('app_metadata:', JSON.stringify(data.user.app_metadata, null, 2))
  console.log('raw_user_meta_data (user_metadata) role:', data.user.user_metadata?.role)
}

main().catch(console.error)
