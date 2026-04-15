const supabase = require("../config/supabase");

async function listStaff() {
  return supabase
    .from("staff")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: false });
}

async function createStaff(payload) {
  return supabase.from("staff").insert(payload).select().single();
}

async function deleteStaff(id) {
  return supabase.from("staff").delete().eq("id", id);
}

module.exports = { listStaff, createStaff, deleteStaff };
