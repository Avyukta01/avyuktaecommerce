const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const multer = require("multer");
const path = require("path");

// ✅ Multer setup (to save uploaded files in /uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder where images are saved
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

exports.upload = multer({ storage });

// ✅ Add image (store file in uploads, save path in DB)
exports.addImage = async (req, res, next) => {
  try {
    // multer adds req.file if file is uploaded
    const { sectionType, title, isActive } = req.body;
    const file = req.file;

    if (!file || !sectionType) {
      return res
        .status(400)
        .json({ success: false, message: "File and sectionType are required" });
    }

    // we only store the path (not actual file)
    const imageUrl = `/uploads/${file.filename}`;

    const image = await prisma.websiteImage.create({
      data: {
        imageUrl,
        sectionType,
        title: title || "",
        isActive: isActive === "true" || isActive === true,
      },
    });

    res.status(201).json({ success: true, data: image });
  } catch (err) {
    console.error("Error adding image:", err);
    next(err);
  }
};

// ✅ Get all images
exports.getAllImages = async (req, res, next) => {
  try {
    const images = await prisma.websiteImage.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ success: true, data: images });
  } catch (err) {
    next(err);
  }
};

// ✅ Delete image
exports.deleteImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.websiteImage.delete({ where: { id } });
    res.json({ success: true, message: "Image deleted" });
  } catch (err) {
    next(err);
  }
};

// ✅ Update image info (optional)
exports.updateImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { sectionType, title, isActive } = req.body;
    const file = req.file;

    const updateData = {
      sectionType,
      title,
      isActive: isActive === "true" || isActive === true,
    };

    if (file) updateData.imageUrl = `/uploads/${file.filename}`;

    const updated = await prisma.websiteImage.update({
      where: { id },
      data: updateData,
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};
