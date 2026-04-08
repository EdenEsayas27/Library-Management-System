const express = require("express");
const controller = require("../controllers/genreController");
const { requireAuth } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");

const router = express.Router();

// Genre management routes
router.get("/", requireAuth, controller.listGenres);
router.post("/", requireAuth, requireRole("admin", "librarian"), controller.createGenre);
router.patch("/:id", requireAuth, requireRole("admin", "librarian"), controller.updateGenre);
router.delete("/:id", requireAuth, requireRole("admin"), controller.deleteGenre);

module.exports = router;
