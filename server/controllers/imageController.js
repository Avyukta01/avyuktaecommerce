const prisma = require("../utills/db");

// ✅ Get all images for a product
exports.getImagesByProductId = async (req, res) => {
  try {
    const { id } = req.params;

    const images = await prisma.image.findMany({
      where: { productID: id },
      orderBy: { order: "asc" },
    });

    if (!images || images.length === 0) {
      return res.json([]);
    }

    res.json(images);
  } catch (error) {
    console.error(" Error fetching images:", error);
    res.status(500).json({ error: "Failed to fetch images" });
  }
};
