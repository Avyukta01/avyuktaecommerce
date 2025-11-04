const express = require("express");
const router = express.Router();
const { getMerchantsByAdmin } = require("../controllers/adminMerchantController");

router.get("/", getMerchantsByAdmin);

module.exports = router;
