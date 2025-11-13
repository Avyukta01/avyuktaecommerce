const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { asyncHandler, AppError } = require("../utills/errorHandler");

// 🟢 CREATE CATEGORY  
const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim().length === 0) {
    throw new AppError("Category name is required", 400);
  }

  // If image uploaded via multer, store path
  let imageUrl = null;
  if (req.file) {
    // Use relative URL (to serve it later)
    imageUrl = `/uploads/categories/${req.file.filename}`;
  }

  const category = await prisma.category.create({
    data: {
      name: name.trim(),
      image: imageUrl, // ✅ save image in DB
    },
  });

  return res.status(201).json({
    message: "Category created successfully",
    category,
  });
});



// 🟡 UPDATE CATEGORY
const updateCategory = asyncHandler(async (request, response) => {
  const { id } = request.params;
  const { name } = request.body;
  const imageFile = request.file; // 👈 multer file info

  if (!id) {
    throw new AppError("Category ID is required", 400);
  }

  const existingCategory = await prisma.category.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    throw new AppError("Category not found", 404);
  }

  // If new image uploaded, replace it; otherwise keep old
  const updatedCategory = await prisma.category.update({
    where: { id: existingCategory.id },
    data: {
      name: name?.trim() || existingCategory.name,
      image: imageFile
        ? `/uploads/categories/${imageFile.filename}`
        : existingCategory.image,
    },
  });

  return response.status(200).json(updatedCategory);
});

// 🔴 DELETE CATEGORY (unchanged)
const deleteCategory = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("Category ID is required", 400);
  }

  const existingCategory = await prisma.category.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    throw new AppError("Category not found", 404);
  }

  // Check if category has products
  const productsWithCategory = await prisma.product.findFirst({
    where: { categoryId: id },
  });

  if (productsWithCategory) {
    throw new AppError("Cannot delete category that has products", 400);
  }

  await prisma.category.delete({
    where: { id },
  });

  return response.status(204).send();
});

// 🔵 GET ONE CATEGORY (unchanged)
const getCategory = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("Category ID is required", 400);
  }

  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return response.status(200).json(category);
});

// 🟣 GET ALL CATEGORIES (unchanged)
const getAllCategories = asyncHandler(async (request, response) => {
  const categories = await prisma.category.findMany({});
  return response.json(categories);
});

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategories,
};
