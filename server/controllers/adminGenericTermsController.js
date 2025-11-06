const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ✅ Get all terms
const getTerms = async (req, res) => {
  try {
    const { search, isActive } = req.query;

    const terms = await prisma.genericTerm.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { key: { contains: String(search), mode: "insensitive" } },
                  { value: { contains: String(search), mode: "insensitive" } },
                ],
              }
            : {},
          typeof isActive !== "undefined"
            ? { isActive: isActive === "true" }
            : {},
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: terms });
  } catch (err) {
    console.error("Error fetching terms:", err);
    res.status(500).json({ success: false, message: "Failed to fetch terms" });
  }
};

// ✅ Get single term
const getTerm = async (req, res) => {
  try {
    const { id } = req.params;
    const term = await prisma.genericTerm.findUnique({ where: { id } });
    if (!term)
      return res
        .status(404)
        .json({ success: false, message: "Term not found" });
    res.json({ success: true, data: term });
  } catch (err) {
    console.error("Error fetching term:", err);
    res.status(500).json({ success: false, message: "Failed to get term" });
  }
};

// ✅ Create term
const createTerm = async (req, res) => {
  try {
    const { key, value, isActive } = req.body;

    if (!key || !value)
      return res
        .status(400)
        .json({ success: false, message: "Key and value are required" });

    const created = await prisma.genericTerm.create({
      data: { key, value, isActive: isActive ?? true },
    });

    res.status(201).json({ success: true, data: created });
  } catch (err) {
    if (err.code === "P2002") {
      return res
        .status(409)
        .json({ success: false, message: "Key already exists" });
    }
    console.error("Error creating term:", err);
    res.status(500).json({ success: false, message: "Failed to create term" });
  }
};

// ✅ Update term
const updateTerm = async (req, res) => {
  try {
    const { id } = req.params;
    const { key, value, isActive } = req.body;

    const updated = await prisma.genericTerm.update({
      where: { id },
      data: { key, value, isActive },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Term not found" });
    }
    console.error("Error updating term:", err);
    res.status(500).json({ success: false, message: "Failed to update term" });
  }
};

// ✅ Delete term
const deleteTerm = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.genericTerm.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Term not found" });
    }
    console.error("Error deleting term:", err);
    res.status(500).json({ success: false, message: "Failed to delete term" });
  }
};

module.exports = {
  getTerms,
  getTerm,
  createTerm,
  updateTerm,
  deleteTerm,
};
