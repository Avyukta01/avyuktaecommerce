const express = require("express");
const router = express.Router();

const { getDashboardStats } = require("../controllers/adminStats");

router.get("/stats", getDashboardStats);

module.exports = router;


