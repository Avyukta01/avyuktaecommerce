const express = require("express");
const router = express.Router();
const {
  addInventory,
  getAllInventories,
  getInventoryById,
  updateInventory,
  deleteInventory,
} = require("../controllers/inventoryController");

// POST /api/inventory → add inventory
router.post("/", addInventory);

// GET /api/inventory → get all
router.get("/", getAllInventories);

// GET /api/inventory/:id → get one
router.get("/:id", getInventoryById);

// PUT /api/inventory/:id → update
router.put("/:id", updateInventory);

// DELETE /api/inventory/:id → delete
router.delete("/:id", deleteInventory);

module.exports = router;
