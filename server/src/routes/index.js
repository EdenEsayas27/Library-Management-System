const express = require("express");
const authRoutes = require("./authRoutes");
const bookRoutes = require("./bookRoutes");
const memberRoutes = require("./memberRoutes");
const borrowRoutes = require("./borrowRoutes");
const staffRoutes = require("./staffRoutes");
const reportRoutes = require("./reportRoutes");
const genreRoutes = require("./genreRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/books", bookRoutes);
router.use("/members", memberRoutes);
router.use("/borrows", borrowRoutes);
router.use("/staff", staffRoutes);
router.use("/reports", reportRoutes);
router.use("/genres", genreRoutes);

module.exports = router;
