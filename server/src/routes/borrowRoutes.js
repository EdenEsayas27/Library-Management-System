const express = require("express");
const controller = require("../controllers/borrowController");
const { requireAuth } = require("../middlewares/authMiddleware");

const router = express.Router();

// Borrow/return system with due date handling
router.post("/", requireAuth, controller.borrowBook);
router.patch("/:id/return", requireAuth, controller.returnBook);
router.get("/overdue", requireAuth, controller.overdueBorrows);

module.exports = router;
