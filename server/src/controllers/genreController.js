const genreModel = require("../models/genreModel");

async function listGenres(_req, res) {
  const { data, error } = await genreModel.listGenres();
  if (error) return res.status(400).json({ message: error.message });
  return res.json(data);
}

async function createGenre(req, res) {
  const { data, error } = await genreModel.createGenre(req.body);
  if (error) return res.status(400).json({ message: error.message });
  return res.status(201).json(data);
}

async function updateGenre(req, res) {
  const { data, error } = await genreModel.updateGenre(req.params.id, req.body);
  if (error) return res.status(400).json({ message: error.message });
  return res.json(data);
}

async function deleteGenre(req, res) {
  const { error } = await genreModel.deleteGenre(req.params.id);
  if (error) return res.status(400).json({ message: error.message });
  return res.status(204).send();
}

module.exports = { listGenres, createGenre, updateGenre, deleteGenre };
