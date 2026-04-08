const express = require("express");
const controller = require("../controllers/bookController");
const { requireAuth } = require("../middlewares/authMiddleware");

const router = express.Router();

// Book management: CRUD + search/filter through query params ?q=&genre=
router.get("/", requireAuth, controller.listBooks);
router.post("/", requireAuth, controller.createBook);
router.patch("/:id", requireAuth, controller.updateBook);
router.delete("/:id", requireAuth, controller.deleteBook);

module.exports = router;
