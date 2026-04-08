const supabase = require("../config/supabase");

async function listGenres() {
  return supabase.from("genres").select("*").order("name", { ascending: true });
}

async function createGenre(payload) {
  return supabase.from("genres").insert(payload).select().single();
}

async function updateGenre(id, payload) {
  return supabase.from("genres").update(payload).eq("id", id).select().single();
}

async function deleteGenre(id) {
  return supabase.from("genres").delete().eq("id", id);
}

module.exports = { listGenres, createGenre, updateGenre, deleteGenre };
