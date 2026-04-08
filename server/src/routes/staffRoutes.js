const express = require("express");
const controller = require("../controllers/staffController");
const { requireAuth } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");

const router = express.Router();

// Staff management and role assignment (admin only)
router.post("/", requireAuth, requireRole("admin"), controller.createStaff);
router.delete("/:id", requireAuth, requireRole("admin"), controller.deleteStaff);

module.exports = router;
