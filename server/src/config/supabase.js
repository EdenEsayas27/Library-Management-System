const env = require("./env");
const { createClient } = require("@supabase/supabase-js");

if (!env.supabaseUrl || !env.supabaseKey) {
  // Fail fast if env vars are missing so startup errors are obvious
  throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env");
}

const supabase = createClient(env.supabaseUrl, env.supabaseKey);
// async function testConnection() {
//   try {
//     const { data, error } = await supabase
//       .from('test_connection')  // the table you just created
//       .select('*')
//       .limit(1);

//     if (error) throw error;

//     console.log('Database connection successful! Sample data:', data);
//   } catch (err) {
//     console.error('Database connection error:', err);
//   }
// }

// testConnection();

module.exports = supabase;




