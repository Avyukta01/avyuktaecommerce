const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ✅ GET all videos for a product
async function getProductVideos(req, res) {
  const { productId } = req.params;

  if (!productId) {
    return res.status(400).json({ error: "Missing product ID" });
  }

  try {
    const videos = await prisma.product_video.findMany({
      where: { productId },
      select: {
        id: true,
        productId: true,
        videoUrl: true,
        title: true,
        thumbnail: true,
        order: true,
      },
      orderBy: { order: "asc" },
    });

    console.log(`[getProductVideos] Fetched ${videos.length} videos for productID: ${productId}`);

    if (!videos || videos.length === 0) {
      return res.status(404).json({ error: "No videos found for this product" });
    }

    return res.status(200).json(videos);
  } catch (error) {
    console.error("[getProductVideos] Error:", error);
    return res.status(500).json({ error: "Failed to fetch product videos" });
  }
}

// ✅ POST: Add a new video
async function createProductVideo(req, res) {
  try {
    const { productId, videoUrl, title, thumbnail, order } = req.body;

    if (!productId || !videoUrl) {
      return res.status(400).json({ error: "productId and videoUrl are required" });
    }

    const newVideo = await prisma.product_video.create({
      data: {
        productId,
        videoUrl,
        title: title || "",
        thumbnail: thumbnail || "",
        order: order || 0,
      },
    });

    console.log("[createProductVideo] Created video:", newVideo.id);
    return res.status(201).json(newVideo);
  } catch (error) {
    console.error("[createProductVideo] Error:", error);
    return res.status(500).json({ error: "Failed to create product video" });
  }
}

// ✅ PUT: Update a video by ID
async function updateProductVideo(req, res) {
  const { id } = req.params;

  try {
    const existing = await prisma.product_video.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Video not found" });

    const { videoUrl, title, thumbnail, order } = req.body;

    const updated = await prisma.product_video.update({
      where: { id },
      data: {
        videoUrl: videoUrl || existing.videoUrl,
        title: title ?? existing.title,
        thumbnail: thumbnail ?? existing.thumbnail,
        order: order ?? existing.order,
      },
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error("[updateProductVideo] Error:", error);
    return res.status(500).json({ error: "Failed to update product video" });
  }
}

// ✅ DELETE: Remove all videos for a product
async function deleteProductVideos(req, res) {
  const { productId } = req.params;

  try {
    const deleted = await prisma.product_video.deleteMany({
      where: { productId },
    });

    console.log(`[deleteProductVideos] Deleted ${deleted.count} videos for productID: ${productId}`);
    return res.status(204).send();
  } catch (error) {
    console.error("[deleteProductVideos] Error:", error);
    return res.status(500).json({ error: "Failed to delete product videos" });
  }
}

module.exports = {
  getProductVideos,
  createProductVideo,
  updateProductVideo,
  deleteProductVideos,
};
