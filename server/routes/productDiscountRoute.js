const express = require("express");
const router = express.Router();
const { upsertProductDiscounts,getProductDiscounts } = require("../controllers/productDiscountController");

router.get("/:productId", getProductDiscounts);

router.post("/", upsertProductDiscounts);

module.exports = router;
