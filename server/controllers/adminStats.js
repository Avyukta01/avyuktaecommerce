const prisma = require("../utills/db");

// GET /api/admin/stats
// Returns aggregate counts and simple monthly sales data
async function getDashboardStats(request, response) {
  try {
    // Basic aggregates
    const [customers, orders, revenueAgg] = await Promise.all([
      prisma.user.count(),
      prisma.customer_order.count(),
      prisma.customer_order.aggregate({ _sum: { total: true } }),
    ]);

    const revenue = revenueAgg?._sum?.total || 0;
// console.log('ohohohoho');
    // Monthly sales for current year
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const yearOrders = await prisma.customer_order.findMany({
      where: { dateTime: { gte: startOfYear } },
      select: { dateTime: true, total: true },
    });

    const monthlySales = Array(12).fill(0);
    for (const o of yearOrders) {
      const m = new Date(o.dateTime).getMonth();
      monthlySales[m] += Number(o.total || 0);
    }

    return response.json({
      customers,
      orders,
      revenue,
      monthlySales,
      targetPercent: 75.55, // UI default; can be computed later
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return response.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
}

module.exports = { getDashboardStats };


