const supabase = require("../config/supabase");

async function createStaff(payload) {
  return supabase.from("staff").insert(payload).select().single();
}

async function deleteStaff(id) {
  return supabase.from("staff").delete().eq("id", id);
}

module.exports = { createStaff, deleteStaff };
