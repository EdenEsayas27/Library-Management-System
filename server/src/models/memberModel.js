const supabase = require("../config/supabase");

async function listMembers({ q }) {
  let query = supabase
    .from("members")
    .select("*")
    .order("created_at", { ascending: false });
  if (q) query = query.ilike("full_name", `%${q}%`);
  return query;
}

async function createMember(payload) {
  return supabase.from("members").insert(payload).select().single();
}

async function updateMember(id, payload) {
  return supabase.from("members").update(payload).eq("id", id).select().single();
}

async function deleteMember(id) {
  return supabase.from("members").delete().eq("id", id);
}

async function getBorrowHistory(memberId) {
  return supabase
    .from("borrow_records")
    .select("id, borrowed_at, due_date, returned_at, books(title, isbn)")
    .eq("member_id", memberId)
    .order("borrowed_at", { ascending: false });
}

module.exports = { listMembers, createMember, updateMember, deleteMember, getBorrowHistory };
