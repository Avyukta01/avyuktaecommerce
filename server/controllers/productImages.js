const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * GET: /api/productImages/:productId
 * Fetch all images for a specific product
 */
async function getSingleProductImages(request, response) {
  const { productId } = request.params;


  try {
    const images = await prisma.image.findMany({
      where: { productID: productId },
      select: {
        imageID: true,
        productID: true,
        image: true,
        altText: true,
        order: true,
      },
    });

  

    if (!images || images.length === 0) {
      return response.status(404).json({ error: "Images not found" });
    }

    return response.status(200).json(images);
  } catch (error) {
    console.error("[getSingleProductImages] Error:", error);
    return response.status(500).json({ error: "Failed to fetch product images" });
  }
}

/**
 * POST: /api/productImages
 * Create a new image for a product
 */
async function createImage(request, response) {
  try {
    const { productID, image, altText, order } = request.body;

    if (!productID || !image) {
      return response
        .status(400)
        .json({ error: "productID and image are required" });
    }

    const createdImage = await prisma.image.create({
      data: {
        productID,
        image,
        altText: altText || null,
        order: order !== undefined ? order : 0,
      },
    });

    console.log("[createImage] Created:", createdImage.imageID);
    return response.status(201).json(createdImage);
  } catch (error) {
    console.error("[createImage] Error creating image:", error);
    return response.status(500).json({ error: "Error creating image" });
  }
}

/**
 * PUT: /api/productImages/:imageID
 * Update an existing image by imageID
 */
async function updateImage(request, response) {
  try {
    const { imageID } = request.params;
    const { image, altText, order } = request.body;

    if (!imageID) {
      return response.status(400).json({ error: "imageID is required" });
    }

    const existingImage = await prisma.image.findUnique({
      where: { imageID },
    });

    if (!existingImage) {
      return response.status(404).json({ error: "Image not found" });
    }

    const updatedImage = await prisma.image.update({
      where: { imageID },
      data: {
        image: image || existingImage.image,
        altText: altText !== undefined ? altText : existingImage.altText,
        order: order !== undefined ? order : existingImage.order,
      },
    });

    console.log("[updateImage] Updated:", updatedImage.imageID);
    return response.status(200).json(updatedImage);
  } catch (error) {
    console.error("[updateImage] Error:", error);
    return response.status(500).json({ error: "Error updating image" });
  }
}

/**
 * DELETE: /api/productImages/:productId
 * Delete all images belonging to a specific product
 */
async function deleteImage(request, response) {
  try {
    const { productId } = request.params; // ✅ fixed param name

    if (!productId) {
      return response.status(400).json({ error: "Missing product ID" });
    }

    const deleted = await prisma.image.deleteMany({
      where: { productID: productId },
    });

    console.log(
      `[deleteImage] Deleted ${deleted.count} images for productID: ${productId}`
    );

    return response.status(204).send();
  } catch (error) {
    console.error("[deleteImage] Error deleting images:", error);
    return response.status(500).json({ error: "Error deleting images" });
  }
}

module.exports = {
  getSingleProductImages,
  createImage,
  updateImage,
  deleteImage,
};
