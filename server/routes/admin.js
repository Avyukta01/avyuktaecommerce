const express = require("express");
const router = express.Router();

const { getDashboardStats } = require("../controllers/adminStats");
const {
  listAdmins,
  createAdmin,
  assignMerchant,
  unassignMerchant,
  getAdminMerchants
} = require("../controllers/admin");

// Dashboard stats
router.get("/stats", getDashboardStats);

// Admin management
router.get("/list", listAdmins);
router.post("/create", createAdmin);

// Admin-Merchant assignment
router.post("/assign-merchant", assignMerchant);
router.delete("/unassign-merchant", unassignMerchant);
router.get("/:adminId/merchants", getAdminMerchants);

module.exports = router;


