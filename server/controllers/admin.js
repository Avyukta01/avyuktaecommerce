const prisma = require("../utills/db");
const bcrypt = require("bcryptjs");
const { asyncHandler, AppError } = require("../utills/errorHandler");

// GET /api/admin/list - Get all admins
const listAdmins = asyncHandler(async (request, response) => {
  const users = await prisma.user.findMany({
    where: {
      role: {
        in: ["admin", "super_admin"]
      }
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
              status: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return response.json(users);
});

// POST /api/admin/create - Create new admin
const createAdmin = asyncHandler(async (request, response) => {
  const { email, password, role } = request.body;

  // Validation
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError("Invalid email format", 400);
  }

  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters long", 400);
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new AppError("User with this email already exists", 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 14);

  // Create admin user
  const adminRole = role === "super_admin" ? "super_admin" : "admin";
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: adminRole,
    },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return response.status(201).json(user);
});

// POST /api/admin/assign-merchant - Assign merchant to admin
const assignMerchant = asyncHandler(async (request, response) => {
  const { adminId, merchantId } = request.body;

  if (!adminId || !merchantId) {
    throw new AppError("Admin ID and Merchant ID are required", 400);
  }

  // Check if admin exists and is actually an admin
  const admin = await prisma.user.findUnique({
    where: { id: adminId },
    select: { id: true, role: true }
  });

  if (!admin) {
    throw new AppError("Admin not found", 404);
  }

  if (admin.role !== "admin" && admin.role !== "super_admin") {
    throw new AppError("User is not an admin", 400);
  }

  // Check if merchant exists
  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId }
  });

  if (!merchant) {
    throw new AppError("Merchant not found", 404);
  }

  // Check if assignment already exists
  const existing = await prisma.admin_merchant.findUnique({
    where: {
      adminId_merchantId: {
        adminId,
        merchantId
      }
    }
  });

  if (existing) {
    throw new AppError("Merchant is already assigned to this admin", 400);
  }

  // Create assignment
  const assignment = await prisma.admin_merchant.create({
    data: {
      adminId,
      merchantId
    },
    include: {
      admin: {
        select: {
          id: true,
          email: true,
          role: true
        }
      },
      merchant: {
        select: {
          id: true,
          name: true,
          email: true,
          status: true
        }
      }
    }
  });

  return response.status(201).json(assignment);
});

// DELETE /api/admin/unassign-merchant - Unassign merchant from admin
const unassignMerchant = asyncHandler(async (request, response) => {
  const { adminId, merchantId } = request.body;

  if (!adminId || !merchantId) {
    throw new AppError("Admin ID and Merchant ID are required", 400);
  }

  const assignment = await prisma.admin_merchant.findUnique({
    where: {
      adminId_merchantId: {
        adminId,
        merchantId
      }
    }
  });

  if (!assignment) {
    throw new AppError("Assignment not found", 404);
  }

  await prisma.admin_merchant.delete({
    where: {
      adminId_merchantId: {
        adminId,
        merchantId
      }
    }
  });

  return response.json({ message: "Merchant unassigned successfully" });
});

// GET /api/admin/:adminId/merchants - Get all merchants assigned to an admin
const getAdminMerchants = asyncHandler(async (request, response) => {
  const { adminId } = request.params;

  const merchants = await prisma.admin_merchant.findMany({
    where: {
      adminId
    },
    include: {
      merchant: {
        include: {
          product: {
            select: {
              id: true
            }
          }
        }
      }
    }
  });

  const merchantList = merchants.map(am => ({
    ...am.merchant,
    assignedAt: am.assignedAt,
    productCount: am.merchant.product.length
  }));

  return response.json(merchantList);
});

module.exports = {
  listAdmins,
  createAdmin,
  assignMerchant,
  unassignMerchant,
  getAdminMerchants
};

