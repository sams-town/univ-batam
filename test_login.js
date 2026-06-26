const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Attempting sign in...");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@example.com',
    password: 'admin123'
  });

  if (error) {
    console.error("Sign in failed:", error.message, error);
  } else {
    console.log("Sign in succeeded:", data);
  }
}

test();
