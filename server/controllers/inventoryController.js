const prisma = require("../utills/db");

/**
 * =================================================
 * 🧱 INVENTORY CONTROLLER
 * Express.js Style
 * CRUD operations using Prisma ORM
 * =================================================
 */

// 🟢 Add New Inventory
async function addInventory(req, res) {
  try {
    const { productId, totalStock = 0, currentStock = 0, reservedStock = 0 } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    // Check if already exists
    const existing = await prisma.inventory.findUnique({
      where: { productId },
    });

    if (existing) {
      return res.status(400).json({ error: "Inventory already exists for this product" });
    }

    const inventory = await prisma.inventory.create({
      data: {
        productId,
        totalStock,
        currentStock,
        reservedStock,
      },
    });

    return res.status(201).json({
      message: "Inventory added successfully",
      inventory,
    });
  } catch (error) {
    console.error("Error adding inventory:", error);
    return res.status(500).json({ error: "Failed to add inventory" });
  }
}

// 🟡 Get All Inventories
async function getAllInventories(req, res) {
  try {
    const inventories = await prisma.inventory.findMany({
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            mainImage: true,
          },
        },
      },
    orderBy: { createdAt: "desc" },

    });

    return res.status(200).json(inventories);
  } catch (error) {
    console.error("Error fetching inventories:", error);
    return res.status(500).json({ error: "Failed to fetch inventories" });
  }
}

// 🔍 Get One Inventory by ID
async function getInventoryById(req, res) {
  try {
    const { id } = req.params;

    const inventory = await prisma.inventory.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!inventory) {
      return res.status(404).json({ error: "Inventory not found" });
    }

    return res.status(200).json(inventory);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return res.status(500).json({ error: "Failed to fetch inventory" });
  }
}

// ✏️ Update Inventory
async function updateInventory(req, res) {
  try {
    const { id } = req.params;
    const { totalStock, currentStock, reservedStock } = req.body;

    const existing = await prisma.inventory.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Inventory not found" });
    }

    const updated = await prisma.inventory.update({
      where: { id },
      data: {
        totalStock: totalStock ?? existing.totalStock,
        currentStock: currentStock ?? existing.currentStock,
        reservedStock: reservedStock ?? existing.reservedStock,
      },
    });

    return res.status(200).json({
      message: "Inventory updated successfully",
      updated,
    });
  } catch (error) {
    console.error("Error updating inventory:", error);
    return res.status(500).json({ error: "Failed to update inventory" });
  }
}

// 🗑️ Delete Inventory
async function deleteInventory(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.inventory.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Inventory not found" });
    }

    await prisma.inventory.delete({ where: { id } });

    return res.status(200).json({ message: "Inventory deleted successfully" });
  } catch (error) {
    console.error("Error deleting inventory:", error);
    return res.status(500).json({ error: "Failed to delete inventory" });
  }
}

module.exports = {
  addInventory,
  getAllInventories,
  getInventoryById,
  updateInventory,
  deleteInventory,
};
