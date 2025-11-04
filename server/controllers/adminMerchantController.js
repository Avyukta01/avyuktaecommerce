const prisma = require("../utills/db");// ✅ Make sure this is imported

exports.getMerchantsByAdmin = async (req, res) => {
  try {
    const { adminId } = req.query;
   

    if (!adminId) {
      return res.status(400).json({ message: "Admin ID is required" });
    }

    const adminMerchants = await prisma.admin_merchant.findMany({
      where: { adminId },
      include: { merchant: true },
    });

    

    const merchants = adminMerchants
      .map((item) => item.merchant)
      .filter(Boolean);

    
    res.status(200).json(merchants);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
