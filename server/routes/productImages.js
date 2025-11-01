const express = require('express');
const router = express.Router();
const {
  getSingleProductImages,
  createImage,
  updateImage,
  deleteImage
} = require('../controllers/productImages');

// GET all images for a product
router.route('/:productId').get(getSingleProductImages);

// POST create new image
router.route('/').post(createImage);

// PUT update single image (by imageID)
router.route('/:imageID').put(updateImage);

// DELETE all images for a product
router.route('/:productId').delete(deleteImage);

module.exports = router;