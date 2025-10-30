const prisma = require("../utills/db");

// GET /api/admin/stats
// Returns aggregate counts and simple monthly sales data
async function getDashboardStats(request, response) {
  try {
    // Basic aggregates

    const [customers, orders, revenueAgg, walletStats, recentTransactions] = await Promise.all([
      prisma.user.count(),
      prisma.customer_order.count(),
      prisma.customer_order.aggregate({ _sum: { total: true } }),
      prisma.wallet.aggregate({
        _sum: { balance: true },
        _count: { id: true }
      }),
      prisma.walletTransaction.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          wallet: {
            include: {
              user: {
                select: { email: true }
              }
            }
          }
        }
      })
    ]);

    const revenue = revenueAgg?._sum?.total || 0;
    const totalWalletBalance = walletStats._sum.balance || 0;
    const activeWallets = walletStats._count.id || 0;


    // Monthly sales for current year
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const yearOrders = await prisma.customer_order.findMany({
      where: { dateTime: { gte: startOfYear } },
      select: { dateTime: true, total: true },
    });

    const monthlySales = Array(12).fill(0);
    for (const o of yearOrders) {

      if (o.dateTime) {
        const m = new Date(o.dateTime).getMonth();
        monthlySales[m] += Number(o.total || 0);
      }
    }

    // Generate some sample data if no orders exist
    if (yearOrders.length === 0) {
      for (let i = 0; i < 12; i++) {
        monthlySales[i] = Math.floor(Math.random() * 10000) + 5000;
      }
    }

    // Calculate target progress based on revenue vs target
    const monthlyTarget = 100000; // ₹1,00,000 monthly target
    const currentMonthRevenue = monthlySales[now.getMonth()] || 0;
    const targetPercent = Math.min((currentMonthRevenue / monthlyTarget) * 100, 100);

    // Get transaction statistics
    const transactionStats = await prisma.walletTransaction.groupBy({
      by: ['type', 'status'],
      _count: { id: true },
      _sum: { amount: true }
    });


    return response.json({
      customers,
      orders,
      revenue,
      monthlySales,
      targetPercent: Math.round(targetPercent * 100) / 100,
      walletBalance: totalWalletBalance,
      activeWallets,
      recentTransactions,
      transactionStats

    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return response.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
}

module.exports = { getDashboardStats };


