const express = require("express");
const router = express.Router();

const { 
  getWalletBalance, 
  getWalletTransactions, 
  createWalletTransaction,
  getWalletStats 
} = require("../controllers/wallet");

// GET /api/wallet/balance/:userId
router.get("/balance/:userId", getWalletBalance);

// GET /api/wallet/transactions/:userId
router.get("/transactions/:userId", getWalletTransactions);

// POST /api/wallet/transactions
router.post("/transactions", createWalletTransaction);

// GET /api/wallet/stats
router.get("/stats", getWalletStats);

module.exports = router;
