const express = require("express");
const router = express.Router();
const {
  upload,
  addImage,
  getAllImages,
  deleteImage,
  updateImage,
} = require("../controllers/adminWebsiteImageController");

// All routes
router.get("/", getAllImages);
router.post("/", upload.single("image"), addImage);
router.put("/:id", upload.single("image"), updateImage);
router.delete("/:id", deleteImage);

module.exports = router;
