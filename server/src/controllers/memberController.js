const memberModel = require("../models/memberModel");

async function listMembers(req, res) {
  const { data, error } = await memberModel.listMembers(req.query);
  if (error) return res.status(400).json({ message: error.message });
  return res.json(data);
}

async function createMember(req, res) {
  const { data, error } = await memberModel.createMember(req.body);
  if (error) return res.status(400).json({ message: error.message });
  return res.status(201).json(data);
}

async function updateMember(req, res) {
  const { data, error } = await memberModel.updateMember(req.params.id, req.body);
  if (error) return res.status(400).json({ message: error.message });
  return res.json(data);
}

async function deleteMember(req, res) {
  const { error } = await memberModel.deleteMember(req.params.id);
  if (error) return res.status(400).json({ message: error.message });
  return res.status(204).send();
}

async function memberHistory(req, res) {
  const { data, error } = await memberModel.getBorrowHistory(req.params.id);
  if (error) return res.status(400).json({ message: error.message });
  return res.json(data);
}

module.exports = { listMembers, createMember, updateMember, deleteMember, memberHistory };
