const express = require("express");
const router = express.Router();
const {
  getProductVideos,
  createProductVideo,
  updateProductVideo,
  deleteProductVideos,
} = require("../controllers/productVideos");

// GET all videos for a product
router.route("/:productId").get(getProductVideos);

// POST create a new video
router.route("/").post(createProductVideo);

// PUT update a video (by video id)
router.route("/:id").put(updateProductVideo);

// DELETE all videos for a product
router.route("/:productId").delete(deleteProductVideos);

module.exports = router;
