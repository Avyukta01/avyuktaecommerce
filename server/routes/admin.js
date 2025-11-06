const express = require("express");
const router = express.Router();

const { getDashboardStats } = require("../controllers/adminStats");
const {
  listAdmins,
  createAdmin,
  assignMerchant,
  unassignMerchant,
  getAdminMerchants,
  getAdminById,
  deleteAdminById,
  updateAdminById, // ✅ added
} = require("../controllers/admin");

// Dashboard stats
router.get("/stats", getDashboardStats);

// ✅ new route
// Admin management
router.get("/list", listAdmins);
router.post("/create", createAdmin);

router.put("/:id", updateAdminById);
router.delete("/:id", deleteAdminById);


// Admin-Merchant assignment
router.post("/assign-merchant", assignMerchant);
router.delete("/unassign-merchant", unassignMerchant);
router.get("/:adminId/merchants", getAdminMerchants);
router.get("/:id", getAdminById); 

module.exports = router;


