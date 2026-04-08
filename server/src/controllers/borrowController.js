const supabase = require("../config/supabase");
const borrowModel = require("../models/borrowModel");

async function borrowBook(req, res) {
  const { book_id, member_id, due_date } = req.body;
  const { data: book, error: bookError } = await borrowModel.getBookById(book_id);
  if (bookError || !book) return res.status(404).json({ message: "Book not found" });
  if (book.available_copies <= 0) {
    return res.status(400).json({ message: "No available copies to borrow" });
  }

  await borrowModel.decrementAvailableCopies(book_id);
  const { data, error } = await borrowModel.createBorrow({
    book_id,
    member_id,
    due_date,
    borrowed_at: new Date().toISOString(),
  });
  if (error) return res.status(400).json({ message: error.message });
  return res.status(201).json(data);
}

async function returnBook(req, res) {
  const recordId = req.params.id;
  const { data: updated, error } = await borrowModel.markAsReturned(recordId);
  if (error || !updated) return res.status(400).json({ message: "Borrow record not found/open" });
  await borrowModel.incrementAvailableCopies(updated.book_id);
  return res.json(updated);
}

async function overdueBorrows(_req, res) {
  const { data, error } = await supabase
    .from("borrow_records")
    .select("*, books(title), members(full_name)")
    .is("returned_at", null)
    .lt("due_date", new Date().toISOString());
  if (error) return res.status(400).json({ message: error.message });
  return res.json(data);
}

module.exports = { borrowBook, returnBook, overdueBorrows };
