const prisma = require("../utills/db");

// GET /api/wallet/balance/:userId
async function getWalletBalance(request, response) {
  try {
    const { userId } = request.params;
    
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        user: {
          select: { email: true, role: true }
        }
      }
    });

    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId,
          balance: 0,
          currency: "INR"
        },
        include: {
          user: {
            select: { email: true, role: true }
          }
        }
      });
    }

    return response.json({
      id: wallet.id,
      balance: wallet.balance,
      currency: wallet.currency,
      isActive: wallet.isActive,
      user: wallet.user
    });
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    return response.status(500).json({ error: "Failed to fetch wallet balance" });
  }
}

// GET /api/wallet/transactions/:userId
async function getWalletTransactions(request, response) {
  try {
    const { userId } = request.params;
    const { page = 1, limit = 10, type, status } = request.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get wallet first
    let wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      return response.json({ transactions: [], total: 0, page: 1, limit: parseInt(limit) });
    }

    // Build where clause
    const where = { walletId: wallet.id };
    if (type) where.type = type;
    if (status) where.status = status;

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.walletTransaction.count({ where })
    ]);

    return response.json({
      transactions,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error("Error fetching wallet transactions:", error);
    return response.status(500).json({ error: "Failed to fetch wallet transactions" });
  }
}

// POST /api/wallet/transactions
async function createWalletTransaction(request, response) {
  try {
    const { userId, amount, type, description, reference, metadata } = request.body;
    
    if (!userId || !amount || !type) {
      return response.status(400).json({ error: "Missing required fields" });
    }

    // Get or create wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId,
          balance: 0,
          currency: "INR"
        }
      });
    }

    // Create transaction
    const transaction = await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        amount: parseInt(amount),
        type,
        description,
        reference,
        metadata,
        status: 'PENDING'
      }
    });

    // Update wallet balance if transaction is completed
    if (type === 'CREDIT') {
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: parseInt(amount) } }
      });
    } else if (type === 'DEBIT' && wallet.balance >= parseInt(amount)) {
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: parseInt(amount) } }
      });
    }

    // Update transaction status
    await prisma.walletTransaction.update({
      where: { id: transaction.id },
      data: { status: 'COMPLETED' }
    });

    return response.json(transaction);
  } catch (error) {
    console.error("Error creating wallet transaction:", error);
    return response.status(500).json({ error: "Failed to create wallet transaction" });
  }
}

// GET /api/wallet/stats
async function getWalletStats(request, response) {
  try {
    const [
      totalWallets,
      totalBalance,
      recentTransactions,
      transactionStats
    ] = await Promise.all([
      prisma.wallet.count(),
      prisma.wallet.aggregate({
        _sum: { balance: true }
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
      }),
      prisma.walletTransaction.groupBy({
        by: ['type', 'status'],
        _count: { id: true },
        _sum: { amount: true }
      })
    ]);

    return response.json({
      totalWallets,
      totalBalance: totalBalance._sum.balance || 0,
      recentTransactions,
      transactionStats
    });
  } catch (error) {
    console.error("Error fetching wallet stats:", error);
    return response.status(500).json({ error: "Failed to fetch wallet stats" });
  }
}

module.exports = {
  getWalletBalance,
  getWalletTransactions,
  createWalletTransaction,
  getWalletStats
};
