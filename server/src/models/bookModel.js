const supabase = require("../config/supabase");

async function createBook(payload) {
  return supabase.from("books").insert(payload).select().single();
}

async function getBooks({ genre, q }) {
  let query = supabase.from("books").select("*").order("created_at", { ascending: false });
  if (genre) query = query.eq("genre_id", genre);
  if (q) query = query.ilike("title", `%${q}%`);
  return query;
}

async function updateBook(id, payload) {
  return supabase.from("books").update(payload).eq("id", id).select().single();
}

async function deleteBook(id) {
  return supabase.from("books").delete().eq("id", id);
}

module.exports = { createBook, getBooks, updateBook, deleteBook };
