const express = require("express");
const controller = require("../controllers/memberController");
const { requireAuth } = require("../middlewares/authMiddleware");

const router = express.Router();

// Member management + borrowing history
router.post("/", requireAuth, controller.createMember);
router.patch("/:id", requireAuth, controller.updateMember);
router.delete("/:id", requireAuth, controller.deleteMember);
router.get("/:id/history", requireAuth, controller.memberHistory);

module.exports = router;
