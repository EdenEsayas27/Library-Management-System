const express = require("express");
const { login, logout } = require("../controllers/authController");
const { requireAuth } = require("../middlewares/authMiddleware");

const router = express.Router();

// JWT authentication routes
router.post("/login", login);
router.post("/logout", requireAuth, logout);

module.exports = router;
