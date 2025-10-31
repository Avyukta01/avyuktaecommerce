// routes/products.js
const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductById,
  upload,
} = require("../controllers/products");

// -------------------------------------------------
//  ROOT  →  GET list  /  POST create (multipart)
// -------------------------------------------------
router
  .route("/")
  .get(getAllProducts)
  .post(upload.any(), createProduct);   // ← FIXED: .any() instead of .array()

// -------------------------------------------------
//  /:id  →  GET one  /  PUT update (multipart)  /  DELETE
// -------------------------------------------------
router
  .route("/:id")
  .get(getProductById)
  .put(upload.any(), updateProduct)     // ← FIXED: .any() instead of .array()
  .delete(deleteProduct);

module.exports = router;