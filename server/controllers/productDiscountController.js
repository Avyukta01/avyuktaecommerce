const prisma = require("../utills/db");

// ✅ Create or Update Discounts for a Product
exports.upsertProductDiscounts = async (req, res) => {
  try {
    const { productId, discounts } = req.body;

    if (!productId || !Array.isArray(discounts) || discounts.length === 0) {
      return res.status(400).json({ message: "productId and discounts array required" });
    }

    console.log("📦 Received discounts:", discounts);
    console.log("🧾 Final discount data to insert:", discounts.map(d => ({
      productId,
      minQuantity: Number(d.minQuantity),
      maxQuantity: Number(d.maxQuantity),
      discountPercent: Number(d.discountPercent),
    })));

    // ✅ Transaction: remove old + insert new
    const [deleted, created] = await prisma.$transaction([
      prisma.product_discount.deleteMany({ where: { productId } }),
      prisma.product_discount.createMany({
        data: discounts.map((d) => ({
          productId,
          minQuantity: Number(d.minQuantity),
          maxQuantity: Number(d.maxQuantity),
          discountPercent: Number(d.discountPercent),
        })),
      }),
    ]);

    console.log("✅ Discounts inserted:", created.count);

    res.status(200).json({
      message: "✅ Discounts saved successfully",
      count: created.count,
    });
  } catch (error) {
    console.error("❌ Error saving discounts:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// GET /api/product-discounts/:productId
exports.getProductDiscounts = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    const discounts = await prisma.product_discount.findMany({
      where: { productId },
      orderBy: [{ minQuantity: "asc" }, { maxQuantity: "asc" }],
      select: {
        id: true,
        minQuantity: true,
        maxQuantity: true,
        discountPercent: true,
      },
    });

    return res.status(200).json(discounts);
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};
