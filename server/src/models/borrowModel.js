const supabase = require("../config/supabase");

async function getBookById(bookId) {
  return supabase.from("books").select("id, available_copies").eq("id", bookId).single();
}

async function decrementAvailableCopies(bookId) {
  // Atomic decrement in SQL function is better in production; this is starter logic
  const { data, error } = await getBookById(bookId);
  if (error) return { data: null, error };
  return supabase
    .from("books")
    .update({ available_copies: data.available_copies - 1 })
    .eq("id", bookId);
}

async function incrementAvailableCopies(bookId) {
  const { data, error } = await getBookById(bookId);
  if (error) return { data: null, error };
  return supabase
    .from("books")
    .update({ available_copies: data.available_copies + 1 })
    .eq("id", bookId);
}

async function createBorrow(payload) {
  return supabase.from("borrow_records").insert(payload).select().single();
}

async function markAsReturned(recordId) {
  return supabase
    .from("borrow_records")
    .update({ returned_at: new Date().toISOString() })
    .eq("id", recordId)
    .is("returned_at", null)
    .select()
    .single();
}

module.exports = {
  getBookById,
  decrementAvailableCopies,
  incrementAvailableCopies,
  createBorrow,
  markAsReturned,
};
