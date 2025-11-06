const prisma = require("../utills/db");
const bcrypt = require("bcryptjs");
const { asyncHandler, AppError } = require("../utills/errorHandler");

// ✅ GET /api/admin/list - Get all admins
// ✅ GET /api/admin/list - Get all admins (exclude super_admin)
const listAdmins = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    where: {
      role: "admin", // ✅ only admins
    },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      adminMerchants: {
        include: {
          merchant: {
            select: {
              id: true,
              name: true,
              email: true,
              status: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json(users);
});

// ✅ POST /api/admin/create - Create new admin
const createAdmin = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) throw new AppError("Email and password are required", 400);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) throw new AppError("Invalid email format", 400);
  if (password.length < 8) throw new AppError("Password must be at least 8 characters long", 400);

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new AppError("User with this email already exists", 400);

  const hashedPassword = await bcrypt.hash(password, 14);
  const adminRole = role === "super_admin" ? "super_admin" : "admin";

  const user = await prisma.user.create({
    data: { email, password: hashedPassword, role: adminRole },
    select: { id: true, email: true, role: true, createdAt: true, updatedAt: true },
  });

  return res.status(201).json(user);
});

// ✅ GET /api/admin/:id - Get admin by ID
const getAdminById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const admin = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, role: true, createdAt: true },
  });

  if (!admin) throw new AppError("Admin not found", 404);
  return res.status(200).json(admin);
});

// ✅ POST /api/admin/assign-merchant
const assignMerchant = asyncHandler(async (req, res) => {
  const { adminId, merchantId } = req.body;

  if (!adminId || !merchantId)
    throw new AppError("Admin ID and Merchant ID are required", 400);

  const admin = await prisma.user.findUnique({
    where: { id: adminId },
    select: { id: true, role: true },
  });
  if (!admin) throw new AppError("Admin not found", 404);
  if (admin.role !== "admin" && admin.role !== "super_admin")
    throw new AppError("User is not an admin", 400);

  const merchant = await prisma.merchant.findUnique({ where: { id: merchantId } });
  if (!merchant) throw new AppError("Merchant not found", 404);

  const existing = await prisma.admin_merchant.findUnique({
    where: { adminId_merchantId: { adminId, merchantId } },
  });
  if (existing) throw new AppError("Merchant already assigned to this admin", 400);

  const assignment = await prisma.admin_merchant.create({
    data: { adminId, merchantId },
    include: {
      admin: { select: { id: true, email: true, role: true } },
      merchant: { select: { id: true, name: true, email: true, status: true } },
    },
  });

  return res.status(201).json(assignment);
});

// ✅ DELETE /api/admin/unassign-merchant
const unassignMerchant = asyncHandler(async (req, res) => {
  const { adminId, merchantId } = req.body;

  if (!adminId || !merchantId)
    throw new AppError("Admin ID and Merchant ID are required", 400);

  const assignment = await prisma.admin_merchant.findUnique({
    where: { adminId_merchantId: { adminId, merchantId } },
  });
  if (!assignment) throw new AppError("Assignment not found", 404);

  await prisma.admin_merchant.delete({
    where: { adminId_merchantId: { adminId, merchantId } },
  });

  return res.json({ message: "Merchant unassigned successfully" });
});

// ✅ GET /api/admin/:adminId/merchants
const getAdminMerchants = asyncHandler(async (req, res) => {
  const { adminId } = req.params;

  const merchants = await prisma.admin_merchant.findMany({
    where: { adminId },
    include: {
      merchant: {
        include: { product: { select: { id: true } } },
      },
    },
  });

  const merchantList = merchants.map((am) => ({
    ...am.merchant,
    assignedAt: am.assignedAt,
    productCount: am.merchant.product.length,
  }));

  return res.json(merchantList);
});



// ✅ DELETE /api/admin/:id - Delete an admin by ID
const deleteAdminById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const admin = await prisma.user.findUnique({
    where: { id },
  });

  if (!admin) {
    throw new AppError("user not found", 404);
  }

  // Only delete admin users, not super_admins
  if (admin.role !== "admin") {
    throw new AppError("Cannot delete a super admin", 403);
  }

  await prisma.user.delete({
    where: { id },
  });

  return res.status(204).json({ message: "Admin deleted successfully" });
});
// ✅ PUT /api/admin/:id - Update admin details
const updateAdminById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email, password, role } = req.body;

  const admin = await prisma.user.findUnique({ where: { id } });

  if (!admin) {
    throw new AppError("Admin not found", 404);
  }

  // Prevent changing super_admin accidentally
  if (admin.role === "super_admin" && role !== "super_admin") {
    throw new AppError("You cannot downgrade a super admin", 403);
  }

  const updateData = {};

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new AppError("Invalid email format", 400);
    updateData.email = email;
  }

  if (role) {
    if (!["admin", "super_admin"].includes(role)) {
      throw new AppError("Invalid role", 400);
    }
    updateData.role = role;
  }

  if (password) {
    if (password.length < 8) {
      throw new AppError("Password must be at least 8 characters long", 400);
    }
    const hashedPassword = await bcrypt.hash(password, 14);
    updateData.password = hashedPassword;
  }

  const updatedAdmin = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      role: true,
      updatedAt: true,
    },
  });

  return res.status(200).json(updatedAdmin);
});




// ✅ Export everything properly
module.exports = {
  listAdmins,
  createAdmin,
  getAdminById,
  assignMerchant,
  unassignMerchant,
  getAdminMerchants,
  deleteAdminById,
  updateAdminById
};
