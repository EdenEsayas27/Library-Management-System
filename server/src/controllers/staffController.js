const bcrypt = require("bcryptjs");
const staffModel = require("../models/staffModel");

async function createStaff(req, res) {
  const { password, role = "librarian", ...rest } = req.body;
  const password_hash = await bcrypt.hash(password, 10);
  const { data, error } = await staffModel.createStaff({
    ...rest,
    role,
    password_hash,
  });
  if (error) return res.status(400).json({ message: error.message });
  return res.status(201).json(data);
}

async function deleteStaff(req, res) {
  const { error } = await staffModel.deleteStaff(req.params.id);
  if (error) return res.status(400).json({ message: error.message });
  return res.status(204).send();
}

module.exports = { createStaff, deleteStaff };
