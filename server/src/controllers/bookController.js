const bookModel = require("../models/bookModel");

async function createBook(req, res) {
  const { data, error } = await bookModel.createBook(req.body);
  if (error) return res.status(400).json({ message: error.message });
  return res.status(201).json(data);
}

async function listBooks(req, res) {
  const { data, error } = await bookModel.getBooks(req.query);
  if (error) return res.status(400).json({ message: error.message });
  return res.json(data);
}

async function updateBook(req, res) {
  const { data, error } = await bookModel.updateBook(req.params.id, req.body);
  if (error) return res.status(400).json({ message: error.message });
  return res.json(data);
}

async function deleteBook(req, res) {
  const { error } = await bookModel.deleteBook(req.params.id);
  if (error) return res.status(400).json({ message: error.message });
  return res.status(204).send();
}

module.exports = { createBook, listBooks, updateBook, deleteBook };
