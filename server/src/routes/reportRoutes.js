const express = require("express");
const controller = require("../controllers/reportController");
const { requireAuth } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");

const router = express.Router();

// Reports: overdue books, popular genres, and high-level statistics
router.get("/stats", requireAuth, controller.libraryStats);
router.get("/genres/popular", requireAuth, requireRole("admin", "librarian"), controller.popularGenres);

module.exports = router;
