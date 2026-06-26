const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*, role:roles(name)');

  if (error) {
    console.error("Error fetching profiles:", error);
  } else {
    console.log("All Profiles:");
    console.log(profiles);
  }
}

checkUser();
