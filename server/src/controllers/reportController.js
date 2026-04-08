const supabase = require("../config/supabase");

async function libraryStats(_req, res) {
  const [books, members, activeBorrows, overdue] = await Promise.all([
    supabase.from("books").select("id", { count: "exact", head: true }),
    supabase.from("members").select("id", { count: "exact", head: true }),
    supabase.from("borrow_records").select("id", { count: "exact", head: true }).is("returned_at", null),
    supabase
      .from("borrow_records")
      .select("id", { count: "exact", head: true })
      .is("returned_at", null)
      .lt("due_date", new Date().toISOString()),
  ]);

  return res.json({
    total_books: books.count || 0,
    total_members: members.count || 0,
    active_borrows: activeBorrows.count || 0,
    overdue_books: overdue.count || 0,
  });
}

async function popularGenres(_req, res) {
  // Example aggregated query: stores borrow_count per genre in a materialized/report table
  const { data, error } = await supabase
    .from("genre_popularity")
    .select("genre_name, borrow_count")
    .order("borrow_count", { ascending: false })
    .limit(10);

  if (error) return res.status(400).json({ message: error.message });
  return res.json(data);
}

module.exports = { libraryStats, popularGenres };
