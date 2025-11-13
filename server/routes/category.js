const express = require("express");
const path = require("path");
const multer = require("multer");
const router = express.Router();

const {
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
} = require("../controllers/category");

// 🧩 Multer storage setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/categories/"); // Folder where images will be saved
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName); // e.g., 1731428854123.jpg
  },
});

const upload = multer({ storage });

// 🛣️ Routes
router
  .route("/")
  .get(getAllCategories)
  .post(upload.single("image"), createCategory); // 👈 handles name + image upload

router
  .route("/:id")
  .get(getCategory)
  .put(upload.single("image"), updateCategory) // 👈 handles image update too
  .delete(deleteCategory);

module.exports = router;
