const prisma = require("../utills/db");
const { asyncHandler, handleServerError, AppError } = require("../utills/errorHandler");

// ✅ Multer Setup
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ Directly save in "public" (root level)
const uploadDir = path.join(__dirname, '..', '..', 'public');

// 🧱 Ensure "public" exists
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ⚙️ Multer Storage Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // ✅ Save directly in public
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, name);
  },
});

// ✅ File Filter
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|webp/;
  const allowedVideoTypes = /mp4|webm|ogg/;
  const isImage = allowedImageTypes.test(file.mimetype);
  const isVideo = allowedVideoTypes.test(file.mimetype);
  if (isImage || isVideo) cb(null, true);
  else cb(new AppError(`Invalid file type: ${file.mimetype}`, 400), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

// ✅ Helper — only return filename (basename)
const getPublicUrl = (filePath) => {
  return path.basename(filePath);
};

// 🧩 Get All Products
const getAllProducts = asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({
    include: {
      images: { orderBy: { order: 'asc' } },
      videos: { orderBy: { order: 'asc' } },
      category: { select: { name: true } },
    },
  });
  res.status(200).json(products);
});

// 🆕 Create Product
const createProduct = asyncHandler(async (req, res) => {
  const files = req.files;
  const {
    merchantId, slug, title, price, description,
    manufacturer, categoryId, inStock, mainImageIndex,
  } = req.body;

  if (!title) throw new AppError("Missing required field: title", 400);
  if (!merchantId) throw new AppError("Missing required field: merchantId", 400);
  if (!slug) throw new AppError("Missing required field: slug", 400);
  if (!price) throw new AppError("Missing required field: price", 400);
  if (!categoryId) throw new AppError("Missing required field: categoryId", 400);

  const imageFiles = files?.filter(f => f.mimetype.startsWith('image/')) || [];
  const videoFiles = files?.filter(f => !f.mimetype.startsWith('image/')) || [];

  if (imageFiles.length === 0) throw new AppError("At least one image is required", 400);

  const mainIdx = mainImageIndex ? parseInt(mainImageIndex) : 0;
  const mainImageUrl = getPublicUrl(imageFiles[mainIdx]?.path || imageFiles[0]?.path);

  const result = await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        merchantId,
        slug,
        title,
        price: parseInt(price),
        rating: 5,
        description: description || "",
        manufacturer: manufacturer || "",
        categoryId,
        inStock: inStock ? parseInt(inStock) : 1,
        mainImage: mainImageUrl,
      },
    });

    const imageCreates = imageFiles.map((file, idx) => ({
      productID: product.id,
      image: getPublicUrl(file.path),
      order: idx,
      altText: `${title} - image ${idx + 1}`,
    }));

    const videoCreates = videoFiles.map((file, idx) => ({
      productId: product.id,
      videoUrl: getPublicUrl(file.path),
      title: `${title} video ${idx + 1}`,
      order: idx,
    }));

    if (imageCreates.length > 0) await tx.image.createMany({ data: imageCreates });
    if (videoCreates.length > 0) await tx.product_video.createMany({ data: videoCreates });

    return await tx.product.findUnique({
      where: { id: product.id },
      include: {
        images: { orderBy: { order: 'asc' } },
        videos: { orderBy: { order: 'asc' } },
        category: { select: { name: true } },
      },
    });
  });

  res.status(201).json(result);
});

// ✏️ Update Product
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const files = req.files || [];
  const {
    merchantId, slug, title, price, rating, description, manufacturer,
    categoryId, inStock, mainImageIndex, deleteImageIds, deleteVideoIds,
  } = req.body;

  if (!id) throw new AppError("Product ID is required", 400);

  const existingProduct = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { select: { imageID: true, image: true } },
      videos: { select: { id: true } },
    },
  });
  if (!existingProduct) throw new AppError("Product not found", 404);

  const updatedProduct = await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        merchantId: merchantId || undefined,
        title: title || undefined,
        slug: slug || undefined,
        price: price ? parseInt(price) : undefined,
        rating: rating ? parseInt(rating) : undefined,
        description: description || undefined,
        manufacturer: manufacturer || undefined,
        categoryId: categoryId || undefined,
        inStock: inStock ? parseInt(inStock) : undefined,
      },
    });

    if (deleteImageIds) {
      const ids = deleteImageIds.split(',').map(s => s.trim()).filter(Boolean);
      if (ids.length > 0) await tx.image.deleteMany({ where: { imageID: { in: ids }, productID: id } });
    }

    if (deleteVideoIds) {
      const ids = deleteVideoIds.split(',').map(s => s.trim()).filter(Boolean);
      if (ids.length > 0) await tx.product_video.deleteMany({ where: { id: { in: ids }, productId: id } });
    }

    const newImageFiles = files.filter(f => f.mimetype.startsWith('image/'));
    const currentImageCount = await tx.image.count({ where: { productID: id } });

    if (newImageFiles.length > 0) {
      const imageData = newImageFiles.map((file, idx) => ({
        productID: id,
        image: getPublicUrl(file.path),
        order: currentImageCount + idx,
        altText: `${title || existingProduct.title} - image ${idx + 1}`,
      }));
      await tx.image.createMany({ data: imageData });

      const mainIdx = mainImageIndex ? parseInt(mainImageIndex) : 0;
      const mainImageUrl = getPublicUrl(newImageFiles[mainIdx]?.path || newImageFiles[0]?.path);
      if (mainImageUrl) {
        await tx.product.update({ where: { id }, data: { mainImage: mainImageUrl } });
      }
    }

    const newVideoFiles = files.filter(f => !f.mimetype.startsWith('image/'));
    const currentVideoCount = await tx.product_video.count({ where: { productId: id } });

    if (newVideoFiles.length > 0) {
      const videoData = newVideoFiles.map((file, idx) => ({
        productId: id,
        videoUrl: getPublicUrl(file.path),
        title: `${title || existingProduct.title} - video ${idx + 1}`,
        order: currentVideoCount + idx,
      }));
      await tx.product_video.createMany({ data: videoData });
    }

    return await tx.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: 'asc' } },
        videos: { orderBy: { order: 'asc' } },
        category: { select: { name: true } },
      },
    });
  });

  res.status(200).json(updatedProduct);
});

// ❌ Delete Product
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new AppError("Product ID is required", 400);

  const related = await prisma.customer_order_product.findMany({ where: { productId: id } });
  if (related.length > 0) throw new AppError("Cannot delete: linked to orders", 400);

  await prisma.product.delete({ where: { id } });
  res.status(204).send();
});

// 🔍 Search
const searchProducts = asyncHandler(async (req, res) => {
  const { query } = req.query;
  if (!query) throw new AppError("Query parameter required", 400);

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { description: { contains: query } },
      ],
    },
    include: { images: { take: 1 }, category: { select: { name: true } } },
  });
  res.json(products);
});

// 🔎 Get by ID
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new AppError("Product ID required", 400);

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: { order: 'asc' } },
      videos: { orderBy: { order: 'asc' } },
    },
  });
  if (!product) throw new AppError("Product not found", 404);
  res.status(200).json(product);
});

// ✅ Export
module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductById,
  upload,
};
